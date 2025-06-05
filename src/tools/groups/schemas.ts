import { z } from 'zod';

export const ListGroupsSchema = z.object({
  filter: z.string().optional().describe('OData filter expression'),
  search: z.string().optional().describe('Search term for group names'),
  top: z.number().min(1).max(999).optional().describe('Number of groups to return (max 999)'),
  orderby: z.string().optional().describe('OData orderBy expression'),
  select: z.string().optional().describe('Comma-separated list of properties to select')
});

export const GetGroupSchema = z.object({
  groupId: z.string().describe('The ID of the group to retrieve'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
  expand: z.string().optional().describe('Comma-separated list of relationships to expand')
});

export const CreateGroupSchema = z.object({
  displayName: z.string().describe('Display name for the group'),
  description: z.string().optional().describe('Description of the group'),
  mailNickname: z.string().describe('Mail nickname for the group'),
  groupTypes: z.array(z.string()).optional().describe('Group types (e.g., ["Unified"] for Microsoft 365 group)'),
  securityEnabled: z.boolean().optional().describe('Whether the group is security-enabled'),
  mailEnabled: z.boolean().optional().describe('Whether the group is mail-enabled'),
  visibility: z.enum(['Private', 'Public', 'HiddenMembership']).optional().describe('Group visibility')
});

export const ManageGroupMembersSchema = z.object({
  groupId: z.string().describe('The ID of the group'),
  operation: z.enum(['add', 'remove', 'list']).describe('Operation to perform'),
  userIds: z.array(z.string()).optional().describe('User IDs for add/remove operations'),
  top: z.number().min(1).max(999).optional().describe('Number of members to return for list operation')
});