/**
 * Resources module exports
 * Centralized export point for all resource providers
 */

export { GraphDocsResourceProvider } from './graph-docs';
export { TroubleshootingResourceProvider } from './troubleshooting-resources';
export { GraphSchemaProvider } from './schema-provider';
export { PermissionProvider } from './permission-provider';
export { DiagnosticsProvider } from './diagnostics-provider';
export { ResourceRegistry } from './resource-registry';

// Export resource types
export type { GraphEndpoint } from './schema-provider';

/**
 * Initialize all resource providers
 */
export function initializeResourceProviders(graphClient: any, cache: any) {
  return new ResourceRegistry(graphClient, cache);
}