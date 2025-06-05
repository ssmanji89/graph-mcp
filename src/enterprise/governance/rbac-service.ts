import { logger } from '../../services/logging-service';
import { Role, UserRole, RBACContext } from './rbac-types';
import { BuiltInRoles } from './rbac-roles';
import { PermissionEvaluator } from './permission-evaluator';

export class RBACService {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();
  private permissionCache: Map<string, boolean> = new Map();
  private permissionEvaluator: PermissionEvaluator;

  constructor() {
    this.permissionEvaluator = new PermissionEvaluator();
    this.initializeBuiltInRoles();
  }

  /**
   * Initialize built-in enterprise roles
   */
  private initializeBuiltInRoles(): void {
    const builtInRoles = BuiltInRoles.getAllRoles();
    builtInRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
    
    logger.info('RBAC built-in roles initialized', { 
      roleCount: this.roles.size 
    });
  }

  /**
   * Check if user has permission for specific action
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    context: RBACContext = {}
  ): Promise<boolean> {
    const cacheKey = `${userId}:${resource}:${action}:${JSON.stringify(context)}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    try {
      const userRoles = this.userRoles.get(userId) || [];
      const hasAccess = await this.permissionEvaluator.evaluatePermissions(
        userRoles, 
        this.roles, 
        resource, 
        action, 
        context
      );

      this.permissionCache.set(cacheKey, hasAccess);
      return hasAccess;
    } catch (error) {
      logger.error('Error checking permission', { 
        error, userId, resource, action 
      });
      return false;
    }
  }