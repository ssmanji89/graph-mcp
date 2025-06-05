import { PermissionAnalysis, OverPrivilegedUser, PermissionInsight } from './intelligence-types';
import { logger } from '../../services/logging-service';

export async function detectOverPrivilegedUsers(rbac: any, analyzeUserPermissions: Function): Promise<OverPrivilegedUser[]> {
  try {
    const allUsers = rbac.getAllUsers();
    const overPrivileged: OverPrivilegedUser[] = [];

    for (const user of allUsers) {
      const analysis = await analyzeUserPermissions(user.id);
      if (analysis.riskScore > 0.7 || analysis.unusedPermissions.length > 5) {
        overPrivileged.push({
          userId: user.id,
          riskScore: analysis.riskScore,
          unusedPermissionCount: analysis.unusedPermissions.length,
          recommendations: analysis.recommendations
        });
      }
    }

    return overPrivileged;
  } catch (error) {
    logger.error('Failed to detect over-privileged users', { error });
    throw error;
  }
}

export async function generateInsights(detectOverPrivilegedUsers: Function): Promise<PermissionInsight[]> {
  try {
    const insights: PermissionInsight[] = [];
    const overPrivileged = await detectOverPrivilegedUsers();
    
    if (overPrivileged.length > 0) {
      insights.push({
        type: 'over_privileged',
        severity: 'high',
        count: overPrivileged.length,
        description: `Found ${overPrivileged.length} over-privileged users`,
        recommendation: 'Review and reduce unnecessary permissions'
      });
    }

    return insights;
  } catch (error) {
    logger.error('Failed to generate insights', { error });
    throw error;
  }
}