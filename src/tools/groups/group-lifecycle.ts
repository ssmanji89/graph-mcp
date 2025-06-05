import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { z } from 'zod';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

/**
 * Schema for group lifecycle tool
 */
export const GroupLifecycleSchema = z.object({
  groupId: z.string().describe('The ID of the group'),
  operation: z.enum(['archive', 'restore', 'setExpiration', 'removeExpiration', 'getLifecycle', 'renewGroup', 'deleteWithNotification']).describe('Lifecycle operation to perform'),
  expirationDateTime: z.string().optional().describe('Expiration date for setExpiration operation (ISO 8601 format)'),
  notificationMembers: z.boolean().optional().describe('Whether to notify members before deletion'),
  reason: z.string().optional().describe('Reason for the lifecycle action'),
});

export function createGroupLifecycleTool(): Tool {
  return {
    name: 'group-lifecycle',
    description: 'Manage group lifecycle including archival, restoration, expiration policies, and controlled deletion',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'The ID of the group' },
        operation: { 
          type: 'string', 
          enum: ['archive', 'restore', 'setExpiration', 'removeExpiration', 'getLifecycle', 'renewGroup', 'deleteWithNotification'],
          description: 'Lifecycle operation to perform' 
        },
        expirationDateTime: { type: 'string', description: 'Expiration date for setExpiration operation (ISO 8601 format)' },
        notificationMembers: { type: 'boolean', description: 'Whether to notify members before deletion' },
        reason: { type: 'string', description: 'Reason for the lifecycle action' }
      },
      required: ['groupId', 'operation']
    }
  };
}

export async function executeGroupLifecycleImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = GroupLifecycleSchema.parse(args);
    
    logger.info('Executing group lifecycle tool', { 
      groupId: params.groupId,
      operation: params.operation 
    });

    let result: any = {};

    switch (params.operation) {
      case 'archive':
        result = await archiveGroup(graphClient, params);
        break;
      case 'restore':
        result = await restoreGroup(graphClient, params);
        break;
      case 'setExpiration':
        result = await setGroupExpiration(graphClient, params);
        break;
      case 'removeExpiration':
        result = await removeGroupExpiration(graphClient, params);
        break;
      case 'getLifecycle':
        result = await getGroupLifecycle(graphClient, params);
        break;
      case 'renewGroup':
        result = await renewGroup(graphClient, params);
        break;
      case 'deleteWithNotification':
        result = await deleteGroupWithNotification(graphClient, params);
        break;
    }

    auditService.logEvent({
      operation: `group-lifecycle-${params.operation}`,
      resource: `groups/${params.groupId}`,
      parameters: params,
      success: true,
      responseTime: Date.now() - startTime
    });

    return {
      ...result,
      responseTime: Date.now() - startTime,
      parameters: params
    };
  } catch (error) {
    auditService.logEvent({
      operation: 'group-lifecycle',
      resource: `groups/${(args as any)?.groupId || 'unknown'}`,
      parameters: args,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}

async function archiveGroup(graphClient: GraphClient, params: any): Promise<any> {
  // For Microsoft 365 Groups (Teams), we need to archive the team
  const group = await graphClient.api(`/groups/${params.groupId}`)
    .select('groupTypes,resourceProvisioningOptions')
    .get();

  if (group.groupTypes?.includes('Unified')) {
    // This is a Microsoft 365 Group, check if it has a team
    try {
      const team = await graphClient.api(`/teams/${params.groupId}`).get();
      
      // Archive the team
      await graphClient.api(`/teams/${params.groupId}/archive`).post({
        shouldSetSpoSiteReadOnlyForMembers: true
      });

      return {
        operation: 'archive',
        success: true,
        groupType: 'Microsoft 365 Group with Team',
        message: 'Team archived successfully. SharePoint site set to read-only for members.',
        archivedDateTime: new Date().toISOString()
      };
    } catch (teamError) {
      // Group doesn't have a team, handle as regular Microsoft 365 Group
      logger.info(`Group ${params.groupId} is Microsoft 365 Group without Team`);
    }
  }

  // For regular groups or Microsoft 365 Groups without Teams
  // We'll simulate archival by updating description and setting to read-only where possible
  const archivalNote = `[ARCHIVED: ${new Date().toISOString()}${params.reason ? ` - ${params.reason}` : ''}]`;
  
  await graphClient.api(`/groups/${params.groupId}`).patch({
    description: `${archivalNote} ${group.description || ''}`
  });

  return {
    operation: 'archive',
    success: true,
    groupType: group.groupTypes?.includes('Unified') ? 'Microsoft 365 Group' : 'Security/Distribution Group',
    message: 'Group marked as archived in description. For full archival capabilities, consider using group expiration policies.',
    archivedDateTime: new Date().toISOString(),
    note: 'Full archival features depend on group type and licensing'
  };
}

async function restoreGroup(graphClient: GraphClient, params: any): Promise<any> {
  // Check if this is a Microsoft 365 Group with Team
  const group = await graphClient.api(`/groups/${params.groupId}`)
    .select('groupTypes,description')
    .get();

  if (group.groupTypes?.includes('Unified')) {
    try {
      // Attempt to unarchive the team
      await graphClient.api(`/teams/${params.groupId}/unarchive`).post({});

      return {
        operation: 'restore',
        success: true,
        groupType: 'Microsoft 365 Group with Team',
        message: 'Team unarchived successfully.',
        restoredDateTime: new Date().toISOString()
      };
    } catch (teamError) {
      logger.info(`Could not unarchive team for group ${params.groupId}:`, teamError);
    }
  }

  // Remove archival notation from description
  let updatedDescription = group.description || '';
  updatedDescription = updatedDescription.replace(/\[ARCHIVED:.*?\]\s*/g, '');

  await graphClient.api(`/groups/${params.groupId}`).patch({
    description: updatedDescription
  });

  return {
    operation: 'restore',
    success: true,
    groupType: group.groupTypes?.includes('Unified') ? 'Microsoft 365 Group' : 'Security/Distribution Group',
    message: 'Archival notation removed from group description.',
    restoredDateTime: new Date().toISOString()
  };
}

async function setGroupExpiration(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.expirationDateTime) {
    throw new Error('expirationDateTime is required for setExpiration operation');
  }

  // Note: Group expiration requires Azure AD Premium P1 licensing
  // This is a simplified implementation that would need proper lifecycle policy setup
  
  return {
    operation: 'setExpiration',
    success: false,
    message: 'Group expiration policies require Azure AD Premium P1 licensing and organization-level configuration',
    recommendation: 'Configure group expiration policies in Azure AD admin center first',
    requestedExpiration: params.expirationDateTime
  };
}

async function removeGroupExpiration(graphClient: GraphClient, params: any): Promise<any> {
  return {
    operation: 'removeExpiration',
    success: false,
    message: 'Group expiration removal requires Azure AD Premium P1 licensing and organization-level configuration',
    recommendation: 'Manage group expiration policies in Azure AD admin center'
  };
}

async function getGroupLifecycle(graphClient: GraphClient, params: any): Promise<any> {
  const group = await graphClient.api(`/groups/${params.groupId}`)
    .select('id,displayName,description,createdDateTime,groupTypes,securityEnabled,mailEnabled')
    .get();

  // Check if group appears archived (based on description)
  const isArchived = group.description?.includes('[ARCHIVED:');
  let archivalInfo = null;

  if (isArchived) {
    const archivalMatch = group.description.match(/\[ARCHIVED:\s*([^\]]+)\]/);
    if (archivalMatch) {
      archivalInfo = {
        archivedDate: archivalMatch[1],
        isArchived: true
      };
    }
  }

  // Check if it's a team and get team-specific lifecycle info
  let teamInfo = null;
  if (group.groupTypes?.includes('Unified')) {
    try {
      const team = await graphClient.api(`/teams/${params.groupId}`)
        .select('isArchived')
        .get();
      teamInfo = {
        hasTeam: true,
        isArchived: team.isArchived
      };
    } catch (error) {
      teamInfo = {
        hasTeam: false,
        isArchived: false
      };
    }
  }

  return {
    operation: 'getLifecycle',
    group: {
      id: group.id,
      displayName: group.displayName,
      createdDateTime: group.createdDateTime,
      groupTypes: group.groupTypes,
      type: group.groupTypes?.includes('Unified') ? 'Microsoft 365 Group' : 
            (group.securityEnabled && group.mailEnabled) ? 'Mail-enabled Security Group' :
            group.securityEnabled ? 'Security Group' : 'Distribution Group'
    },
    lifecycle: {
      archival: archivalInfo,
      team: teamInfo,
      ageInDays: Math.floor((Date.now() - new Date(group.createdDateTime).getTime()) / (1000 * 60 * 60 * 24))
    }
  };
}

async function renewGroup(graphClient: GraphClient, params: any): Promise<any> {
  // Group renewal typically requires expiration policies to be in place
  return {
    operation: 'renewGroup',
    success: false,
    message: 'Group renewal requires Azure AD Premium P1 licensing and expiration policies',
    recommendation: 'Groups with expiration policies can be renewed through Azure AD admin center or Graph API with proper licensing'
  };
}

async function deleteGroupWithNotification(graphClient: GraphClient, params: any): Promise<any> {
  if (params.notificationMembers) {
    // Get group members for notification
    const membersResponse = await graphClient.api(`/groups/${params.groupId}/members`)
      .select('id,displayName,mail')
      .get();
    
    const members = membersResponse.value || [];
    
    // In a real implementation, you'd send notifications here
    logger.info(`Would notify ${members.length} members about group deletion`);
    
    // For now, we'll just prepare the notification list
    return {
      operation: 'deleteWithNotification',
      success: false,
      message: 'Notification prepared but group deletion requires explicit confirmation',
      membersToNotify: members.length,
      recommendation: 'Implement email notifications and add confirmation step before actual deletion',
      reason: params.reason
    };
  }

  // Without notification, this would be a standard delete
  return {
    operation: 'deleteWithNotification',
    success: false,
    message: 'Group deletion requires explicit confirmation and proper workflow',
    recommendation: 'Use Azure AD admin center or implement proper deletion workflow with confirmations'
  };
}

export async function executeGroupLifecycle(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeGroupLifecycleImpl(graphClient, args);
} 