/**
 * Advanced Caching Service
 */

import NodeCache from 'node-cache';
import { logger } from './logger';

export class AdvancedCacheService {
  private nodeCache: NodeCache;
  private stats: { [category: string]: { hits: number; misses: number } } = {};

  constructor() {
    this.nodeCache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false,
    });
  }

  get<T>(key: string, category: string = 'default'): T | undefined {
    const value = this.nodeCache.get<T>(key);
    
    if (!this.stats[category]) {
      this.stats[category] = { hits: 0, misses: 0 };
    }

    if (value !== undefined) {
      this.stats[category].hits++;
    } else {
      this.stats[category].misses++;
    }

    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.nodeCache.set(key, value, ttl || 600);
  }

  del(key: string): number {
    return this.nodeCache.del(key);
  }

  getStats() {
    const totalHits = Object.values(this.stats).reduce((sum, stat) => sum + stat.hits, 0);
    const totalMisses = Object.values(this.stats).reduce((sum, stat) => sum + stat.misses, 0);
    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalHits / (totalHits + totalMisses) || 0,
      keys: this.nodeCache.keys().length
    };
  }
}