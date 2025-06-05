import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { ListMessagesSchema } from './schemas.js';
import { executeListMessagesImpl } from './list-messages-impl.js';

export function createListMessagesTool(): Tool {
  return {
    name: 'list-messages',
    description: 'List email messages from mailbox',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID (defaults to current user)' },
        folder: { type: 'string', description: 'Folder name (inbox, sent, drafts, etc.)' },
        filter: { type: 'string', description: 'OData filter expression' },
        search: { type: 'string', description: 'Search query' },
        top: { type: 'number', minimum: 1, maximum: 999, description: 'Number of messages to return' },
        orderby: { type: 'string', description: 'OData orderBy expression' },
        select: { type: 'string', description: 'Comma-separated list of properties to select' }
      }
    }
  };
}

export async function executeListMessages(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeListMessagesImpl(graphClient, args);
}