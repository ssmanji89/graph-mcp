/**
 * Rate limiting and throttling management service
 * Implements Graph API rate limit handling with exponential backoff
 */

import { logger } from '@/services/logger';
import { AuditService } from '@/services/audit-service';

/**
 * Rate limit information
 */
interface RateLimitInfo {
  /** Requests remaining in current window */
  remaining: number;
  /** Total requests allowed per window */
  limit: number;
  /** Timestamp when window resets */
  resetTime: number;
  /** Requests used in current window */
  used: number;
  /** Last request timestamp */
  lastRequest: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Jitter factor to prevent thundering herd */
  jitterFactor: number;
}

/**
 * Rate limit error
 */
export interface RateLimitError extends Error {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter: number;
  endpoint: string;
  resetTime?: number;
}

/**
 * Rate limiting service
 */
export class RateLimitService {
  private limits = new Map<string, RateLimitInfo>();
  private retryConfig: RetryConfig;
  private auditService?: AuditService;

  constructor(auditService?: AuditService, retryConfig?: Partial<RetryConfig>) {
    this.auditService = auditService;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 60000, // 1 minute
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      ...retryConfig,
    };

    logger.info('Rate limit service initialized', {
      maxRetries: this.retryConfig.maxRetries,
      baseDelay: this.retryConfig.baseDelay,
    });
  }

  /**
   * Update rate limit information from response headers
   */
  updateFromHeaders(endpoint: string, headers: Record<string, string>): void {
    const remaining = this.parseHeader(headers['x-ratelimit-remaining']);
    const limit = this.parseHeader(headers['x-ratelimit-limit']);
    const reset = this.parseHeader(headers['x-ratelimit-reset']);
    const used = this.parseHeader(headers['x-ratelimit-used']);

    if (remaining !== null || limit !== null || reset !== null) {
      const rateLimitInfo: RateLimitInfo = {
        remaining: remaining ?? 0,
        limit: limit ?? 10000, // Default Graph API limit
        resetTime: reset ?? Date.now() + 600000, // Default 10 minutes
        used: used ?? 0,
        lastRequest: Date.now(),
      };

      this.limits.set(endpoint, rateLimitInfo);

      logger.debug('Rate limit updated', {
        endpoint,
        remaining: rateLimitInfo.remaining,
        limit: rateLimitInfo.limit,
        resetTime: new Date(rateLimitInfo.resetTime).toISOString(),
      });

      // Log warning if approaching rate limit
      if (rateLimitInfo.remaining < rateLimitInfo.limit * 0.1) {
        logger.warn('Approaching rate limit', {
          endpoint,
          remaining: rateLimitInfo.remaining,
          limit: rateLimitInfo.limit,
        });
      }
    }
  }

  /**
   * Check if endpoint should be throttled
   */
  shouldThrottle(endpoint: string): boolean {
    const rateLimitInfo = this.limits.get(endpoint);
    
    if (!rateLimitInfo) {
      return false; // No rate limit info, allow request
    }

    // Check if rate limit window has reset
    if (Date.now() >= rateLimitInfo.resetTime) {
      this.limits.delete(endpoint);
      return false;
    }

    // Throttle if very few requests remaining (less than 5% of limit)
    const threshold = Math.max(1, Math.floor(rateLimitInfo.limit * 0.05));
    return rateLimitInfo.remaining <= threshold;
  }

  /**
   * Execute operation with retry logic and exponential backoff
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    endpoint: string,
    operationName = 'Graph API request'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Check if we should throttle before making request
        if (attempt > 0 && this.shouldThrottle(endpoint)) {
          const delay = this.calculatePreemptiveDelay(endpoint);
          if (delay > 0) {
            logger.info(`Preemptive throttling for ${endpoint}, waiting ${delay}ms`);
            await this.sleep(delay);
          }
        }

        const result = await operation();
        
        // Reset any circuit breaker state on success
        if (attempt > 0) {
          logger.info(`${operationName} succeeded after ${attempt} retries`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Check if this is a rate limit error
        if (this.isRateLimitError(error)) {
          const rateLimitError = error as RateLimitError;
          const retryAfter = rateLimitError.retryAfter || this.calculateBackoffDelay(attempt);
          
          // Log rate limit event
          if (this.auditService) {
            await this.auditService.logRateLimit(endpoint, retryAfter, {
              attempt,
              operationName,
            });
          }
          
          if (attempt < this.retryConfig.maxRetries) {
            logger.warn(`Rate limit exceeded for ${endpoint}, retrying in ${retryAfter}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`);
            await this.sleep(retryAfter);
            continue;
          }
        }
        
        // Check if this is a retryable error (5xx, network errors)
        if (this.isRetryableError(error) && attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          logger.warn(`${operationName} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`, {
            error: error.message,
            endpoint,
          });
          await this.sleep(delay);
          continue;
        }
        
        // Non-retryable error or max retries exceeded
        if (attempt === this.retryConfig.maxRetries) {
          logger.error(`${operationName} failed after ${this.retryConfig.maxRetries} retries`, {
            error: error.message,
            endpoint,
          });
        }
        
        throw error;
      }
    }
    
    throw lastError || new Error('Operation failed');
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = this.retryConfig.baseDelay;
    const exponentialDelay = baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    const cappedDelay = Math.min(exponentialDelay, this.retryConfig.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * this.retryConfig.jitterFactor * Math.random();
    
    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Calculate preemptive delay based on rate limit window
   */
  private calculatePreemptiveDelay(endpoint: string): number {
    const rateLimitInfo = this.limits.get(endpoint);
    
    if (!rateLimitInfo) {
      return 0;
    }
    
    // If rate limit window resets soon, wait for it
    const timeUntilReset = rateLimitInfo.resetTime - Date.now();
    if (timeUntilReset > 0 && timeUntilReset < 30000) { // Less than 30 seconds
      return timeUntilReset + 1000; // Add 1 second buffer
    }
    
    // Calculate delay based on remaining requests and time
    if (rateLimitInfo.remaining <= 0) {
      return Math.min(timeUntilReset, this.retryConfig.maxDelay);
    }
    
    return 0;
  }

  /**
   * Check if error is a rate limit error (429)
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      return errorObj.status === 429 || 
             errorObj.code === 'TooManyRequests' ||
             errorObj.code === 'RATE_LIMIT_EXCEEDED';
    }
    return false;
  }

  /**
   * Check if error is retryable (5xx, network errors)
   */
  private isRetryableError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      
      // HTTP 5xx errors
      if (errorObj.status >= 500 && errorObj.status < 600) {
        return true;
      }
      
      // Specific error codes
      const retryableCodes = [
        'ServiceNotAvailable',
        'InternalServerError',
        'BadGateway',
        'ServiceUnavailable',
        'GatewayTimeout',
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
      ];
      
      return retryableCodes.includes(errorObj.code);
    }
    
    return false;
  }

  /**
   * Parse header value to number
   */
  private parseHeader(value: string | undefined): number | null {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get rate limit status for endpoint
   */
  getRateLimitStatus(endpoint: string): RateLimitInfo | null {
    return this.limits.get(endpoint) || null;
  }

  /**
   * Get all rate limit statuses
   */
  getAllRateLimitStatuses(): Map<string, RateLimitInfo> {
    return new Map(this.limits);
  }

  /**
   * Check if any endpoints are rate limited
   */
  hasRateLimitedEndpoints(): boolean {
    for (const [endpoint, info] of this.limits) {
      if (this.shouldThrottle(endpoint)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get rate limit statistics
   */
  getStatistics(): {
    totalEndpoints: number;
    throttledEndpoints: number;
    averageRemainingRequests: number;
    nearLimitEndpoints: number;
  } {
    const endpointCount = this.limits.size;
    let throttledCount = 0;
    let totalRemaining = 0;
    let nearLimitCount = 0;

    for (const [endpoint, info] of this.limits) {
      if (this.shouldThrottle(endpoint)) {
        throttledCount++;
      }
      
      totalRemaining += info.remaining;
      
      // Near limit if less than 20% remaining
      if (info.remaining < info.limit * 0.2) {
        nearLimitCount++;
      }
    }

    return {
      totalEndpoints: endpointCount,
      throttledEndpoints: throttledCount,
      averageRemainingRequests: endpointCount > 0 ? Math.round(totalRemaining / endpointCount) : 0,
      nearLimitEndpoints: nearLimitCount,
    };
  }

  /**
   * Clear rate limit information for endpoint
   */
  clearRateLimit(endpoint: string): void {
    this.limits.delete(endpoint);
    logger.debug(`Cleared rate limit info for ${endpoint}`);
  }

  /**
   * Clear all rate limit information
   */
  clearAllRateLimits(): void {
    this.limits.clear();
    logger.info('Cleared all rate limit information');
  }

  /**
   * Create circuit breaker for specific endpoint
   */
  createCircuitBreaker(endpoint: string, failureThreshold = 5, timeoutMs = 60000): {
    execute: <T>(operation: () => Promise<T>) => Promise<T>;
    isOpen: () => boolean;
    reset: () => void;
  } {
    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    const execute = async <T>(operation: () => Promise<T>): Promise<T> => {
      // Check if circuit is open
      if (isOpen) {
        const timeSinceLastFailure = Date.now() - lastFailureTime;
        if (timeSinceLastFailure < timeoutMs) {
          throw new Error(`Circuit breaker is open for ${endpoint}`);
        } else {
          // Try to close circuit (half-open state)
          isOpen = false;
          failures = Math.floor(failures / 2); // Reduce failure count
        }
      }

      try {
        const result = await this.executeWithRetry(operation, endpoint);
        
        // Reset on success
        failures = 0;
        isOpen = false;
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= failureThreshold) {
          isOpen = true;
          logger.warn(`Circuit breaker opened for ${endpoint} after ${failures} failures`);
        }
        
        throw error;
      }
    };

    const getIsOpen = (): boolean => isOpen;
    
    const reset = (): void => {
      failures = 0;
      isOpen = false;
      lastFailureTime = 0;
      logger.info(`Circuit breaker reset for ${endpoint}`);
    };

    return {
      execute,
      isOpen: getIsOpen,
      reset,
    };
  }
} 