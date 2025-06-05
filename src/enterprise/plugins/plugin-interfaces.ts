import { PluginManifest, PluginPermission } from './plugin-manifest';

export interface Plugin {
  manifest: PluginManifest;
  tools: PluginTool[];
  resources: PluginResource[];
  initialize?: () => Promise<void>;
  dispose?: () => Promise<void>;
}

export interface PluginTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

export interface PluginResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  handler: () => Promise<any>;
}

export interface PluginContext {
  graphClient: any;
  logger: any;
  config: Record<string, any>;
  permissions: PluginPermission[];
}

export interface PluginRegistry {
  installed: Map<string, Plugin>;
  enabled: Set<string>;
  disabled: Set<string>;
}