import { GovernanceIntegration } from './governance-integration';
import { logger } from '../../services/logging-service';

/**
 * Governance Middleware for MCP requests
 */
export class GovernanceMiddleware {
  private governance: GovernanceIntegration;

  constructor(governance: GovernanceIntegration) {
    this.governance = governance;
  }

  /**
   * Middleware function for MCP tool execution
   */
  async checkToolExecution(userId: string, toolName: string, args: any): Promise<boolean> {
    try {
      logger.info('Checking tool execution authorization', { userId, toolName });
      
      const authorized = await this.governance.authorizeOperation(
        userId,
        'execute',
        `tool:${toolName}`,
        args
      );

      if (!authorized) {
        logger.warn('Tool execution denied', { userId, toolName });
      }

      return authorized;
    } catch (error) {
      logger.error('Governance check failed', { error, userId, toolName });
      return false;
    }
  }  /**
   * Middleware function for MCP resource access
   */
  async checkResourceAccess(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    try {
      logger.info('Checking resource access authorization', { userId, resourceType, resourceId });
      
      const authorized = await this.governance.authorizeOperation(
        userId,
        'read',
        `${resourceType}:${resourceId}`
      );

      if (!authorized) {
        logger.warn('Resource access denied', { userId, resourceType, resourceId });
      }

      return authorized;
    } catch (error) {
      logger.error('Resource access check failed', { error, userId, resourceType });
      return false;
    }
  }
}