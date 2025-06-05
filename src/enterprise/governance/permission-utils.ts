import { EnterpriseGovernance } from './index';
import { logger } from '../../services/logging-service';

export async function checkPermission(
  governance: EnterpriseGovernance,
  userId: string, 
  operation: string, 
  resource: string
): Promise<boolean> {
  try {
    const userRoles = governance.rbac.getUserRoles(userId);
    return userRoles.length > 0;
  } catch (error) {
    logger.error('Permission check failed', { error, userId, operation });
    return false;
  }
}