/**
 * Comprehensive error handling service
 * Implements standardized error processing and transformation patterns
 */

import { logger } from '@/services/logger';
import { AuditService } from '@/services/audit-service';
import { GraphError, MCPError, AuthenticationError, ValidationError } from '@/types/errors';

/**
 * Error context information
 */
export interface ErrorContext {
  /** Operation that failed */
  operation: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Request ID for tracing */
  requestId?: string;
  /** User or client identifier */
  actor?: string;
  /** Stack trace information */
  stackTrace?: string;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /** Whether this error can be retried */
  canRetry: boolean;
  /** Suggested retry delay in milliseconds */
  retryDelay?: number;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Fallback action to take */
  fallbackAction?: string;
}

/**
 * Processed error result
 */
export interface ProcessedError {
  /** Standardized error code */
  code: string;
  /** User-friendly error message */
  message: string;
  /** Technical details for developers */
  details?: Record<string, unknown>;
  /** Recovery strategy */
  recovery: ErrorRecoveryStrategy;
  /** HTTP status code */
  statusCode: number;
  /** Error category */
  category: 'Authentication' | 'Authorization' | 'Validation' | 'RateLimit' | 'Network' | 'Internal' | 'NotFound' | 'Conflict';
  /** Original error information */
  originalError?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * Error transformation rules
 */
interface ErrorTransformationRule {
  /** Pattern to match error */
  pattern: RegExp | string | ((error: any) => boolean);
  /** Transform function */
  transform: (error: any, context?: ErrorContext) => ProcessedError;
}

/**
 * Comprehensive error handler
 */
export class ErrorHandler {
  private transformationRules: ErrorTransformationRule[] = [];
  private auditService?: AuditService;

  constructor(auditService?: AuditService) {
    this.auditService = auditService;
    this.initializeTransformationRules();
    
    logger.info('Error handler initialized with comprehensive transformation rules');
  }

  /**
   * Process and transform any error into standardized format
   */
  async processError(error: unknown, context?: ErrorContext): Promise<ProcessedError> {
    try {
      // Log the error for audit
      if (this.auditService && context) {
        await this.auditService.logError(
          error as Error,
          context.operation,
          context.context
        );
      }

      // Apply transformation rules
      const processedError = this.transformError(error, context);
      
      // Log processed error
      logger.error('Error processed', {
        code: processedError.code,
        message: processedError.message,
        category: processedError.category,
        operation: context?.operation,
        requestId: context?.requestId,
      });

      return processedError;
    } catch (processingError) {
      logger.error('Error occurred while processing error', {
        originalError: error,
        processingError,
        context,
      });

      // Return fallback error
      return this.createFallbackError(error, context);
    }
  }

  /**
   * Transform error using registered rules
   */
  private transformError(error: unknown, context?: ErrorContext): ProcessedError {
    for (const rule of this.transformationRules) {
      if (this.matchesPattern(error, rule.pattern)) {
        return rule.transform(error, context);
      }
    }

    // No specific rule found, use generic transformation
    return this.transformGenericError(error, context);
  }

  /**
   * Check if error matches pattern
   */
  private matchesPattern(error: unknown, pattern: RegExp | string | ((error: any) => boolean)): boolean {
    if (typeof pattern === 'function') {
      return pattern(error);
    }

    if (pattern instanceof RegExp) {
      const errorMessage = this.getErrorMessage(error);
      return pattern.test(errorMessage);
    }

    if (typeof pattern === 'string') {
      const errorCode = this.getErrorCode(error);
      return errorCode === pattern || this.getErrorMessage(error).includes(pattern);
    }

    return false;
  }

  /**
   * Initialize error transformation rules
   */
  private initializeTransformationRules(): void {
    // Graph API authentication errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status === 401 || error?.code === 'InvalidAuthenticationToken',
      transform: (error: any, context?: ErrorContext) => ({
        code: 'AUTHENTICATION_FAILED',
        message: 'Authentication failed. Please check your credentials and try again.',
        details: {
          originalCode: error.code,
          originalMessage: error.message,
          operation: context?.operation,
        },
        recovery: {
          canRetry: true,
          retryDelay: 5000,
          maxRetries: 2,
          fallbackAction: 'refresh_token',
        },
        statusCode: 401,
        category: 'Authentication',
        originalError: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      }),
    });

    // Graph API authorization errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status === 403 || error?.code === 'Forbidden',
      transform: (error: any, context?: ErrorContext) => ({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to perform this operation.',
        details: {
          originalCode: error.code,
          requiredPermissions: this.extractRequiredPermissions(error),
          operation: context?.operation,
        },
        recovery: {
          canRetry: false,
          fallbackAction: 'request_permissions',
        },
        statusCode: 403,
        category: 'Authorization',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // Rate limiting errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status === 429 || error?.code === 'TooManyRequests',
      transform: (error: any, context?: ErrorContext) => ({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Request rate limit exceeded. Please wait before retrying.',
        details: {
          retryAfter: error.retryAfter || 60,
          endpoint: context?.context?.endpoint,
        },
        recovery: {
          canRetry: true,
          retryDelay: (error.retryAfter || 60) * 1000,
          maxRetries: 3,
          fallbackAction: 'exponential_backoff',
        },
        statusCode: 429,
        category: 'RateLimit',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // Not found errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status === 404 || error?.code === 'NotFound',
      transform: (error: any, context?: ErrorContext) => ({
        code: 'RESOURCE_NOT_FOUND',
        message: 'The requested resource was not found.',
        details: {
          resourceType: this.extractResourceType(context?.operation),
          operation: context?.operation,
        },
        recovery: {
          canRetry: false,
          fallbackAction: 'verify_resource_id',
        },
        statusCode: 404,
        category: 'NotFound',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // Validation errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status === 400 || error?.code === 'BadRequest',
      transform: (error: any, context?: ErrorContext) => ({
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed. Please check your input parameters.',
        details: {
          validationErrors: this.extractValidationErrors(error),
          operation: context?.operation,
        },
        recovery: {
          canRetry: false,
          fallbackAction: 'fix_validation_errors',
        },
        statusCode: 400,
        category: 'Validation',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // Network errors
    this.transformationRules.push({
      pattern: (error: any) => ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'].includes(error?.code),
      transform: (error: any, context?: ErrorContext) => ({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection and try again.',
        details: {
          networkCode: error.code,
          operation: context?.operation,
        },
        recovery: {
          canRetry: true,
          retryDelay: 5000,
          maxRetries: 3,
          fallbackAction: 'check_connectivity',
        },
        statusCode: 503,
        category: 'Network',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // Server errors
    this.transformationRules.push({
      pattern: (error: any) => error?.status >= 500 && error?.status < 600,
      transform: (error: any, context?: ErrorContext) => ({
        code: 'SERVER_ERROR',
        message: 'A server error occurred. Please try again later.',
        details: {
          statusCode: error.status,
          operation: context?.operation,
        },
        recovery: {
          canRetry: true,
          retryDelay: 10000,
          maxRetries: 2,
          fallbackAction: 'exponential_backoff',
        },
        statusCode: error.status || 500,
        category: 'Internal',
        originalError: {
          message: error.message,
          code: error.code,
        },
      }),
    });

    // MCP protocol errors
    this.transformationRules.push({
      pattern: (error: any) => error instanceof Error && error.message.includes('MCP'),
      transform: (error: any, context?: ErrorContext) => ({
        code: 'MCP_PROTOCOL_ERROR',
        message: 'Model Context Protocol error occurred.',
        details: {
          operation: context?.operation,
        },
        recovery: {
          canRetry: false,
          fallbackAction: 'check_mcp_client',
        },
        statusCode: 500,
        category: 'Internal',
        originalError: {
          message: error.message,
          stack: error.stack,
        },
      }),
    });
  }

  /**
   * Transform generic error
   */
  private transformGenericError(error: unknown, context?: ErrorContext): ProcessedError {
    const errorMessage = this.getErrorMessage(error);
    const errorCode = this.getErrorCode(error);

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: {
        originalMessage: errorMessage,
        originalCode: errorCode,
        operation: context?.operation,
      },
      recovery: {
        canRetry: true,
        retryDelay: 5000,
        maxRetries: 1,
        fallbackAction: 'contact_support',
      },
      statusCode: 500,
      category: 'Internal',
      originalError: {
        message: errorMessage,
        code: errorCode,
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
  }

  /**
   * Create fallback error when processing fails
   */
  private createFallbackError(error: unknown, context?: ErrorContext): ProcessedError {
    return {
      code: 'ERROR_PROCESSING_FAILED',
      message: 'An error occurred while processing the original error.',
      details: {
        operation: context?.operation,
      },
      recovery: {
        canRetry: false,
        fallbackAction: 'contact_support',
      },
      statusCode: 500,
      category: 'Internal',
      originalError: {
        message: this.getErrorMessage(error),
      },
    };
  }

  /**
   * Extract error message from any error type
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      return errorObj.message || errorObj.error?.message || JSON.stringify(error);
    }
    
    return String(error);
  }

  /**
   * Extract error code from any error type
   */
  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      return errorObj.code || errorObj.error?.code || errorObj.status?.toString();
    }
    
    return undefined;
  }

  /**
   * Extract required permissions from authorization error
   */
  private extractRequiredPermissions(error: any): string[] {
    const message = error.message || '';
    const permissions: string[] = [];

    // Common permission patterns in Graph API error messages
    const permissionPatterns = [
      /User\.Read\.All/g,
      /User\.ReadWrite\.All/g,
      /Group\.Read\.All/g,
      /Group\.ReadWrite\.All/g,
      /Mail\.Read/g,
      /Mail\.Send/g,
      /Directory\.Read\.All/g,
    ];

    for (const pattern of permissionPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        permissions.push(...matches);
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Extract resource type from operation name
   */
  private extractResourceType(operation?: string): string {
    if (!operation) return 'unknown';

    if (operation.includes('user')) return 'user';
    if (operation.includes('group')) return 'group';
    if (operation.includes('mail')) return 'mail';
    if (operation.includes('calendar')) return 'calendar';
    if (operation.includes('drive')) return 'drive';
    
    return 'unknown';
  }

  /**
   * Extract validation errors from error response
   */
  private extractValidationErrors(error: any): Array<{ field: string; message: string }> {
    const validationErrors: Array<{ field: string; message: string }> = [];
    
    // Try to extract from various error formats
    if (error.details?.validationErrors) {
      return error.details.validationErrors;
    }
    
    if (error.error?.details) {
      for (const detail of error.error.details) {
        validationErrors.push({
          field: detail.target || 'unknown',
          message: detail.message || 'Validation failed',
        });
      }
    }
    
    return validationErrors;
  }

  /**
   * Create user-friendly error message for client
   */
  createClientError(processedError: ProcessedError): {
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
      canRetry: boolean;
      retryAfter?: number;
    };
  } {
    return {
      error: {
        code: processedError.code,
        message: processedError.message,
        details: processedError.details,
        canRetry: processedError.recovery.canRetry,
        retryAfter: processedError.recovery.retryDelay,
      },
    };
  }

  /**
   * Add custom transformation rule
   */
  addTransformationRule(rule: ErrorTransformationRule): void {
    this.transformationRules.unshift(rule); // Add to beginning for priority
    logger.debug('Added custom error transformation rule');
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalRules: number;
    supportedErrorTypes: string[];
  } {
    const errorTypes = this.transformationRules.map((rule, index) => `Rule_${index + 1}`);
    
    return {
      totalRules: this.transformationRules.length,
      supportedErrorTypes: errorTypes,
    };
  }

  /**
   * Test error transformation
   */
  testTransformation(error: unknown, context?: ErrorContext): ProcessedError {
    return this.transformError(error, context);
  }
} 