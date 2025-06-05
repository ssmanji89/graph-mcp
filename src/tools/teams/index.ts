// Teams management tools exports
export { createListTeamsTool, executeListTeams } from './list-teams.js';
export { createGetTeamTool, executeGetTeam } from './get-team.js';
export { createCreateTeamTool, executeCreateTeam } from './create-team.js';
export { createManageChannelsTool, executeManageChannels } from './manage-channels.js';

// Export all teams tools as an array for easy registration
export const teamsTools = [
  'createListTeamsTool',
  'createGetTeamTool', 
  'createCreateTeamTool',
  'createManageChannelsTool'
] as const;

// Export all teams executors as an object for tool execution mapping
export const teamsExecutors = {
  'list-teams': 'executeListTeams',
  'get-team': 'executeGetTeam',
  'create-team': 'executeCreateTeam',
  'manage-channels': 'executeManageChannels'
} as const;