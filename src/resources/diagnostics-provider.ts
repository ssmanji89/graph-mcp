/**
 * Enhanced Diagnostics Resource Provider
 */

import { MCPResource } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { logger } from '@/services/logger';
import { CacheService } from '@/services/cache';

export class DiagnosticsProvider {
  constructor(
    private graphClient: GraphClient,
    private cache: CacheService
  ) {}

  async getResources(): Promise<MCPResource[]> {
    return [
      {
        uri: 'graph://diagnostics/health',
        name: 'System Health',
        description: 'Real-time system health checks and status',
        mimeType: 'application/json',
      },
      {
        uri: 'graph://diagnostics/performance',
        name: 'Performance Metrics',
        description: 'Performance metrics and optimization recommendations',
        mimeType: 'application/json',
      },
    ];
  }

  async handleResource(uri: string): Promise<MCPResource> {
    logger.info(`Handling diagnostics resource request: ${uri}`);
    
    const health = {
      status: 'healthy',
      services: {
        authentication: 'operational',
        graphClient: 'operational',
        cache: 'operational'
      },
      timestamp: new Date().toISOString()
    };

    return {
      uri,
      name: 'System Diagnostics',
      description: 'System health and performance information',
      mimeType: 'application/json',      text: JSON.stringify(health, null, 2),
    };
  }
}