// Import all tool modules
import * as groupsModule from './tools/groups/index.js';
import * as teamsModule from './tools/teams/index.js';
import * as mailModule from './tools/mail/index.js';
import * as calendarModule from './tools/calendar/index.js';
import * as userModule from './tools/user-tools.js';

export function getToolExecutors(): Record<string, Function> {
  return {
    // User executors
    'list-users': userModule.executeListUsers,
    'get-user': userModule.executeGetUser,
    
    // Group executors
    'list-groups': groupsModule.executeListGroups,
    'get-group': groupsModule.executeGetGroup,
    'create-group': groupsModule.executeCreateGroup,
    'manage-group-members': groupsModule.executeManageGroupMembers,
    
    // Teams executors
    'list-teams': teamsModule.executeListTeams,
    'get-team': teamsModule.executeGetTeam,
    'create-team': teamsModule.executeCreateTeam,
    'manage-channels': teamsModule.executeManageChannels,
    
    // Mail executors
    'send-mail': mailModule.executeSendMail,
    'list-messages': mailModule.executeListMessages,
    'manage-mailbox': mailModule.executeManageMailbox,
    
    // Calendar executors
    'create-event': calendarModule.executeCreateEvent,
    'list-events': calendarModule.executeListEvents
  };
}