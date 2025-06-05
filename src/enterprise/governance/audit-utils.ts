import { EnterpriseGovernance } from './index';
import { logger } from '../../services/logging-service';

export async function logEvent(
  governance: EnterpriseGovernance,
  userId: string, 
  operation: string, 
  resource: string, 
  success: boolean
): Promise<void> {
  try {
    await governance.audit.logEvent({
      operation,
      resource,
      userId,
      success,
      timestamp: new Date(),
      details: { operation, resource }
    });
  } catch (error) {
    logger.error('Failed to log governance event', { error });
  }
}