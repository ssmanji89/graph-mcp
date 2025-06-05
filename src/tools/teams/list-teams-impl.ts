import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { ListTeamsSchema } from './schemas.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeListTeamsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ListTeamsSchema.parse(args);
    let url = '/me/joinedTeams';
    const queryParams: string[] = [];
    
    if (params.filter) queryParams.push(`$filter=${encodeURIComponent(params.filter)}`);
    if (params.top) queryParams.push(`$top=${params.top}`);
    if (params.select) queryParams.push(`$select=${encodeURIComponent(params.select)}`);
    
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    const response = await graphClient.api(url).get();
    
    auditService.logEvent({
      operation: 'list-teams', resource: 'teams', parameters: params,
      success: true, responseTime: Date.now() - startTime, resultCount: response.value?.length || 0
    });
    
    return { teams: response.value || [], totalCount: response.value?.length || 0, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'list-teams', resource: 'teams', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}