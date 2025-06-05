import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { z } from 'zod';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

/**
 * Schema for group analytics tool
 */
export const GroupAnalyticsSchema = z.object({
  groupId: z.string().optional().describe('Specific group ID for detailed analytics'),
  operation: z.enum(['groupUsage', 'membershipAnalytics', 'activityReport', 'licenseUsage']).describe('Type of analytics to generate'),
  period: z.enum(['7days', '30days', '90days']).optional().describe('Analytics period'),
  includeInactiveGroups: z.boolean().optional().describe('Include groups with no recent activity'),
});

export function createGroupAnalyticsTool(): Tool {
  return {
    name: 'group-analytics',
    description: 'Generate comprehensive analytics reports for groups including usage, membership trends, and activity patterns',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Specific group ID for detailed analytics' },
        operation: { 
          type: 'string', 
          enum: ['groupUsage', 'membershipAnalytics', 'activityReport', 'licenseUsage'],
          description: 'Type of analytics to generate' 
        },
        period: { 
          type: 'string', 
          enum: ['7days', '30days', '90days'],
          description: 'Analytics period' 
        },
        includeInactiveGroups: { type: 'boolean', description: 'Include groups with no recent activity' }
      },
      required: ['operation']
    }
  };
}

export async function executeGroupAnalyticsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = GroupAnalyticsSchema.parse(args);
    
    logger.info('Executing group analytics tool', { 
      operation: params.operation,
      groupId: params.groupId,
      period: params.period 
    });

    let result: any = {};

    switch (params.operation) {
      case 'groupUsage':
        result = await generateGroupUsageReport(graphClient, params);
        break;
      case 'membershipAnalytics':
        result = await generateMembershipAnalytics(graphClient, params);
        break;
      case 'activityReport':
        result = await generateActivityReport(graphClient, params);
        break;
      case 'licenseUsage':
        result = await generateLicenseUsageReport(graphClient, params);
        break;
    }

    auditService.logEvent({
      operation: `group-analytics-${params.operation}`,
      resource: params.groupId ? `groups/${params.groupId}` : 'groups',
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
      operation: 'group-analytics',
      resource: 'groups',
      parameters: args,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}

async function generateGroupUsageReport(graphClient: GraphClient, params: any): Promise<any> {
  // Get group statistics
  const groupsResponse = await graphClient.api('/groups')
    .select('id,displayName,groupTypes,membershipRule,createdDateTime,securityEnabled,mailEnabled')
    .top(999)
    .get();

  const groups = groupsResponse.value || [];
  
  const analytics = {
    totalGroups: groups.length,
    groupTypes: {
      security: groups.filter((g: any) => g.securityEnabled && !g.mailEnabled).length,
      distribution: groups.filter((g: any) => g.mailEnabled && !g.securityEnabled).length,
      mailEnabled: groups.filter((g: any) => g.mailEnabled && g.securityEnabled).length,
      microsoft365: groups.filter((g: any) => g.groupTypes?.includes('Unified')).length,
      dynamic: groups.filter((g: any) => g.membershipRule).length
    },
    creationTrends: analyzCreationTrends(groups),
    sizeDistribution: await analyzeGroupSizes(graphClient, groups)
  };

  return {
    operation: 'groupUsage',
    analytics,
    groups: params.groupId ? groups.filter((g: any) => g.id === params.groupId) : groups
  };
}

async function generateMembershipAnalytics(graphClient: GraphClient, params: any): Promise<any> {
  const targetGroups = params.groupId ? [{ id: params.groupId }] : await getGroupsForAnalysis(graphClient);
  
  const membershipData = [];
  
  for (const group of targetGroups.slice(0, 10)) { // Limit to prevent timeout
    try {
      const membersResponse = await graphClient.api(`/groups/${group.id}/members`)
        .select('id,displayName,userType,accountEnabled')
        .get();
      
      const members = membersResponse.value || [];
      
      membershipData.push({
        groupId: group.id,
        totalMembers: members.length,
        userTypes: {
          members: members.filter((m: any) => m.userType === 'Member').length,
          guests: members.filter((m: any) => m.userType === 'Guest').length,
          disabled: members.filter((m: any) => !m.accountEnabled).length
        },
        members: members
      });
    } catch (error) {
      logger.warn(`Failed to get members for group ${group.id}:`, error);
    }
  }

  return {
    operation: 'membershipAnalytics',
    membershipData,
    summary: {
      totalGroups: membershipData.length,
      totalMembers: membershipData.reduce((sum, g) => sum + g.totalMembers, 0),
      averageGroupSize: membershipData.length > 0 ? 
        Math.round(membershipData.reduce((sum, g) => sum + g.totalMembers, 0) / membershipData.length) : 0
    }
  };
}

async function generateActivityReport(graphClient: GraphClient, params: any): Promise<any> {
  // This would require Microsoft Graph reports API (beta endpoint)
  // For now, return basic activity indicators
  
  return {
    operation: 'activityReport',
    message: 'Activity reports require Graph Reports API (currently beta)',
    recommendation: 'Use Microsoft 365 Admin Center or Graph Reports API directly for detailed activity data',
    period: params.period
  };
}

async function generateLicenseUsageReport(graphClient: GraphClient, params: any): Promise<any> {
  const targetGroups = params.groupId ? [{ id: params.groupId }] : await getGroupsForAnalysis(graphClient);
  
  const licenseData = [];
  
  for (const group of targetGroups.slice(0, 5)) { // Limit to prevent timeout
    try {
      const membersResponse = await graphClient.api(`/groups/${group.id}/members`)
        .select('id,assignedLicenses,licenseAssignmentStates')
        .get();
      
      const members = membersResponse.value || [];
      const licensedMembers = members.filter((m: any) => m.assignedLicenses?.length > 0);
      
      licenseData.push({
        groupId: group.id,
        totalMembers: members.length,
        licensedMembers: licensedMembers.length,
        unlicensedMembers: members.length - licensedMembers.length,
        licenseTypes: aggregateLicenseTypes(licensedMembers)
      });
    } catch (error) {
      logger.warn(`Failed to get license data for group ${group.id}:`, error);
    }
  }

  return {
    operation: 'licenseUsage',
    licenseData,
    summary: {
      totalMembers: licenseData.reduce((sum, g) => sum + g.totalMembers, 0),
      licensedMembers: licenseData.reduce((sum, g) => sum + g.licensedMembers, 0),
      licenseUtilization: licenseData.length > 0 ? 
        Math.round((licenseData.reduce((sum, g) => sum + g.licensedMembers, 0) / 
                   licenseData.reduce((sum, g) => sum + g.totalMembers, 0)) * 100) : 0
    }
  };
}

// Helper functions
function analyzCreationTrends(groups: any[]): any {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  return {
    last30Days: groups.filter(g => new Date(g.createdDateTime) > last30Days).length,
    last90Days: groups.filter(g => new Date(g.createdDateTime) > last90Days).length,
    thisYear: groups.filter(g => new Date(g.createdDateTime).getFullYear() === now.getFullYear()).length
  };
}

async function analyzeGroupSizes(graphClient: GraphClient, groups: any[]): Promise<any> {
  const sampleSize = Math.min(groups.length, 20); // Sample for performance
  const sampleGroups = groups.slice(0, sampleSize);
  
  const sizes = [];
  for (const group of sampleGroups) {
    try {
      const membersResponse = await graphClient.api(`/groups/${group.id}/members`).count(true).get();
      sizes.push(parseInt(membersResponse['@odata.count']) || 0);
    } catch (error) {
      logger.warn(`Failed to get size for group ${group.id}`);
    }
  }

  return {
    small: sizes.filter(s => s < 10).length,
    medium: sizes.filter(s => s >= 10 && s < 50).length,
    large: sizes.filter(s => s >= 50 && s < 200).length,
    extraLarge: sizes.filter(s => s >= 200).length,
    averageSize: sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0
  };
}

async function getGroupsForAnalysis(graphClient: GraphClient): Promise<any[]> {
  const response = await graphClient.api('/groups')
    .select('id,displayName')
    .top(50) // Limit for performance
    .get();
  
  return response.value || [];
}

function aggregateLicenseTypes(licensedMembers: any[]): any {
  const licenseCount: { [key: string]: number } = {};
  
  for (const member of licensedMembers) {
    for (const license of member.assignedLicenses || []) {
      const skuId = license.skuId;
      licenseCount[skuId] = (licenseCount[skuId] || 0) + 1;
    }
  }
  
  return licenseCount;
}

export async function executeGroupAnalytics(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeGroupAnalyticsImpl(graphClient, args);
} 