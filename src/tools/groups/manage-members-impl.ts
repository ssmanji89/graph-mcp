import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { ManageGroupMembersSchema } from './schemas.js';
import { addMembers } from './member-operations.js';
import { removeMembers } from './member-remove.js';

const auditService = AuditService.getInstance();

export async function executeManageGroupMembersImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ManageGroupMembersSchema.parse(args);
    let result: any;
    
    switch (params.operation) {
      case 'list':
        result = await listMembers(graphClient, params);
        break;
      case 'add':
        result = await addMembers(graphClient, params);
        break;
      case 'remove':
        result = await removeMembers(graphClient, params);
        break;
    }
    
    auditService.logEvent({
      operation: `manage-group-members-${params.operation}`, resource: `groups/${params.groupId}/members`,
      parameters: params, success: true, responseTime: Date.now() - startTime
    });
    
    return { ...result, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'manage-group-members', resource: `groups/${(args as any)?.groupId || 'unknown'}/members`,
      parameters: args, success: false, error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}

async function listMembers(graphClient: GraphClient, params: any) {
  let url = `/groups/${params.groupId}/members`;
  if (params.top) url += `?$top=${params.top}`;
  const response = await graphClient.api(url).get();
  return { members: response.value || [], totalCount: response.value?.length || 0 };
}