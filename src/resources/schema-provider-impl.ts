/**
 * Schema Provider Implementation
 * Contains the implementation methods for GraphSchemaProvider
 */

import { MCPResource } from '@/types/mcp';
import { logger } from '@/services/logger';
import { CacheService } from '@/services/cache';
import { GraphClient } from '@/graph/graph-client';
import { GraphEndpoint } from './schema-provider';

export class SchemaProviderImpl {
  constructor(
    private graphClient: GraphClient,
    private cache: CacheService
  ) {}

  /**
   * Get endpoints resource with dynamic discovery
   */
  async getEndpointsResource(): Promise<MCPResource> {
    const cacheKey = 'schema:endpoints';
    const cached = this.cache.get<GraphEndpoint[]>(cacheKey);
    
    if (cached) {
      logger.debug('Returning cached endpoints schema');
      return {
        uri: 'graph://schema/endpoints',
        name: 'Graph API Endpoints',
        description: 'Available Graph API endpoints with permissions and parameters',
        mimeType: 'application/json',
        text: JSON.stringify({
          endpoints: cached,
          timestamp: new Date().toISOString(),
          source: 'cache'
        }, null, 2),
      };
    }

    try {
      const endpoints = await this.discoverEndpoints();
      this.cache.set(cacheKey, endpoints, 3600);

      return {
        uri: 'graph://schema/endpoints',
        name: 'Graph API Endpoints',
        description: 'Available Graph API endpoints with permissions and parameters',
        mimeType: 'application/json',
        text: JSON.stringify({
          endpoints,
          timestamp: new Date().toISOString(),
          source: 'live'
        }, null, 2),
      };
    } catch (error) {
      logger.error('Error fetching endpoints schema:', error);
      return this.getStaticEndpointsResource();
    }
  }