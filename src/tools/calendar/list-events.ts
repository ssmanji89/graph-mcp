import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ListEventsSchema } from './schemas.js';
import { executeListEventsImpl } from './list-events-impl.js';

export function createListEventsTool(): Tool {
  return {
    name: 'list-events',
    description: 'List calendar events',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID (defaults to current user)' },
        calendarId: { type: 'string', description: 'Calendar ID (defaults to primary calendar)' },
        startTime: { type: 'string', description: 'Start time filter (ISO 8601)' },
        endTime: { type: 'string', description: 'End time filter (ISO 8601)' },
        filter: { type: 'string', description: 'OData filter expression' },
        top: { type: 'number', minimum: 1, maximum: 999, description: 'Number of events to return' },
        orderby: { type: 'string', description: 'OData orderBy expression' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' }
      }
    }
  };
}

export async function executeListEvents(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeListEventsImpl(graphClient, args);
}