import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { CreateEventSchema } from './schemas.js';
import { buildEventPayload } from './event-builder.js';

const auditService = AuditService.getInstance();

export async function executeCreateEventImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = CreateEventSchema.parse(args);
    const eventData = buildEventPayload(params);
    
    const newEvent = await graphClient.api('/me/events').post(eventData);
    
    auditService.logEvent({
      operation: 'create-event', resource: 'calendar/events', parameters: {
        subject: params.subject, 
        startTime: params.start,
        endTime: params.end,
        attendeeCount: params.attendees?.length || 0
      },
      success: true, responseTime: Date.now() - startTime, resultId: newEvent.id
    });
    
    return { event: newEvent, responseTime: Date.now() - startTime };
  } catch (error) {
    auditService.logEvent({
      operation: 'create-event', resource: 'calendar/events', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}