import { z } from 'zod';

export const ListTeamsSchema = z.object({
  filter: z.string().optional().describe('OData filter expression'),
  top: z.number().min(1).max(999).optional().describe('Number of teams to return (max 999)'),
  select: z.string().optional().describe('Comma-separated list of properties to select')
});

export const GetTeamSchema = z.object({
  teamId: z.string().describe('The ID of the team to retrieve'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
  expand: z.string().optional().describe('Comma-separated list of relationships to expand')
});

export const CreateTeamSchema = z.object({
  displayName: z.string().describe('Display name for the team'),
  description: z.string().optional().describe('Description of the team'),
  visibility: z.enum(['private', 'public']).optional().describe('Team visibility'),
  template: z.string().optional().describe('Team template to use'),
  members: z.array(z.string()).optional().describe('Initial team member user IDs'),
  owners: z.array(z.string()).optional().describe('Team owner user IDs')
});

export const ManageChannelsSchema = z.object({
  teamId: z.string().describe('The ID of the team'),
  operation: z.enum(['list', 'create', 'get', 'update', 'delete']).describe('Operation to perform'),
  channelId: z.string().optional().describe('Channel ID for get/update/delete operations'),
  displayName: z.string().optional().describe('Channel display name for create/update'),
  description: z.string().optional().describe('Channel description for create/update'),
  membershipType: z.enum(['standard', 'private']).optional().describe('Channel membership type for create')
});