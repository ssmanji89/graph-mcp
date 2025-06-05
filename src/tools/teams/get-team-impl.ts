import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { GetTeamSchema } from './schemas.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeGetTeamImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = GetTeamSchema.parse(args);
    let url = `/teams/${params.teamId}`;
    const queryParams: string[] = [];
    
    if (params.select) queryParams.push(`$select=${encodeURIComponent(params.select)}`);
    if (params.expand) queryParams.push(`$expand=${encodeURIComponent(params.expand)}`);
    
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    const team = await graphClient.api(url).get();
    
    auditService.logEvent({
      operation: 'get-team', resource: `teams/${params.teamId}`, parameters: params,
      success: true, responseTime: Date.now() - startTime
    });
    
    return { team, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'get-team', resource: `teams/${(args as any)?.teamId || 'unknown'}`, 
      parameters: args, success: false, error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}