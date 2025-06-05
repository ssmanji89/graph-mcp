import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { ListEventsSchema } from './schemas.js';

const auditService = AuditService.getInstance();

export async function executeListEventsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = ListEventsSchema.parse(args);
    const userPath = params.userId ? `/users/${params.userId}` : '/me';
    const calendarPath = params.calendarId ? `/calendars/${params.calendarId}` : '';
    let url = `${userPath}${calendarPath}/events`;
    
    const queryParams: string[] = [];
    if (params.startTime) queryParams.push(`startTime=${encodeURIComponent(params.startTime)}`);
    if (params.endTime) queryParams.push(`endTime=${encodeURIComponent(params.endTime)}`);
    if (params.filter) queryParams.push(`$filter=${encodeURIComponent(params.filter)}`);
    if (params.top) queryParams.push(`$top=${params.top}`);
    if (params.orderby) queryParams.push(`$orderby=${encodeURIComponent(params.orderby)}`);
    if (params.select) queryParams.push(`$select=${encodeURIComponent(params.select)}`);
    
    if (queryParams.length > 0) url += '?' + queryParams.join('&');
    const response = await graphClient.api(url).get();
    
    auditService.logEvent({
      operation: 'list-events', resource: 'calendar/events', parameters: params,
      success: true, responseTime: Date.now() - startTime, resultCount: response.value?.length || 0
    });
    
    return { 
      events: response.value || [], 
      totalCount: response.value?.length || 0, 
      responseTime: Date.now() - startTime 
    };
  } catch (error) {
    auditService.logEvent({
      operation: 'list-events', resource: 'calendar/events', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}