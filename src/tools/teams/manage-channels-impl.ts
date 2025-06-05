import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { ManageChannelsSchema } from './schemas.js';
import { channelOperations } from './channel-operations.js';

const auditService = AuditService.getInstance();

export async function executeManageChannelsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ManageChannelsSchema.parse(args);
    let result: any;
    
    switch (params.operation) {
      case 'list':
        result = await channelOperations.list(graphClient, params);
        break;
      case 'create':
        result = await channelOperations.create(graphClient, params);
        break;
      case 'get':
        result = await channelOperations.get(graphClient, params);
        break;
      case 'update':
        result = await channelOperations.update(graphClient, params);
        break;
      case 'delete':
        result = await channelOperations.delete(graphClient, params);
        break;
    }
    
    auditService.logEvent({
      operation: `manage-channels-${params.operation}`, resource: `teams/${params.teamId}/channels`,
      parameters: params, success: true, responseTime: Date.now() - startTime
    });
    
    return { ...result, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'manage-channels', resource: `teams/${(args as any)?.teamId || 'unknown'}/channels`,
      parameters: args, success: false, error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}