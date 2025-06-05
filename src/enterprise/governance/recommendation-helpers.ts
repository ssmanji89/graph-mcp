import { logger } from '../../services/logging-service';

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(userRoles: any[], permissions: string[], recentActivity: any[]): string[] {
  try {
    const recommendations: string[] = [];
    
    if (permissions.length > 20) {
      recommendations.push('Consider reducing permission count for better security');
    }
    
    if (userRoles.length > 5) {
      recommendations.push('Review role assignments to reduce complexity');
    }
    
    if (recentActivity.length === 0) {
      recommendations.push('User appears inactive - consider reviewing access');
    }
    
    // Check for admin permissions
    const hasAdminPermissions = permissions.some(p => p.includes('admin'));
    if (hasAdminPermissions) {
      recommendations.push('Review admin permissions for necessity');
    }
    
    return recommendations;
  } catch (error) {
    logger.error('Failed to generate recommendations', { error });
    return [];
  }
}