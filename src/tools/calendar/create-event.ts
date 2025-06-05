import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { CreateEventSchema } from './schemas.js';
import { executeCreateEventImpl } from './create-event-impl.js';

export function createCreateEventTool(): Tool {
  return {
    name: 'create-event',
    description: 'Create a new calendar event',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Event subject' },
        body: { type: 'string', description: 'Event body/description' },
        start: { type: 'string', description: 'Start time (ISO 8601 format)' },
        end: { type: 'string', description: 'End time (ISO 8601 format)' },
        timeZone: { type: 'string', description: 'Time zone' },
        location: { type: 'string', description: 'Event location' },
        attendees: { type: 'array', items: { type: 'string' }, description: 'Attendee email addresses' },
        isAllDay: { type: 'boolean', description: 'All-day event flag' },
        importance: { type: 'string', enum: ['low', 'normal', 'high'], description: 'Event importance' }
      },
      required: ['subject', 'start', 'end']
    }
  };
}

export async function executeCreateEvent(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeCreateEventImpl(graphClient, args);
}