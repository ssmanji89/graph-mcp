import { logger } from '../../services/logging-service';
import { Plugin, PluginManifest } from './plugin-interfaces';
import fs from 'fs/promises';
import path from 'path';

export class PluginLoader {
  private pluginsDirectory: string;

  constructor(pluginsDirectory: string = './plugins') {
    this.pluginsDirectory = pluginsDirectory;
  }

  /**
   * Load plugin from directory
   */
  async loadPlugin(pluginPath: string): Promise<Plugin> {
    try {
      const manifestPath = path.join(pluginPath, 'plugin.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);

      // Validate manifest
      this.validateManifest(manifest);

      // Load plugin main file
      const mainPath = path.join(pluginPath, manifest.main);
      const pluginModule = await import(mainPath);

      if (!pluginModule.default || typeof pluginModule.default !== 'function') {
        throw new Error('Plugin must export a default function');
      }

      const plugin: Plugin = await pluginModule.default();
      plugin.manifest = manifest;

      logger.info('Plugin loaded successfully', { 
        pluginId: manifest.id, 
        version: manifest.version 
      });

      return plugin;
    } catch (error) {
      logger.error('Failed to load plugin', { pluginPath, error });
      throw error;
    }
  }

  /**
   * Validate plugin manifest
   */
  private validateManifest(manifest: PluginManifest): void {
    const required = ['id', 'name', 'version', 'description', 'author', 'main'];
    
    for (const field of required) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }
}