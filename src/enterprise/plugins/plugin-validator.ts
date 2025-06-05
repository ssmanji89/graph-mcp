import { PluginManifest } from './plugin-manifest';

export class PluginValidator {
  /**
   * Validate plugin manifest
   */
  static validateManifest(manifest: PluginManifest): void {
    const required = ['id', 'name', 'version', 'description', 'author', 'main'];
    
    for (const field of required) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
      throw new Error('Plugin must declare permissions');
    }

    // Validate version format
    if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      throw new Error('Invalid version format. Use semantic versioning (x.y.z)');
    }

    // Validate plugin ID format
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      throw new Error('Plugin ID must contain only lowercase letters, numbers, and hyphens');
    }
  }

  /**
   * Validate plugin permissions
   */
  static validatePermissions(manifest: PluginManifest): void {
    const validScopes = ['users', 'groups', 'mail', 'calendar', 'sites', 'security', 'reports'];
    const validActions = ['read', 'write', 'delete', 'admin'];

    for (const permission of manifest.permissions) {
      if (!validScopes.includes(permission.scope)) {
        throw new Error(`Invalid permission scope: ${permission.scope}`);
      }

      for (const action of permission.actions) {
        if (!validActions.includes(action)) {
          throw new Error(`Invalid permission action: ${action}`);
        }
      }
    }
  }

  /**
   * Validate plugin structure
   */
  static validatePluginStructure(plugin: any): void {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object');
    }

    if (!Array.isArray(plugin.tools)) {
      throw new Error('Plugin must export tools array');
    }
  }
}