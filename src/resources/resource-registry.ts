/**
 * Resource Registry
 * Centralized management and discovery of MCP resources
 */

import { MCPResource } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { CacheService } from '@/services/cache';
import { logger } from '@/services/logger';
import { GraphSchemaProvider } from './schema-provider';
import { PermissionProvider } from './permission-provider';
import { DiagnosticsProvider } from './diagnostics-provider';

export class ResourceRegistry {
  private providers: Map<string, any> = new Map();
  private schemaProvider: GraphSchemaProvider;
  private permissionProvider: PermissionProvider;
  private diagnosticsProvider: DiagnosticsProvider;

  constructor(graphClient: GraphClient, cache: CacheService) {
    this.schemaProvider = new GraphSchemaProvider(graphClient, cache);
    this.permissionProvider = new PermissionProvider(graphClient, cache);
    this.diagnosticsProvider = new DiagnosticsProvider(graphClient, cache);
    
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set('schema', this.schemaProvider);
    this.providers.set('permissions', this.permissionProvider);
    this.providers.set('diagnostics', this.diagnosticsProvider);
  }

  async getAllResources(): Promise<MCPResource[]> {
    const allResources: MCPResource[] = [];
    
    for (const [name, provider] of this.providers) {
      try {
        const resources = await provider.getResources();
        allResources.push(...resources);
        logger.debug(`Registered ${resources.length} resources from ${name} provider`);
      } catch (error) {
        logger.error(`Error getting resources from ${name} provider:`, error);
      }
    }
    
    return allResources;
  }  async handleResourceRequest(uri: string): Promise<MCPResource> {
    logger.info(`Handling resource request: ${uri}`);
    
    // Parse URI to determine provider
    const parts = uri.split('://')[1]?.split('/');
    if (!parts || parts.length < 2) {
      throw new Error(`Invalid resource URI: ${uri}`);
    }

    const providerName = parts[0];
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Unknown resource provider: ${providerName}`);
    }

    return await provider.handleResource(uri);
  }
}