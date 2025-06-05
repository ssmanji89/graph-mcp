import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { GetGroupSchema } from './schemas.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeGetGroupImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = GetGroupSchema.parse(args);
    let url = `/groups/${params.groupId}`;
    const queryParams: string[] = [];
    
    if (params.select) queryParams.push(`$select=${encodeURIComponent(params.select)}`);
    if (params.expand) queryParams.push(`$expand=${encodeURIComponent(params.expand)}`);
    
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    const group = await graphClient.api(url).get();
    
    auditService.logEvent({
      operation: 'get-group', resource: `groups/${params.groupId}`, parameters: params,
      success: true, responseTime: Date.now() - startTime
    });
    
    return { group, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'get-group', resource: `groups/${(args as any)?.groupId || 'unknown'}`, 
      parameters: args, success: false, error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}