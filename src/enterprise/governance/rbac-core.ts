import { logger } from '../../services/logging-service';
import { Role, UserRole } from './rbac-types';

export class RBACCore {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();

  /**
   * Add role to system
   */
  addRole(role: Role): void {
    this.roles.set(role.id, role);
    logger.info('Role added', { roleId: role.id });
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Assign role to user
   */
  assignUserRole(userRole: UserRole): void {
    const existing = this.userRoles.get(userRole.userId) || [];
    existing.push(userRole);
    this.userRoles.set(userRole.userId, existing);
    
    logger.info('Role assigned to user', { 
      userId: userRole.userId, 
      roleId: userRole.roleId 
    });
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): UserRole[] {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Remove role from user
   */
  removeUserRole(userId: string, roleId: string): void {
    const existing = this.userRoles.get(userId) || [];
    const updated = existing.filter(ur => ur.roleId !== roleId);
    this.userRoles.set(userId, updated);
  }
}