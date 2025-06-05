export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isBuiltIn: boolean;
  created: Date;
  updated: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

export interface PermissionScope {
  type: 'global' | 'tenant' | 'resource' | 'user';
  resourceIds?: string[];
  tenantId?: string;
  userId?: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'not_in';
  value: any;
}

export interface UserRole {
  userId: string;
  roleId: string;
  scope: PermissionScope;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface RBACContext {
  tenantId?: string;
  resourceId?: string;
  userId?: string;
}