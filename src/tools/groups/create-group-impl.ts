import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { CreateGroupSchema } from './schemas.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeCreateGroupImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = CreateGroupSchema.parse(args);
    const groupData: any = { displayName: params.displayName, mailNickname: params.mailNickname };
    
    if (params.description) groupData.description = params.description;
    if (params.groupTypes) groupData.groupTypes = params.groupTypes;
    if (params.securityEnabled !== undefined) groupData.securityEnabled = params.securityEnabled;
    if (params.mailEnabled !== undefined) groupData.mailEnabled = params.mailEnabled;
    if (params.visibility) groupData.visibility = params.visibility;
    
    // Set defaults for Microsoft 365 groups
    if (params.groupTypes?.includes('Unified')) {
      groupData.securityEnabled = groupData.securityEnabled ?? false;
      groupData.mailEnabled = groupData.mailEnabled ?? true;
    }
    
    const newGroup = await graphClient.api('/groups').post(groupData);
    
    auditService.logEvent({
      operation: 'create-group', resource: 'groups', parameters: params,
      success: true, responseTime: Date.now() - startTime, resultId: newGroup.id
    });
    
    return { group: newGroup, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'create-group', resource: 'groups', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}