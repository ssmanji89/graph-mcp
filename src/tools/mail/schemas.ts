import { z } from 'zod';

export const SendMailSchema = z.object({
  subject: z.string().describe('Email subject'),
  body: z.string().describe('Email body content'),
  bodyType: z.enum(['Text', 'HTML']).optional().describe('Body content type'),
  toRecipients: z.array(z.string()).describe('Email addresses of recipients'),
  ccRecipients: z.array(z.string()).optional().describe('CC recipients'),
  bccRecipients: z.array(z.string()).optional().describe('BCC recipients'),
  importance: z.enum(['Low', 'Normal', 'High']).optional().describe('Email importance'),
  saveToSentItems: z.boolean().optional().describe('Save to sent items folder')
});

export const ListMessagesSchema = z.object({
  userId: z.string().optional().describe('User ID (defaults to current user)'),
  folder: z.string().optional().describe('Folder name (inbox, sent, drafts, etc.)'),
  filter: z.string().optional().describe('OData filter expression'),
  search: z.string().optional().describe('Search query'),
  top: z.number().min(1).max(999).optional().describe('Number of messages to return'),
  orderby: z.string().optional().describe('OData orderBy expression'),
  select: z.string().optional().describe('Comma-separated list of properties to select')
});

export const ManageMailboxSchema = z.object({
  userId: z.string().optional().describe('User ID (defaults to current user)'),
  operation: z.enum(['getSettings', 'updateSettings', 'getUsage', 'createRule', 'listRules']).describe('Operation to perform'),
  settings: z.object({
    automaticRepliesSetting: z.object({
      status: z.enum(['disabled', 'alwaysEnabled', 'scheduled']).optional(),
      externalAudience: z.enum(['all', 'contactsOnly', 'none']).optional(),
      internalReplyMessage: z.string().optional(),
      externalReplyMessage: z.string().optional()
    }).optional(),
    timeZone: z.string().optional(),
    language: z.object({
      locale: z.string().optional(),
      displayName: z.string().optional()
    }).optional()
  }).optional().describe('Mailbox settings for update operation')
});