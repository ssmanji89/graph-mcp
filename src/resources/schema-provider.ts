/**
 * Dynamic Schema Resource Provider
 */

import { MCPResource } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { logger } from '@/services/logger';
import { CacheService } from '@/services/cache';

export class GraphSchemaProvider {
  constructor(
    private graphClient: GraphClient,
    private cache: CacheService
  ) {}

  async getResources(): Promise<MCPResource[]> {
    return [
      {
        uri: 'graph://schema/endpoints',
        name: 'Graph API Endpoints',
        description: 'Dynamic list of available Graph API endpoints',
        mimeType: 'application/json',
      },
      {
        uri: 'graph://schema/entities',
        name: 'Graph API Entities',
        description: 'Schema definitions for Graph API entities',
        mimeType: 'application/json',
      },
    ];
  }

  async handleResource(uri: string): Promise<MCPResource> {
    logger.info(`Handling schema resource request: ${uri}`);
    
    const endpoints = [
      {
        path: '/users',
        methods: ['GET', 'POST'],
        description: 'User management operations',
        permissions: ['User.Read.All', 'User.ReadWrite.All']
      },
      {
        path: '/groups',
        methods: ['GET', 'POST'],
        description: 'Group management operations',
        permissions: ['Group.Read.All', 'Group.ReadWrite.All']
      }
    ];    return {
      uri,
      name: 'Graph API Schema',
      description: 'Graph API endpoint information',
      mimeType: 'application/json',
      text: JSON.stringify({ endpoints, timestamp: new Date().toISOString() }, null, 2),
    };
  }
}