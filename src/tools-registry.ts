import { GraphClient } from './graph/graph-client.js';

// Import all tool modules
import * as groupsModule from './tools/groups/index.js';
import * as teamsModule from './tools/teams/index.js';
import * as mailModule from './tools/mail/index.js';
import * as calendarModule from './tools/calendar/index.js';
import * as userModule from './tools/user-tools.js';

export function getAllTools(graphClient: GraphClient): any[] {
  return [
    // Enhanced User tools
    userModule.createListUsersTool(graphClient),
    userModule.createGetUserTool(graphClient),
    userModule.createBulkCreateUsersTool(graphClient),
    userModule.createBulkUpdateUsersTool(graphClient),
    userModule.createManageUserPhotoTool(graphClient),
    userModule.createManageUserManagerTool(graphClient),
    userModule.createManageUserLicensesTool(graphClient),
    userModule.createListAvailableLicensesTool(graphClient),
    userModule.createManageUserSecurityTool(graphClient),
    
    // Enhanced Group tools
    groupsModule.createListGroupsTool(),
    groupsModule.createGetGroupTool(),
    groupsModule.createCreateGroupTool(),
    groupsModule.createManageGroupMembersTool(),
    groupsModule.createGroupAnalyticsTool(),
    groupsModule.createGroupLifecycleTool(),
    groupsModule.createDynamicGroupsTool(),
    
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