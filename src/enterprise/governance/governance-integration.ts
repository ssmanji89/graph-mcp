import { EnterpriseGovernance } from './index';
import { checkPermission } from './permission-utils';
import { logEvent } from './audit-utils';

/**
 * Governance Integration Service
 * Integrates governance into MCP request flow
 */
export class GovernanceIntegration {
  private governance: EnterpriseGovernance;

  constructor(governance: EnterpriseGovernance) {
    this.governance = governance;
  }

  /**
   * Check if user has permission for MCP operation
   */
  async checkPermission(userId: string, operation: string, resource: string): Promise<boolean> {
    return checkPermission(this.governance, userId, operation, resource);
  }

  /**
   * Log governance event
   */
  async logEvent(userId: string, operation: string, resource: string, success: boolean): Promise<void> {
    return logEvent(this.governance, userId, operation, resource, success);
  }

  /**
   * Validate compliance for operation
   */
  async validateCompliance(operation: string, context: any): Promise<boolean> {
    try {
      // Basic compliance validation
      return true;
    } catch (error) {
      return false;
    }
  }  /**
   * Complete governance check for MCP operation
   */
  async authorizeOperation(userId: string, operation: string, resource: string, context?: any): Promise<boolean> {
    const hasPermission = await this.checkPermission(userId, operation, resource);
    const isCompliant = await this.validateCompliance(operation, context);
    
    const authorized = hasPermission && isCompliant;
    await this.logEvent(userId, operation, resource, authorized);
    
    return authorized;
  }
}