/**
 * Caching service for Microsoft Graph MCP Server
 * Implements intelligent caching strategies with TTL and invalidation
 */

import NodeCache from 'node-cache';
import { logger } from '@/services/logger';

/**
 * Cache entry metadata
 */
interface CacheEntry<T> {
  /** Cached data */
  data: T;
  /** Timestamp when cached */
  timestamp: number;
  /** Time-to-live in seconds */
  ttl: number;
  /** Cache category for bulk operations */
  category: string;
}

/**
 * Cache configuration options
 */
interface CacheConfig {
  /** Default TTL in seconds */
  defaultTtl: number;
  /** Maximum number of cache entries */
  maxSize: number;
  /** Check interval for expired entries (seconds) */
  checkPeriod: number;
}

/**
 * Cache service with intelligent strategies
 */
export class CacheService {
  private cache: NodeCache;
  private config: CacheConfig;
  private hitCount = 0;
  private missCount = 0;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTtl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour default
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
      checkPeriod: 600, // Check every 10 minutes
      ...config,
    };

    this.cache = new NodeCache({
      stdTTL: this.config.defaultTtl,
      maxKeys: this.config.maxSize,
      checkperiod: this.config.checkPeriod,
      useClones: false, // For performance
    });

    // Set up cache event handlers
    this.setupEventHandlers();

    logger.info('Cache service initialized', {
      defaultTtl: this.config.defaultTtl,
      maxSize: this.config.maxSize,
    });
  }

  /**
   * Get cached value
   * @param key Cache key
   * @returns Cached value or undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = this.cache.get<T>(key);
      
      if (value !== undefined) {
        this.hitCount++;
        logger.debug(`Cache hit for key: ${key}`);
        return value;
      }

      this.missCount++;
      logger.debug(`Cache miss for key: ${key}`);
      return undefined;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set cache value with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time-to-live in seconds (optional)
   * @param category Cache category for bulk operations
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    category = 'default'
  ): Promise<boolean> {
    try {
      const effectiveTtl = ttl ?? this.config.defaultTtl;
      const success = this.cache.set(key, value, effectiveTtl);
      
      if (success) {
        logger.debug(`Cache set for key: ${key}, TTL: ${effectiveTtl}s, category: ${category}`);
      } else {
        logger.warn(`Failed to set cache for key: ${key}`);
      }

      return success;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached value
   * @param key Cache key
   * @returns Number of deleted entries
   */
  async delete(key: string): Promise<number> {
    try {
      const deleted = this.cache.del(key);
      logger.debug(`Cache delete for key: ${key}, deleted: ${deleted}`);
      return deleted;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns True if key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error(`Cache has error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - retrieve from cache or execute function and cache result
   * @param key Cache key
   * @param fetcher Function to fetch data if not cached
   * @param ttl Time-to-live in seconds
   * @param category Cache category
   * @returns Cached or fetched value
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    category = 'default'
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch and cache the result
    try {
      const value = await fetcher();
      await this.set(key, value, ttl, category);
      return value;
    } catch (error) {
      logger.error(`Cache getOrSet fetcher error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache by pattern
   * @param pattern Key pattern (supports wildcards)
   * @returns Number of deleted entries
   */
  async clearByPattern(pattern: string): Promise<number> {
    try {
      const keys = this.cache.keys();
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const matchingKeys = keys.filter(key => regex.test(key));
      
      if (matchingKeys.length > 0) {
        const deleted = this.cache.del(matchingKeys);
        logger.info(`Cache cleared by pattern: ${pattern}, deleted: ${deleted} entries`);
        return deleted;
      }

      return 0;
    } catch (error) {
      logger.error(`Cache clearByPattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      this.cache.flushAll();
      this.hitCount = 0;
      this.missCount = 0;
      logger.info('Cache cleared completely');
    } catch (error) {
      logger.error('Cache clearAll error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    keyCount: number;
    maxSize: number;
  } {
    const keyCount = this.cache.keys().length;
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      keyCount,
      maxSize: this.config.maxSize,
    };
  }

  /**
   * Graph API specific caching strategies
   */
  async cacheGraphResponse<T>(
    endpoint: string,
    data: T,
    resourceType: 'user' | 'group' | 'organization' | 'static' = 'static'
  ): Promise<boolean> {
    const ttl = this.getGraphTtl(resourceType);
    const key = `graph:${endpoint}`;
    return this.set(key, data, ttl, `graph-${resourceType}`);
  }

  /**
   * Get TTL based on Graph resource type and volatility
   * @param resourceType Type of Graph resource
   * @returns TTL in seconds
   */
  private getGraphTtl(resourceType: string): number {
    // Per .memory/70-knowledge.md optimization patterns
    switch (resourceType) {
      case 'user':
        return 1800; // 30 minutes - medium volatility
      case 'group':
        return 3600; // 1 hour - low volatility
      case 'organization':
        return 86400; // 24 hours - very low volatility
      case 'static':
        return 3600; // 1 hour - static content
      default:
        return this.config.defaultTtl;
    }
  }

  /**
   * Set up cache event handlers
   */
  private setupEventHandlers(): void {
    this.cache.on('set', (key, value) => {
      logger.debug(`Cache entry set: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache entry deleted: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache entry expired: ${key}`);
    });

    this.cache.on('flush', () => {
      logger.info('Cache flushed');
    });
  }

  /**
   * Close cache service and cleanup
   */
  async close(): Promise<void> {
    try {
      this.cache.close();
      logger.info('Cache service closed');
    } catch (error) {
      logger.error('Cache close error:', error);
    }
  }
} 