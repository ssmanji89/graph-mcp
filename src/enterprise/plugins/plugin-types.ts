export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
  keywords: string[];
  engines: {
    node: string;
    'graph-mcp': string;
  };
  main: string;
  permissions: PluginPermission[];
  dependencies?: Record<string, string>;
}

export interface PluginPermission {
  scope: 'users' | 'groups' | 'mail' | 'calendar' | 'sites' | 'security' | 'reports';
  actions: ('read' | 'write' | 'delete' | 'admin')[];
  resources?: string[];
}

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