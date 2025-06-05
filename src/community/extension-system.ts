/**
 * Community Extension System
 * Enables dynamic loading and management of community-contributed MCP tools and resources
 */

import { z } from 'zod';
import { MCPTool, MCPResource } from '@/types/mcp';
import { logger } from '@/services/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Extension metadata schema
 */
export const ExtensionMetadataSchema = z.object({
  id: z.string().describe('Unique extension identifier'),
  name: z.string().describe('Human-readable extension name'),
  version: z.string().describe('Semantic version string'),
  description: z.string().describe('Extension description'),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }).describe('Extension author information'),
  keywords: z.array(z.string()).optional().describe('Search keywords'),
  license: z.string().default('MIT').describe('License type'),
  repository: z.object({
    type: z.literal('git'),
    url: z.string().url(),
  }).optional().describe('Source repository'),
  dependencies: z.record(z.string()).optional().describe('NPM dependencies'),
  mcpVersion: z.string().describe('Required MCP version compatibility'),
  graphApiScopes: z.array(z.string()).optional().describe('Required Graph API permissions'),
  categories: z.array(z.enum([
    'user-management',
    'group-management', 
    'teams-collaboration',
    'mail-calendar',
    'security-compliance',
    'analytics-reporting',
    'automation-workflows',
    'developer-tools',
    'other'
  ])).describe('Extension categories'),
}).describe('Extension metadata');

export type ExtensionMetadata = z.infer<typeof ExtensionMetadataSchema>;

/**
 * Extension manifest schema
 */
export const ExtensionManifestSchema = z.object({
  metadata: ExtensionMetadataSchema,
  tools: z.array(z.string()).optional().describe('Exported tool names'),
  resources: z.array(z.string()).optional().describe('Exported resource names'),
  prompts: z.array(z.string()).optional().describe('Exported prompt names'),
  entryPoint: z.string().describe('Main module file'),
  configSchema: z.any().optional().describe('Configuration schema'),
}).describe('Extension manifest');

export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;

/**
 * Extension configuration
 */
export interface ExtensionConfig {
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
}

/**
 * Extension instance
 */
export interface ExtensionInstance {
  manifest: ExtensionManifest;
  config: ExtensionConfig;
  module: any;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: any[];
  status: 'loading' | 'loaded' | 'error' | 'disabled';
  error?: Error;
}

/**
 * Extension registry for managing community extensions
 */
export class ExtensionRegistry {
  private extensions = new Map<string, ExtensionInstance>();
  private extensionsPath: string;
  private configPath: string;

  constructor(
    extensionsPath = './extensions',
    configPath = './config/extensions.json'
  ) {
    this.extensionsPath = extensionsPath;
    this.configPath = configPath;
  }

  /**
   * Initialize the extension registry
   */
  async initialize(): Promise<void> {
    logger.info('Initializing extension registry');
    
    try {
      // Ensure extensions directory exists
      await fs.mkdir(this.extensionsPath, { recursive: true });
      
      // Load extension configurations
      await this.loadExtensionConfigs();
      
      // Discover and load extensions
      await this.discoverExtensions();
      
      logger.info(`Extension registry initialized with ${this.extensions.size} extensions`);
    } catch (error) {
      logger.error('Failed to initialize extension registry:', error);
      throw error;
    }
  }

  /**
   * Discover extensions in the extensions directory
   */
  private async discoverExtensions(): Promise<void> {
    try {
      const entries = await fs.readdir(this.extensionsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadExtension(entry.name);
        }
      }
    } catch (error) {
      logger.error('Error discovering extensions:', error);
    }
  }

  /**
   * Load a specific extension
   */
  async loadExtension(extensionId: string): Promise<void> {
    const extensionPath = path.join(this.extensionsPath, extensionId);
    
    try {
      logger.info(`Loading extension: ${extensionId}`);
      
      // Check if extension directory exists
      const stat = await fs.stat(extensionPath);
      if (!stat.isDirectory()) {
        throw new Error(`Extension path is not a directory: ${extensionPath}`);
      }

      // Load extension manifest
      const manifestPath = path.join(extensionPath, 'extension.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifestData = JSON.parse(manifestContent);
      const manifest = ExtensionManifestSchema.parse(manifestData);

      // Get extension configuration
      const config = await this.getExtensionConfig(extensionId);
      
      // Skip if disabled
      if (!config.enabled) {
        logger.info(`Extension ${extensionId} is disabled, skipping`);
        return;
      }

      // Load the extension module
      const modulePath = path.join(extensionPath, manifest.entryPoint);
      const extensionModule = await import(modulePath);

      // Initialize extension instance
      const instance: ExtensionInstance = {
        manifest,
        config,
        module: extensionModule,
        tools: [],
        resources: [],
        prompts: [],
        status: 'loading',
      };

      // Load tools, resources, and prompts
      if (extensionModule.getTools) {
        instance.tools = await extensionModule.getTools(config.settings);
      }
      
      if (extensionModule.getResources) {
        instance.resources = await extensionModule.getResources(config.settings);
      }
      
      if (extensionModule.getPrompts) {
        instance.prompts = await extensionModule.getPrompts(config.settings);
      }

      instance.status = 'loaded';
      this.extensions.set(extensionId, instance);
      
      logger.info(`Extension ${extensionId} loaded successfully`);
      
    } catch (error) {
      logger.error(`Failed to load extension ${extensionId}:`, error);
      
      // Store error state
      this.extensions.set(extensionId, {
        manifest: {} as ExtensionManifest,
        config: { enabled: false, settings: {}, permissions: [] },
        module: null,
        tools: [],
        resources: [],
        prompts: [],
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Get extension configuration
   */
  private async getExtensionConfig(extensionId: string): Promise<ExtensionConfig> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const configs = JSON.parse(configContent);
      
      return configs[extensionId] || {
        enabled: true,
        settings: {},
        permissions: [],
      };
    } catch (error) {
      // Return default config if file doesn't exist
      return {
        enabled: true,
        settings: {},
        permissions: [],
      };
    }
  }

  /**
   * Load extension configurations from file
   */
  private async loadExtensionConfigs(): Promise<void> {
    try {
      await fs.access(this.configPath);
      logger.info('Extension configurations loaded');
    } catch (error) {
      // Create default config file if it doesn't exist
      const defaultConfig = {};
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
      logger.info('Created default extension configuration file');
    }
  }

  /**
   * Get all loaded extensions
   */
  getExtensions(): Map<string, ExtensionInstance> {
    return new Map(this.extensions);
  }

  /**
   * Get all tools from loaded extensions
   */
  getAllTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    
    for (const [extensionId, instance] of this.extensions) {
      if (instance.status === 'loaded') {
        tools.push(...instance.tools);
      }
    }
    
    return tools;
  }

  /**
   * Get all resources from loaded extensions
   */
  getAllResources(): MCPResource[] {
    const resources: MCPResource[] = [];
    
    for (const [extensionId, instance] of this.extensions) {
      if (instance.status === 'loaded') {
        resources.push(...instance.resources);
      }
    }
    
    return resources;
  }

  /**
   * Enable/disable an extension
   */
  async setExtensionEnabled(extensionId: string, enabled: boolean): Promise<void> {
    try {
      // Update configuration
      const configs = await this.loadAllConfigs();
      if (!configs[extensionId]) {
        configs[extensionId] = {
          enabled,
          settings: {},
          permissions: [],
        };
      } else {
        configs[extensionId].enabled = enabled;
      }
      
      await this.saveConfigs(configs);
      
      // Reload extension if enabling, unload if disabling
      if (enabled) {
        await this.loadExtension(extensionId);
      } else {
        this.extensions.delete(extensionId);
      }
      
      logger.info(`Extension ${extensionId} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      logger.error(`Failed to ${enabled ? 'enable' : 'disable'} extension ${extensionId}:`, error);
      throw error;
    }
  }

  /**
   * Install a new extension from package
   */
  async installExtension(packagePath: string): Promise<void> {
    // Implementation for installing extensions from npm packages or zip files
    // This would include validation, dependency resolution, and security checks
    logger.info(`Installing extension from ${packagePath}`);
    // TODO: Implement extension installation logic
  }

  /**
   * Uninstall an extension
   */
  async uninstallExtension(extensionId: string): Promise<void> {
    try {
      logger.info(`Uninstalling extension: ${extensionId}`);
      
      // Remove from memory
      this.extensions.delete(extensionId);
      
      // Remove from configuration
      const configs = await this.loadAllConfigs();
      delete configs[extensionId];
      await this.saveConfigs(configs);
      
      // Remove extension directory
      const extensionPath = path.join(this.extensionsPath, extensionId);
      await fs.rm(extensionPath, { recursive: true, force: true });
      
      logger.info(`Extension ${extensionId} uninstalled successfully`);
    } catch (error) {
      logger.error(`Failed to uninstall extension ${extensionId}:`, error);
      throw error;
    }
  }

  /**
   * Get extension status and health information
   */
  getExtensionStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [extensionId, instance] of this.extensions) {
      status[extensionId] = {
        name: instance.manifest.metadata?.name,
        version: instance.manifest.metadata?.version,
        status: instance.status,
        enabled: instance.config.enabled,
        toolsCount: instance.tools.length,
        resourcesCount: instance.resources.length,
        error: instance.error?.message,
      };
    }
    
    return status;
  }

  /**
   * Load all extension configurations
   */
  private async loadAllConfigs(): Promise<Record<string, ExtensionConfig>> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      return {};
    }
  }

  /**
   * Save extension configurations to file
   */
  private async saveConfigs(configs: Record<string, ExtensionConfig>): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(configs, null, 2));
  }
}

/**
 * Global extension registry instance
 */
export const extensionRegistry = new ExtensionRegistry(); 