/**
 * Connection Pool Manager
 * HTTP connection pooling for Graph client performance optimization
 */

import { logger } from '@/services/logger';

export interface ConnectionPoolOptions {
  maxConnections?: number;
  connectionTimeout?: number;
  keepAlive?: boolean;
}

export class ConnectionPoolManager {
  private maxConnections: number;
  private connectionTimeout: number;
  private keepAlive: boolean;
  private activeConnections: number = 0;

  constructor(options: ConnectionPoolOptions = {}) {
    this.maxConnections = options.maxConnections || 10;
    this.connectionTimeout = options.connectionTimeout || 30000;
    this.keepAlive = options.keepAlive || true;
    
    logger.info('Connection pool initialized', {
      maxConnections: this.maxConnections,
      connectionTimeout: this.connectionTimeout,
      keepAlive: this.keepAlive
    });
  }

  async acquireConnection(): Promise<boolean> {
    if (this.activeConnections >= this.maxConnections) {
      logger.warn('Connection pool exhausted, waiting for available connection');
      return false;
    }
    
    this.activeConnections++;
    logger.debug(`Connection acquired. Active connections: ${this.activeConnections}`);
    return true;
  }

  releaseConnection(): void {
    if (this.activeConnections > 0) {
      this.activeConnections--;
      logger.debug(`Connection released. Active connections: ${this.activeConnections}`);
    }
  }

  getStats() {
    return {
      activeConnections: this.activeConnections,
      maxConnections: this.maxConnections,
      utilizationRate: this.activeConnections / this.maxConnections
    };
  }
}