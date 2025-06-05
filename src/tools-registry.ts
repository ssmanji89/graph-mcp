import { GraphClient } from './graph/graph-client.js';

// Import all tool modules
import * as groupsModule from './tools/groups/index.js';
import * as teamsModule from './tools/teams/index.js';
import * as mailModule from './tools/mail/index.js';
import * as calendarModule from './tools/calendar/index.js';
import * as userModule from './tools/user-tools.js';

export function getAllTools(graphClient: GraphClient): any[] {
  return [
    // User tools
    userModule.createListUsersTool(graphClient),
    userModule.createGetUserTool(graphClient),
    
    // Group tools
    groupsModule.createListGroupsTool(),
    groupsModule.createGetGroupTool(),
    groupsModule.createCreateGroupTool(),
    groupsModule.createManageGroupMembersTool(),
    
    // Teams tools
    teamsModule.createListTeamsTool(),
    teamsModule.createGetTeamTool(),
    teamsModule.createCreateTeamTool(),
    teamsModule.createManageChannelsTool(),
    
    // Mail tools
    mailModule.createSendMailTool(),
    mailModule.createListMessagesTool(),
    mailModule.createManageMailboxTool(),
    
    // Calendar tools
    calendarModule.createCreateEventTool(),
    calendarModule.createListEventsTool()
  ];
}