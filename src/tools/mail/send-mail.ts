import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { SendMailSchema } from './schemas.js';
import { executeSendMailImpl } from './send-mail-impl.js';

export function createSendMailTool(): Tool {
  return {
    name: 'send-mail',
    description: 'Send an email message',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body content' },
        bodyType: { type: 'string', enum: ['Text', 'HTML'], description: 'Body content type' },
        toRecipients: { type: 'array', items: { type: 'string' }, description: 'Email addresses of recipients' },
        ccRecipients: { type: 'array', items: { type: 'string' }, description: 'CC recipients' },
        bccRecipients: { type: 'array', items: { type: 'string' }, description: 'BCC recipients' },
        importance: { type: 'string', enum: ['Low', 'Normal', 'High'], description: 'Email importance' },
        saveToSentItems: { type: 'boolean', description: 'Save to sent items folder' }
      },
      required: ['subject', 'body', 'toRecipients']
    }
  };
}

export async function executeSendMail(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeSendMailImpl(graphClient, args);
}