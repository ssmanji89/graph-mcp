import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { ManageMailboxSchema } from './schemas.js';
import { mailboxOperations } from './mailbox-operations.js';

const auditService = AuditService.getInstance();

export async function executeManageMailboxImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ManageMailboxSchema.parse(args);
    let result: any;
    
    switch (params.operation) {
      case 'getSettings':
        result = await mailboxOperations.getSettings(graphClient, params);
        break;
      case 'updateSettings':
        result = await mailboxOperations.updateSettings(graphClient, params);
        break;
      case 'getUsage':
        result = await mailboxOperations.getUsage(graphClient, params);
        break;
      case 'listRules':
        result = await mailboxOperations.listRules(graphClient, params);
        break;
    }
    
    auditService.logEvent({
      operation: `manage-mailbox-${params.operation}`, resource: 'mail/mailbox',
      parameters: params, success: true, responseTime: Date.now() - startTime
    });
    
    return { ...result, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'manage-mailbox', resource: 'mail/mailbox', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}