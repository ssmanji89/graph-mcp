import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ManageGroupMembersSchema } from './schemas.js';
import { executeManageGroupMembersImpl } from './manage-members-impl.js';

export function createManageGroupMembersTool(): Tool {
  return {
    name: 'manage-group-members',
    description: 'Add, remove, or list members of a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'The ID of the group' },
        operation: { type: 'string', enum: ['add', 'remove', 'list'], description: 'Operation to perform' },
        userIds: { type: 'array', items: { type: 'string' }, description: 'User IDs for add/remove operations' },
        top: { type: 'number', minimum: 1, maximum: 999, description: 'Number of members to return for list operation' }
      },
      required: ['groupId', 'operation']
    }
  };
}

export async function executeManageGroupMembers(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeManageGroupMembersImpl(graphClient, args);
}