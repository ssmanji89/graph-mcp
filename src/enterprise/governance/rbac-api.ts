import { Router } from 'express';
import { z } from 'zod';
import { RBACManager } from './rbac-manager';
import { logger } from '../../services/logging-service';
import { Role, UserRole, Permission } from './rbac-types';

// Validation schemas
const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  permissions: z.array(z.object({
    id: z.string(),
    resource: z.string(),
    action: z.string(),
    scope: z.enum(['tenant', 'group', 'user', 'global'])
  }))
});

const AssignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string(),
  scope: z.enum(['tenant', 'group', 'user', 'global']),
  expiresAt: z.string().datetime().optional()
});

/**
 * RBAC REST API Router
 */
export class RBACAPIRouter {
  private router: Router;
  private rbacManager: RBACManager;

  constructor(rbacManager: RBACManager) {
    this.router = Router();
    this.rbacManager = rbacManager;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Role management endpoints
    this.router.get('/roles', this.getAllRoles.bind(this));
    this.router.get('/roles/:roleId', this.getRole.bind(this));
    this.router.post('/roles', this.createRole.bind(this));
    this.router.put('/roles/:roleId', this.updateRole.bind(this));
    this.router.delete('/roles/:roleId', this.deleteRole.bind(this));

    // User role assignment endpoints
    this.router.get('/users/:userId/roles', this.getUserRoles.bind(this));
    this.router.post('/users/:userId/roles', this.assignUserRole.bind(this));
  }    this.router.delete('/users/:userId/roles/:roleId', this.removeUserRole.bind(this));

    // Permission checking endpoints
    this.router.post('/permissions/check', this.checkPermission.bind(this));
    this.router.get('/permissions/effective/:userId', this.getEffectivePermissions.bind(this));

    // Analytics endpoints
    this.router.get('/analytics/role-usage', this.getRoleUsageAnalytics.bind(this));
    this.router.get('/analytics/permission-matrix', this.getPermissionMatrix.bind(this));
  }

  /**
   * Get all roles
   */
  private async getAllRoles(req: any, res: any): Promise<void> {
    try {
      const roles = this.rbacManager.getAllRoles();
      logger.info('Retrieved all roles', { count: roles.length });
      
      res.json({
        success: true,
        data: roles,
        meta: {
          total: roles.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to retrieve roles', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve roles'
      });
    }
  }

  /**
   * Get specific role
   */
  private async getRole(req: any, res: any): Promise<void> {
    try {
      const { roleId } = req.params;
      const role = this.rbacManager.getRole(roleId);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      logger.info('Retrieved role', { roleId });
      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      logger.error('Failed to retrieve role', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve role'
      });
    }
  }  /**
   * Basic permission check method
   */
  private async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = this.rbacManager.getUserRoles(userId);
    
    for (const userRole of userRoles) {
      const role = this.rbacManager.getRole(userRole.roleId);
      if (role) {
        const hasPermission = role.permissions.some(permission => 
          permission.resource === resource && permission.action === action
        );
        if (hasPermission) {
          return true;
        }
      }
    }
    
    return false;
  }

  getRouter(): Router {
    return this.router;
  }
}