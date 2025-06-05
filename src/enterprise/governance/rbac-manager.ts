import { logger } from '../../services/logging-service';
import { Role, UserRole } from './rbac-types';

export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();

  addRole(role: Role): void {
    this.roles.set(role.id, role);
    logger.info('Role added', { roleId: role.id });
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  assignUserRole(userRole: UserRole): void {
    const existing = this.userRoles.get(userRole.userId) || [];
    existing.push(userRole);
    this.userRoles.set(userRole.userId, existing);
    
    logger.info('Role assigned', { 
      userId: userRole.userId, 
      roleId: userRole.roleId 
    });
  }

  getUserRoles(userId: string): UserRole[] {
    return this.userRoles.get(userId) || [];
  }

  removeUserRole(userId: string, roleId: string): void {
    const existing = this.userRoles.get(userId) || [];
    const updated = existing.filter(ur => ur.roleId !== roleId);
    this.userRoles.set(userId, updated);
    
    logger.info('Role removed', { userId, roleId });
  }
}