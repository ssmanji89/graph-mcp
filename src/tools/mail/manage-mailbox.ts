import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ManageMailboxSchema } from './schemas.js';
import { executeManageMailboxImpl } from './manage-mailbox-impl.js';

export function createManageMailboxTool(): Tool {
  return {
    name: 'manage-mailbox',
    description: 'Manage mailbox settings and configuration',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID (defaults to current user)' },
        operation: { 
          type: 'string', 
          enum: ['getSettings', 'updateSettings', 'getUsage', 'createRule', 'listRules'], 
          description: 'Operation to perform' 
        },
        settings: {
          type: 'object',
          description: 'Mailbox settings for update operation',
          properties: {
            automaticRepliesSetting: { type: 'object' },
            timeZone: { type: 'string' },
            language: { type: 'object' }
          }
        }
      },
      required: ['operation']
    }
  };
}

export async function executeManageMailbox(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeManageMailboxImpl(graphClient, args);
}