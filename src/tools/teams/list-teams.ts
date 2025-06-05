import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ListTeamsSchema } from './schemas.js';
import { executeListTeamsImpl } from './list-teams-impl.js';

export function createListTeamsTool(): Tool {
  return {
    name: 'list-teams',
    description: 'List teams in the organization that the authenticated user is a member of',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'OData filter expression' },
        top: { type: 'number', minimum: 1, maximum: 999, description: 'Number of teams to return (max 999)' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' }
      }
    }
  };
}

export async function executeListTeams(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeListTeamsImpl(graphClient, args);
}