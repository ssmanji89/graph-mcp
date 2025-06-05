// Group management tools exports
export { createListGroupsTool, executeListGroups } from './list-groups.js';
export { createGetGroupTool, executeGetGroup } from './get-group.js';
export { createCreateGroupTool, executeCreateGroup } from './create-group.js';
export { createManageGroupMembersTool, executeManageGroupMembers } from './manage-members.js';

// Export all group tools as an array for easy registration
export const groupTools = [
  'createListGroupsTool',
  'createGetGroupTool', 
  'createCreateGroupTool',
  'createManageGroupMembersTool'
] as const;

// Export all group executors as an object for tool execution mapping
export const groupExecutors = {
  'list-groups': 'executeListGroups',
  'get-group': 'executeGetGroup',
  'create-group': 'executeCreateGroup',
  'manage-group-members': 'executeManageGroupMembers'
} as const;