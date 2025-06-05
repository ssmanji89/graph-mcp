/**
 * Metrics Collection Service
 */

import { logger } from './logger';

export interface Metrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  authentication: {
    tokenRequests: number;
    tokenRefreshes: number;
    failures: number;
  };
}

export class MetricsCollector {
  private metrics: Metrics = {
    requests: { total: 0, success: 0, errors: 0, averageResponseTime: 0 },
    cache: { hits: 0, misses: 0, hitRate: 0 },
    authentication: { tokenRequests: 0, tokenRefreshes: 0, failures: 0 }
  };

  recordRequest(success: boolean, responseTime: number): void {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
    
    // Update average response time
    this.metrics.requests.averageResponseTime = 
      (this.metrics.requests.averageResponseTime + responseTime) / 2;
  }

  recordCacheHit(): void {
    this.metrics.cache.hits++;
    this.updateCacheHitRate();
  }

  recordCacheMiss(): void {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
  }

  private updateCacheHitRate(): void {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? this.metrics.cache.hits / total : 0;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      requests: { total: 0, success: 0, errors: 0, averageResponseTime: 0 },
      cache: { hits: 0, misses: 0, hitRate: 0 },
      authentication: { tokenRequests: 0, tokenRefreshes: 0, failures: 0 }
    };
  }
}