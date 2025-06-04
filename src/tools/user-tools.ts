/**
 * User management MCP tools
 * Implements tools for user lifecycle and administration
 */

import { z } from 'zod';
import { MCPTool, MCPToolResult } from '@/types/mcp';
import { GraphClient } from '@/graph/graph-client';
import { GraphUser, GraphQueryParams } from '@/types/graph';
import { logger } from '@/services/logger';

/**
 * Input schema for list-users tool
 */
const ListUsersInputSchema = z.object({
  filter: z.string().optional().describe('OData filter expression'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
  top: z.number().min(1).max(999).optional().describe('Number of users to return (max 999)'),
  orderBy: z.string().optional().describe('Property to order by'),
}).describe('Parameters for listing users');

type ListUsersInput = z.infer<typeof ListUsersInputSchema>;

/**
 * Create list-users MCP tool
 * @param graphClient Graph API client instance
 * @returns MCP tool definition
 */
export function createListUsersTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'list-users',
    description: 'List users from Microsoft Graph with optional filtering and pagination',
    inputSchema: ListUsersInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = ListUsersInputSchema.parse(params);
        
        logger.info('Executing list-users tool', { params: validatedParams });

        // Build query parameters
        const queryParams: GraphQueryParams = {};
        
        if (validatedParams.filter) {
          queryParams.$filter = validatedParams.filter;
        }
        
        if (validatedParams.select) {
          queryParams.$select = validatedParams.select;
        }
        
        if (validatedParams.top) {
          queryParams.$top = validatedParams.top;
        }
        
        if (validatedParams.orderBy) {
          queryParams.$orderby = validatedParams.orderBy;
        }

        // Execute Graph API request
        const users = await graphClient.executeRequest<GraphUser[]>(async (client) => {
          let request = client.api('/users');
          
          // Add query parameters
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined) {
              request = request.query(key, value.toString());
            }
          });
          
          const response = await request.get();
          return response.value || response;
        });

        logger.info(`Retrieved ${users.length} users`);

        return {
          content: {
            users,
            count: users.length,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in list-users tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'list-users',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for get-user tool
 */
const GetUserInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
}).describe('Parameters for getting a specific user');

type GetUserInput = z.infer<typeof GetUserInputSchema>;

/**
 * Create get-user MCP tool
 * @param graphClient Graph API client instance
 * @returns MCP tool definition
 */
export function createGetUserTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'get-user',
    description: 'Get a specific user from Microsoft Graph by ID or UPN',
    inputSchema: GetUserInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = GetUserInputSchema.parse(params);
        
        logger.info('Executing get-user tool', { params: validatedParams });

        // Execute Graph API request
        const user = await graphClient.executeRequest<GraphUser>(async (client) => {
          let request = client.api(`/users/${validatedParams.userId}`);
          
          if (validatedParams.select) {
            request = request.select(validatedParams.select);
          }
          
          return await request.get();
        });

        logger.info(`Retrieved user: ${user.displayName}`);

        return {
          content: {
            user,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in get-user tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'get-user',
          },
          isError: true,
        };
      }
    },
  };
} 