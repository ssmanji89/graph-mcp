// Group management tools exports
export { createListGroupsTool, executeListGroups } from './list-groups.js';
export { createGetGroupTool, executeGetGroup } from './get-group.js';
export { createCreateGroupTool, executeCreateGroup } from './create-group.js';
export { createManageGroupMembersTool, executeManageGroupMembers } from './manage-members.js';

// Enhanced group tools
export { createGroupAnalyticsTool, executeGroupAnalytics } from './group-analytics.js';
export { createGroupLifecycleTool, executeGroupLifecycle } from './group-lifecycle.js';
export { createDynamicGroupsTool, executeDynamicGroups } from './dynamic-groups.js';

// Export all group tools as an array for easy registration
export const groupTools = [
  'createListGroupsTool',
  'createGetGroupTool', 
  'createCreateGroupTool',
  'createManageGroupMembersTool',
  'createGroupAnalyticsTool',
  'createGroupLifecycleTool',
  'createDynamicGroupsTool'
] as const;

// Export all group executors as an object for tool execution mapping
export const groupExecutors = {
  'list-groups': 'executeListGroups',
  'get-group': 'executeGetGroup',
  'create-group': 'executeCreateGroup',
  'manage-group-members': 'executeManageGroupMembers',
  'group-analytics': 'executeGroupAnalytics',
  'group-lifecycle': 'executeGroupLifecycle',
  'dynamic-groups': 'executeDynamicGroups'
} as const;