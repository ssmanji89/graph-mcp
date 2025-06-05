import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ListGroupsSchema } from './schemas.js';
import { executeListGroupsImpl } from './list-groups-impl.js';

export function createListGroupsTool(): Tool {
  return {
    name: 'list-groups',
    description: 'List groups in the organization with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'OData filter expression' },
        search: { type: 'string', description: 'Search term for group names' },
        top: { type: 'number', minimum: 1, maximum: 999, description: 'Number of groups to return' },
        orderby: { type: 'string', description: 'OData orderBy expression' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' }
      }
    }
  };
}

export async function executeListGroups(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeListGroupsImpl(graphClient, args);
}