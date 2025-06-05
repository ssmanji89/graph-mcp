import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GraphClient } from '../../graph/graph-client.js';
import { Logger } from '../../services/logger.js';
import { AuditService } from '../../services/audit-service.js';
import { z } from 'zod';

const logger = Logger.getInstance();
const auditService = AuditService.getInstance();

/**
 * Schema for dynamic groups management tool
 */
export const DynamicGroupsSchema = z.object({
  operation: z.enum(['create', 'update', 'validateRule', 'getMembers', 'convertToAssigned', 'getRuleExamples']).describe('Dynamic group operation to perform'),
  groupId: z.string().optional().describe('Group ID for update/get operations'),
  displayName: z.string().optional().describe('Display name for new dynamic group'),
  description: z.string().optional().describe('Description for the group'),
  membershipRule: z.string().optional().describe('Dynamic membership rule expression'),
  groupTypes: z.array(z.string()).optional().describe('Group types (e.g., ["Unified"] for Microsoft 365 groups)'),
  securityEnabled: z.boolean().optional().describe('Whether the group is security enabled'),
  mailEnabled: z.boolean().optional().describe('Whether the group is mail enabled'),
  ruleTemplate: z.enum(['department', 'location', 'jobTitle', 'userType', 'custom']).optional().describe('Template for membership rule'),
  templateValue: z.string().optional().describe('Value for rule template'),
});

export function createDynamicGroupsTool(): Tool {
  return {
    name: 'dynamic-groups',
    description: 'Create and manage dynamic groups with membership rules, validate rules, and convert between dynamic and assigned membership',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { 
          type: 'string', 
          enum: ['create', 'update', 'validateRule', 'getMembers', 'convertToAssigned', 'getRuleExamples'],
          description: 'Dynamic group operation to perform' 
        },
        groupId: { type: 'string', description: 'Group ID for update/get operations' },
        displayName: { type: 'string', description: 'Display name for new dynamic group' },
        description: { type: 'string', description: 'Description for the group' },
        membershipRule: { type: 'string', description: 'Dynamic membership rule expression' },
        groupTypes: { type: 'array', items: { type: 'string' }, description: 'Group types (e.g., ["Unified"] for Microsoft 365 groups)' },
        securityEnabled: { type: 'boolean', description: 'Whether the group is security enabled' },
        mailEnabled: { type: 'boolean', description: 'Whether the group is mail enabled' },
        ruleTemplate: { 
          type: 'string', 
          enum: ['department', 'location', 'jobTitle', 'userType', 'custom'],
          description: 'Template for membership rule' 
        },
        templateValue: { type: 'string', description: 'Value for rule template' }
      },
      required: ['operation']
    }
  };
}

export async function executeDynamicGroupsImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = DynamicGroupsSchema.parse(args);
    
    logger.info('Executing dynamic groups tool', { 
      operation: params.operation,
      groupId: params.groupId 
    });

    let result: any = {};

    switch (params.operation) {
      case 'create':
        result = await createDynamicGroup(graphClient, params);
        break;
      case 'update':
        result = await updateDynamicGroup(graphClient, params);
        break;
      case 'validateRule':
        result = await validateMembershipRule(graphClient, params);
        break;
      case 'getMembers':
        result = await getDynamicGroupMembers(graphClient, params);
        break;
      case 'convertToAssigned':
        result = await convertToAssignedGroup(graphClient, params);
        break;
      case 'getRuleExamples':
        result = getRuleExamples();
        break;
    }

    auditService.logEvent({
      operation: `dynamic-groups-${params.operation}`,
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
      operation: 'dynamic-groups',
      resource: 'groups',
      parameters: args,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });
    throw error;
  }
}

async function createDynamicGroup(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.displayName) {
    throw new Error('displayName is required for create operation');
  }

  let membershipRule = params.membershipRule;
  
  // Apply template if specified
  if (params.ruleTemplate && params.templateValue) {
    membershipRule = generateRuleFromTemplate(params.ruleTemplate, params.templateValue);
  }

  if (!membershipRule) {
    throw new Error('membershipRule or ruleTemplate with templateValue is required');
  }

  // Validate the rule syntax first
  const validationResult = await validateMembershipRule(graphClient, { membershipRule });
  if (!validationResult.isValid) {
    throw new Error(`Invalid membership rule: ${validationResult.error}`);
  }

  const groupData = {
    displayName: params.displayName,
    description: params.description || `Dynamic group created with rule: ${membershipRule}`,
    groupTypes: params.groupTypes || [],
    securityEnabled: params.securityEnabled ?? true,
    mailEnabled: params.mailEnabled ?? false,
    membershipRule: membershipRule,
    membershipRuleProcessingState: 'On' // Enable dynamic membership
  };

  const group = await graphClient.api('/groups').post(groupData);

  return {
    operation: 'create',
    success: true,
    group: {
      id: group.id,
      displayName: group.displayName,
      membershipRule: group.membershipRule,
      membershipRuleProcessingState: group.membershipRuleProcessingState
    },
    message: 'Dynamic group created successfully. Member evaluation may take a few minutes.',
    ruleValidation: validationResult
  };
}

async function updateDynamicGroup(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.groupId) {
    throw new Error('groupId is required for update operation');
  }

  const updateData: any = {};

  if (params.membershipRule) {
    // Validate the new rule
    const validationResult = await validateMembershipRule(graphClient, { membershipRule: params.membershipRule });
    if (!validationResult.isValid) {
      throw new Error(`Invalid membership rule: ${validationResult.error}`);
    }
    
    updateData.membershipRule = params.membershipRule;
    updateData.membershipRuleProcessingState = 'On';
  }

  if (params.displayName) updateData.displayName = params.displayName;
  if (params.description) updateData.description = params.description;

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid update fields provided');
  }

  await graphClient.api(`/groups/${params.groupId}`).patch(updateData);

  return {
    operation: 'update',
    success: true,
    groupId: params.groupId,
    updatedFields: Object.keys(updateData),
    message: 'Dynamic group updated successfully. Member evaluation may take a few minutes for rule changes.'
  };
}

async function validateMembershipRule(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.membershipRule) {
    throw new Error('membershipRule is required for validation');
  }

  try {
    // Use the Graph API to validate the rule
    const validationResponse = await graphClient.api('/groups/validateProperties').post({
      displayName: 'TempValidationGroup',
      mailNickname: 'tempvalidation',
      membershipRule: params.membershipRule
    });

    return {
      operation: 'validateRule',
      isValid: true,
      rule: params.membershipRule,
      message: 'Membership rule syntax is valid',
      estimatedMembers: 'Use getMembers operation after group creation to see actual members'
    };
  } catch (error) {
    return {
      operation: 'validateRule',
      isValid: false,
      rule: params.membershipRule,
      error: error instanceof Error ? error.message : 'Rule validation failed',
      suggestions: getRuleSyntaxHelp()
    };
  }
}

async function getDynamicGroupMembers(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.groupId) {
    throw new Error('groupId is required for getMembers operation');
  }

  // Get group info first
  const group = await graphClient.api(`/groups/${params.groupId}`)
    .select('displayName,membershipRule,membershipRuleProcessingState')
    .get();

  if (!group.membershipRule) {
    throw new Error('Group is not a dynamic group');
  }

  // Get current members
  const membersResponse = await graphClient.api(`/groups/${params.groupId}/members`)
    .select('id,displayName,userPrincipalName,department,jobTitle,officeLocation,userType')
    .get();

  const members = membersResponse.value || [];

  return {
    operation: 'getMembers',
    group: {
      id: params.groupId,
      displayName: group.displayName,
      membershipRule: group.membershipRule,
      processingState: group.membershipRuleProcessingState
    },
    members: {
      count: members.length,
      users: members
    },
    message: group.membershipRuleProcessingState === 'Paused' ? 
      'Dynamic membership processing is paused for this group' : 
      'Showing current dynamic membership results'
  };
}

async function convertToAssignedGroup(graphClient: GraphClient, params: any): Promise<any> {
  if (!params.groupId) {
    throw new Error('groupId is required for convertToAssigned operation');
  }

  // Get current group state
  const group = await graphClient.api(`/groups/${params.groupId}`)
    .select('displayName,membershipRule,membershipRuleProcessingState')
    .get();

  if (!group.membershipRule) {
    throw new Error('Group is not a dynamic group');
  }

  // Convert to assigned membership by removing rule and setting processing state to Paused
  await graphClient.api(`/groups/${params.groupId}`).patch({
    membershipRule: null,
    membershipRuleProcessingState: 'Paused'
  });

  return {
    operation: 'convertToAssigned',
    success: true,
    groupId: params.groupId,
    previousRule: group.membershipRule,
    message: 'Group converted to assigned membership. Current members remain but no new dynamic evaluation will occur.',
    recommendation: 'You can now manually add/remove members using standard group membership operations'
  };
}

function getRuleExamples(): any {
  return {
    operation: 'getRuleExamples',
    examples: [
      {
        name: 'Department-based',
        rule: 'user.department -eq "Sales"',
        description: 'All users in the Sales department'
      },
      {
        name: 'Location-based',
        rule: 'user.officeLocation -eq "Seattle"',
        description: 'All users located in Seattle office'
      },
      {
        name: 'Job Title',
        rule: 'user.jobTitle -contains "Manager"',
        description: 'All users with Manager in their job title'
      },
      {
        name: 'User Type',
        rule: 'user.userType -eq "Guest"',
        description: 'All guest users'
      },
      {
        name: 'Multiple Conditions (AND)',
        rule: '(user.department -eq "IT") -and (user.officeLocation -eq "New York")',
        description: 'Users in IT department AND located in New York'
      },
      {
        name: 'Multiple Conditions (OR)',
        rule: '(user.department -eq "Sales") -or (user.department -eq "Marketing")',
        description: 'Users in either Sales OR Marketing departments'
      },
      {
        name: 'Exclude Condition',
        rule: '(user.department -eq "Engineering") -and (user.jobTitle -notContains "Intern")',
        description: 'Engineering users who are not interns'
      },
      {
        name: 'Account Enabled',
        rule: 'user.accountEnabled -eq true',
        description: 'All enabled user accounts'
      }
    ],
    operators: [
      { operator: '-eq', description: 'Equals' },
      { operator: '-ne', description: 'Not equals' },
      { operator: '-contains', description: 'Contains (case insensitive)' },
      { operator: '-notContains', description: 'Does not contain' },
      { operator: '-in', description: 'In list' },
      { operator: '-notIn', description: 'Not in list' },
      { operator: '-startsWith', description: 'Starts with' },
      { operator: '-notStartsWith', description: 'Does not start with' }
    ],
    commonAttributes: [
      'user.department',
      'user.jobTitle',
      'user.officeLocation',
      'user.userType',
      'user.accountEnabled',
      'user.companyName',
      'user.country',
      'user.city',
      'user.state',
      'user.userPrincipalName'
    ]
  };
}

function generateRuleFromTemplate(template: string, value: string): string {
  const templates = {
    department: `user.department -eq "${value}"`,
    location: `user.officeLocation -eq "${value}"`,
    jobTitle: `user.jobTitle -contains "${value}"`,
    userType: `user.userType -eq "${value}"`,
    custom: value // For custom template, use the value as-is
  };

  return templates[template as keyof typeof templates] || value;
}

function getRuleSyntaxHelp(): string[] {
  return [
    'Use proper syntax: (attribute operator value)',
    'Enclose string values in double quotes',
    'Use -and/-or for multiple conditions',
    'Common attributes: user.department, user.jobTitle, user.officeLocation',
    'Example: user.department -eq "Sales"'
  ];
}

export async function executeDynamicGroups(graphClient: GraphClient, args: unknown): Promise<any> {
  return executeDynamicGroupsImpl(graphClient, args);
} 