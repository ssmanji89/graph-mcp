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