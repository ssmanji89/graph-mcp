import { RBACManager } from './rbac-manager';
import { AuditCore } from './audit-core';
import { logger } from '../../services/logging-service';
import { PermissionAnalysis, OverPrivilegedUser, PermissionInsight } from './intelligence-types';
import { findUnusedPermissions, calculateRiskScore } from './permission-helpers';
import { generateRecommendations } from './recommendation-helpers';
import { detectOverPrivilegedUsers, generateInsights } from './permission-intelligence-impl';

/**
 * Permission Intelligence Service
 */
export class PermissionIntelligence {
  private rbac: RBACManager;
  private audit: AuditCore;

  constructor(rbac: RBACManager, audit: AuditCore) {
    this.rbac = rbac;
    this.audit = audit;
  }

  async analyzeUserPermissions(userId: string): Promise<PermissionAnalysis> {
    try {
      const userRoles = this.rbac.getUserRoles(userId);
      const permissions = this.rbac.getUserPermissions(userId);
      const recentActivity = await this.audit.getUserActivity(userId, 30);

      return {
        userId,
        totalRoles: userRoles.length,
        totalPermissions: permissions.length,
        unusedPermissions: await findUnusedPermissions(userId, recentActivity),
        riskScore: calculateRiskScore(permissions),
        recommendations: generateRecommendations(userRoles, permissions, recentActivity)
      };
    } catch (error) {
      logger.error('Failed to analyze user permissions', { error, userId });
      throw error;
    }
  }  async detectOverPrivilegedUsers(): Promise<OverPrivilegedUser[]> {
    return detectOverPrivilegedUsers(this.rbac, this.analyzeUserPermissions.bind(this));
  }

  async generateInsights(): Promise<PermissionInsight[]> {
    return generateInsights(this.detectOverPrivilegedUsers.bind(this));
  }
}