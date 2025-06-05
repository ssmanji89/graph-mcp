import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { GetTeamSchema } from './schemas.js';
import { executeGetTeamImpl } from './get-team-impl.js';

export function createGetTeamTool(): Tool {
  return {
    name: 'get-team',
    description: 'Get detailed information about a specific team',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'The ID of the team to retrieve' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' },
        expand: { type: 'string', description: 'Comma-separated list of relationships to expand' }
      },
      required: ['teamId']
    }
  };
}

export async function executeGetTeam(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeGetTeamImpl(graphClient, args);
}