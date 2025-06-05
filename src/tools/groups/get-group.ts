import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { GetGroupSchema } from './schemas.js';
import { executeGetGroupImpl } from './get-group-impl.js';

export function createGetGroupTool(): Tool {
  return {
    name: 'get-group',
    description: 'Get detailed information about a specific group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'The ID of the group to retrieve' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' },
        expand: { type: 'string', description: 'Comma-separated list of relationships to expand' }
      },
      required: ['groupId']
    }
  };
}

export async function executeGetGroup(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeGetGroupImpl(graphClient, args);
}