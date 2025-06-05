import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ManageChannelsSchema } from './schemas.js';
import { executeManageChannelsImpl } from './manage-channels-impl.js';

export function createManageChannelsTool(): Tool {
  return {
    name: 'manage-channels',
    description: 'Manage channels within a team (list, create, get, update, delete)',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'The ID of the team' },
        operation: { type: 'string', enum: ['list', 'create', 'get', 'update', 'delete'], description: 'Operation to perform' },
        channelId: { type: 'string', description: 'Channel ID for get/update/delete operations' },
        displayName: { type: 'string', description: 'Channel display name for create/update' },
        description: { type: 'string', description: 'Channel description for create/update' },
        membershipType: { type: 'string', enum: ['standard', 'private'], description: 'Channel membership type for create' }
      },
      required: ['teamId', 'operation']
    }
  };
}

export async function executeManageChannels(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeManageChannelsImpl(graphClient, args);
}