import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { CreateTeamSchema } from './schemas.js';
import { executeCreateTeamImpl } from './create-team-impl.js';

export function createCreateTeamTool(): Tool {
  return {
    name: 'create-team',
    description: 'Create a new team in Microsoft Teams',
    inputSchema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', description: 'Display name for the team' },
        description: { type: 'string', description: 'Description of the team' },
        visibility: { type: 'string', enum: ['private', 'public'], description: 'Team visibility' },
        template: { type: 'string', description: 'Team template to use' },
        members: { type: 'array', items: { type: 'string' }, description: 'Initial team member user IDs' },
        owners: { type: 'array', items: { type: 'string' }, description: 'Team owner user IDs' }
      },
      required: ['displayName']
    }
  };
}

export async function executeCreateTeam(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeCreateTeamImpl(graphClient, args);
}