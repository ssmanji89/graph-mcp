import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { CreateGroupSchema } from './schemas.js';
import { executeCreateGroupImpl } from './create-group-impl.js';

export function createCreateGroupTool(): Tool {
  return {
    name: 'create-group',
    description: 'Create a new group in the organization',
    inputSchema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', description: 'Display name for the group' },
        description: { type: 'string', description: 'Description of the group' },
        mailNickname: { type: 'string', description: 'Mail nickname for the group' },
        groupTypes: { type: 'array', items: { type: 'string' }, description: 'Group types' },
        securityEnabled: { type: 'boolean', description: 'Whether the group is security-enabled' },
        mailEnabled: { type: 'boolean', description: 'Whether the group is mail-enabled' },
        visibility: { type: 'string', enum: ['Private', 'Public', 'HiddenMembership'], description: 'Group visibility' }
      },
      required: ['displayName', 'mailNickname']
    }
  };
}

export async function executeCreateGroup(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeCreateGroupImpl(graphClient, args);
}