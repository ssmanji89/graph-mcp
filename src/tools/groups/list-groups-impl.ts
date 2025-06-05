import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { ListGroupsSchema } from './schemas.js';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

export async function executeListGroupsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ListGroupsSchema.parse(args);
    let url = '/groups';
    const queryParams: string[] = [];
    
    if (params.filter) queryParams.push(`$filter=${encodeURIComponent(params.filter)}`);
    if (params.search) queryParams.push(`$search="${encodeURIComponent(params.search)}"`);
    if (params.top) queryParams.push(`$top=${params.top}`);
    if (params.orderby) queryParams.push(`$orderby=${encodeURIComponent(params.orderby)}`);
    if (params.select) queryParams.push(`$select=${encodeURIComponent(params.select)}`);
    
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    const response = await graphClient.api(url).get();
    
    auditService.logEvent({
      operation: 'list-groups', resource: 'groups', parameters: params,
      success: true, responseTime: Date.now() - startTime, resultCount: response.value?.length || 0
    });
    
    return { 
      groups: response.value || [], 
      totalCount: response.value?.length || 0, 
      responseTime: Date.now() - startTime 
    };
  } catch (error) {
    auditService.logEvent({
      operation: 'list-groups', resource: 'groups', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}