// Mail management tools exports
export { createSendMailTool, executeSendMail } from './send-mail.js';
export { createListMessagesTool, executeListMessages } from './list-messages.js';
export { createManageMailboxTool, executeManageMailbox } from './manage-mailbox.js';

// Export all mail tools as an array for easy registration
export const mailTools = [
  'createSendMailTool',
  'createListMessagesTool',
  'createManageMailboxTool'
] as const;

// Export all mail executors as an object for tool execution mapping
export const mailExecutors = {
  'send-mail': 'executeSendMail',
  'list-messages': 'executeListMessages',
  'manage-mailbox': 'executeManageMailbox'
} as const;