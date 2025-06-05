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
 * Enhanced input schema for list-users tool with advanced filtering
 */
const ListUsersInputSchema = z.object({
  filter: z.string().optional().describe('OData filter expression (e.g., "accountEnabled eq true")'),
  search: z.string().optional().describe('Search term for displayName, mail, or userPrincipalName'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
  expand: z.string().optional().describe('Comma-separated list of relationships to expand'),
  top: z.number().min(1).max(999).optional().describe('Number of users to return (max 999)'),
  skip: z.number().min(0).optional().describe('Number of users to skip for pagination'),
  orderBy: z.string().optional().describe('Property to order by with optional direction (e.g., "displayName desc")'),
  count: z.boolean().optional().describe('Include total count in response'),
}).describe('Parameters for listing users with advanced filtering');

type ListUsersInput = z.infer<typeof ListUsersInputSchema>;

/**
 * Create enhanced list-users MCP tool with advanced querying capabilities
 * @param graphClient Graph API client instance
 * @returns MCP tool definition
 */
export function createListUsersTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'list-users',
    description: 'List users from Microsoft Graph with advanced filtering, search, and pagination',
    inputSchema: ListUsersInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = ListUsersInputSchema.parse(params);
        
        logger.info('Executing enhanced list-users tool', { params: validatedParams });

        // Build query parameters
        const queryParams: GraphQueryParams = {};
        
        if (validatedParams.filter) {
          queryParams.$filter = validatedParams.filter;
        }
        
        if (validatedParams.search) {
          queryParams.$search = `"${validatedParams.search}"`;
        }
        
        if (validatedParams.select) {
          queryParams.$select = validatedParams.select;
        }
        
        if (validatedParams.expand) {
          queryParams.$expand = validatedParams.expand;
        }
        
        if (validatedParams.top) {
          queryParams.$top = validatedParams.top;
        }
        
        if (validatedParams.skip) {
          queryParams.$skip = validatedParams.skip;
        }
        
        if (validatedParams.orderBy) {
          queryParams.$orderby = validatedParams.orderBy;
        }
        
        if (validatedParams.count) {
          queryParams.$count = true;
        }

        // Execute Graph API request
        const response = await graphClient.executeRequest<any>(async (client) => {
          let request = client.api('/users');
          
          // Add query parameters
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined) {
              if (key === '$search') {
                // Search requires ConsistencyLevel header
                request = request.header('ConsistencyLevel', 'eventual');
              }
              request = request.query(key, value.toString());
            }
          });
          
          return await request.get();
        });

        const users = response.value || response;
        const totalCount = response['@odata.count'] || users.length;

        logger.info(`Retrieved ${users.length} users (total: ${totalCount})`);

        return {
          content: {
            users,
            count: users.length,
            totalCount: validatedParams.count ? totalCount : undefined,
            nextLink: response['@odata.nextLink'],
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in enhanced list-users tool:', error);
        
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
 * Enhanced input schema for get-user tool
 */
const GetUserInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  select: z.string().optional().describe('Comma-separated list of properties to select'),
  expand: z.string().optional().describe('Comma-separated list of relationships to expand'),
}).describe('Parameters for getting a specific user');

type GetUserInput = z.infer<typeof GetUserInputSchema>;

/**
 * Create enhanced get-user MCP tool
 * @param graphClient Graph API client instance
 * @returns MCP tool definition
 */
export function createGetUserTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'get-user',
    description: 'Get a specific user from Microsoft Graph by ID or UPN with relationship expansion',
    inputSchema: GetUserInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        // Validate input parameters
        const validatedParams = GetUserInputSchema.parse(params);
        
        logger.info('Executing enhanced get-user tool', { params: validatedParams });

        // Execute Graph API request
        const user = await graphClient.executeRequest<GraphUser>(async (client) => {
          let request = client.api(`/users/${validatedParams.userId}`);
          
          if (validatedParams.select) {
            request = request.select(validatedParams.select);
          }
          
          if (validatedParams.expand) {
            request = request.expand(validatedParams.expand);
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
        logger.error('Error in enhanced get-user tool:', error);
        
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

/**
 * Input schema for bulk-create-users tool
 */
const BulkCreateUsersInputSchema = z.object({
  users: z.array(z.object({
    displayName: z.string().describe('Display name of the user'),
    userPrincipalName: z.string().describe('User principal name (email)'),
    mailNickname: z.string().describe('Mail nickname'),
    passwordProfile: z.object({
      password: z.string().describe('Initial password'),
      forceChangePasswordNextSignIn: z.boolean().optional().describe('Force password change on next sign-in'),
    }),
    accountEnabled: z.boolean().optional().describe('Whether the account is enabled'),
    usageLocation: z.string().optional().describe('Usage location (ISO country code)'),
    department: z.string().optional().describe('Department'),
    jobTitle: z.string().optional().describe('Job title'),
  })).describe('Array of user objects to create'),
  continueOnError: z.boolean().optional().describe('Continue processing if individual user creation fails'),
}).describe('Parameters for bulk user creation');

type BulkCreateUsersInput = z.infer<typeof BulkCreateUsersInputSchema>;

/**
 * Create bulk-create-users MCP tool
 */
export function createBulkCreateUsersTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'bulk-create-users',
    description: 'Create multiple users in bulk with detailed results for each operation',
    inputSchema: BulkCreateUsersInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = BulkCreateUsersInputSchema.parse(params);
        
        logger.info('Executing bulk-create-users tool', { 
          userCount: validatedParams.users.length,
          continueOnError: validatedParams.continueOnError 
        });

        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (const userData of validatedParams.users) {
          try {
            const user = await graphClient.executeRequest<GraphUser>(async (client) => {
              return await client.api('/users').post(userData);
            });

            results.push({
              userPrincipalName: userData.userPrincipalName,
              status: 'success',
              user: user,
            });
            successCount++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            results.push({
              userPrincipalName: userData.userPrincipalName,
              status: 'failed',
              error: errorMessage,
            });
            failureCount++;

            if (!validatedParams.continueOnError) {
              logger.error(`Bulk user creation stopped at user: ${userData.userPrincipalName}`, error);
              break;
            }
          }
        }

        logger.info(`Bulk user creation completed: ${successCount} success, ${failureCount} failed`);

        return {
          content: {
            results,
            summary: {
              total: validatedParams.users.length,
              successful: successCount,
              failed: failureCount,
            },
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in bulk-create-users tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'bulk-create-users',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for bulk-update-users tool
 */
const BulkUpdateUsersInputSchema = z.object({
  updates: z.array(z.object({
    userId: z.string().describe('User ID or User Principal Name'),
    properties: z.record(z.any()).describe('Properties to update'),
  })).describe('Array of user update operations'),
  continueOnError: z.boolean().optional().describe('Continue processing if individual user update fails'),
}).describe('Parameters for bulk user updates');

type BulkUpdateUsersInput = z.infer<typeof BulkUpdateUsersInputSchema>;

/**
 * Create bulk-update-users MCP tool
 */
export function createBulkUpdateUsersTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'bulk-update-users',
    description: 'Update multiple users in bulk with detailed results for each operation',
    inputSchema: BulkUpdateUsersInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = BulkUpdateUsersInputSchema.parse(params);
        
        logger.info('Executing bulk-update-users tool', { 
          updateCount: validatedParams.updates.length,
          continueOnError: validatedParams.continueOnError 
        });

        const results = [];
        let successCount = 0;
        let failureCount = 0;

        for (const updateData of validatedParams.updates) {
          try {
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${updateData.userId}`).patch(updateData.properties);
            });

            results.push({
              userId: updateData.userId,
              status: 'success',
              updatedProperties: Object.keys(updateData.properties),
            });
            successCount++;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            results.push({
              userId: updateData.userId,
              status: 'failed',
              error: errorMessage,
            });
            failureCount++;

            if (!validatedParams.continueOnError) {
              logger.error(`Bulk user update stopped at user: ${updateData.userId}`, error);
              break;
            }
          }
        }

        logger.info(`Bulk user update completed: ${successCount} success, ${failureCount} failed`);

        return {
          content: {
            results,
            summary: {
              total: validatedParams.updates.length,
              successful: successCount,
              failed: failureCount,
            },
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in bulk-update-users tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'bulk-update-users',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for manage-user-photo tool
 */
const ManageUserPhotoInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  operation: z.enum(['get', 'upload', 'delete']).describe('Photo operation to perform'),
  photoData: z.string().optional().describe('Base64 encoded photo data for upload operation'),
  contentType: z.string().optional().describe('MIME type of the photo (e.g., image/jpeg, image/png)'),
}).describe('Parameters for managing user photos');

type ManageUserPhotoInput = z.infer<typeof ManageUserPhotoInputSchema>;

/**
 * Create manage-user-photo MCP tool
 */
export function createManageUserPhotoTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'manage-user-photo',
    description: 'Manage user profile photos (get, upload, delete)',
    inputSchema: ManageUserPhotoInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = ManageUserPhotoInputSchema.parse(params);
        
        logger.info('Executing manage-user-photo tool', { 
          userId: validatedParams.userId,
          operation: validatedParams.operation 
        });

        let result: any = {};

        switch (validatedParams.operation) {
          case 'get':
            try {
              const photoBlob = await graphClient.executeRequest<any>(async (client) => {
                return await client.api(`/users/${validatedParams.userId}/photo/$value`).get();
              });
              
              // Convert blob to base64
              const photoData = Buffer.from(photoBlob).toString('base64');
              
              result = {
                operation: 'get',
                hasPhoto: true,
                photoData: photoData,
                contentType: 'image/jpeg', // Default assumption
              };
            } catch (error) {
              result = {
                operation: 'get',
                hasPhoto: false,
                message: 'User has no profile photo',
              };
            }
            break;

          case 'upload':
            if (!validatedParams.photoData || !validatedParams.contentType) {
              throw new Error('photoData and contentType are required for upload operation');
            }

            const photoBuffer = Buffer.from(validatedParams.photoData, 'base64');
            
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/photo/$value`)
                .header('Content-Type', validatedParams.contentType!)
                .put(photoBuffer);
            });

            result = {
              operation: 'upload',
              success: true,
              photoSize: photoBuffer.length,
              contentType: validatedParams.contentType,
            };
            break;

          case 'delete':
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/photo/$value`).delete();
            });

            result = {
              operation: 'delete',
              success: true,
              message: 'Profile photo deleted successfully',
            };
            break;
        }

        logger.info(`User photo ${validatedParams.operation} operation completed`);

        return {
          content: {
            ...result,
            userId: validatedParams.userId,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in manage-user-photo tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'manage-user-photo',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for manage-user-manager tool
 */
const ManageUserManagerInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  operation: z.enum(['get', 'set', 'remove']).describe('Manager operation to perform'),
  managerId: z.string().optional().describe('Manager user ID for set operation'),
}).describe('Parameters for managing user managers');

type ManageUserManagerInput = z.infer<typeof ManageUserManagerInputSchema>;

/**
 * Create manage-user-manager MCP tool
 */
export function createManageUserManagerTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'manage-user-manager',
    description: 'Manage user manager relationships (get current manager, set new manager, remove manager)',
    inputSchema: ManageUserManagerInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = ManageUserManagerInputSchema.parse(params);
        
        logger.info('Executing manage-user-manager tool', { 
          userId: validatedParams.userId,
          operation: validatedParams.operation 
        });

        let result: any = {};

        switch (validatedParams.operation) {
          case 'get':
            try {
              const manager = await graphClient.executeRequest<GraphUser>(async (client) => {
                return await client.api(`/users/${validatedParams.userId}/manager`).get();
              });
              
              result = {
                operation: 'get',
                hasManager: true,
                manager: {
                  id: manager.id,
                  displayName: manager.displayName,
                  userPrincipalName: manager.userPrincipalName,
                },
              };
            } catch (error) {
              result = {
                operation: 'get',
                hasManager: false,
                message: 'User has no manager assigned',
              };
            }
            break;

          case 'set':
            if (!validatedParams.managerId) {
              throw new Error('managerId is required for set operation');
            }

            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/manager/$ref`).put({
                '@odata.id': `https://graph.microsoft.com/v1.0/users/${validatedParams.managerId}`,
              });
            });

            result = {
              operation: 'set',
              success: true,
              managerId: validatedParams.managerId,
              message: 'Manager assigned successfully',
            };
            break;

          case 'remove':
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/manager/$ref`).delete();
            });

            result = {
              operation: 'remove',
              success: true,
              message: 'Manager removed successfully',
            };
            break;
        }

        logger.info(`User manager ${validatedParams.operation} operation completed`);

        return {
          content: {
            ...result,
            userId: validatedParams.userId,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in manage-user-manager tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'manage-user-manager',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for manage-user-licenses tool
 */
const ManageUserLicensesInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  operation: z.enum(['list', 'assign', 'remove']).describe('License operation to perform'),
  skuIds: z.array(z.string()).optional().describe('License SKU IDs for assign/remove operations'),
  disabledPlans: z.array(z.string()).optional().describe('Service plan IDs to disable'),
}).describe('Parameters for managing user licenses');

type ManageUserLicensesInput = z.infer<typeof ManageUserLicensesInputSchema>;

/**
 * Create manage-user-licenses MCP tool
 */
export function createManageUserLicensesTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'manage-user-licenses',
    description: 'Manage user license assignments (list current licenses, assign new licenses, remove licenses)',
    inputSchema: ManageUserLicensesInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = ManageUserLicensesInputSchema.parse(params);
        
        logger.info('Executing manage-user-licenses tool', { 
          userId: validatedParams.userId,
          operation: validatedParams.operation 
        });

        let result: any = {};

        switch (validatedParams.operation) {
          case 'list':
            const user = await graphClient.executeRequest<any>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}`)
                .select('assignedLicenses,licenseAssignmentStates')
                .get();
            });
            
            result = {
              operation: 'list',
              assignedLicenses: user.assignedLicenses || [],
              licenseAssignmentStates: user.licenseAssignmentStates || [],
              totalLicenses: user.assignedLicenses?.length || 0,
            };
            break;

          case 'assign':
            if (!validatedParams.skuIds || validatedParams.skuIds.length === 0) {
              throw new Error('skuIds are required for assign operation');
            }

            const addLicenses = validatedParams.skuIds.map(skuId => ({
              skuId: skuId,
              disabledPlans: validatedParams.disabledPlans || [],
            }));

            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/assignLicense`).post({
                addLicenses: addLicenses,
                removeLicenses: [],
              });
            });

            result = {
              operation: 'assign',
              success: true,
              assignedLicenses: addLicenses,
              message: `Successfully assigned ${addLicenses.length} license(s)`,
            };
            break;

          case 'remove':
            if (!validatedParams.skuIds || validatedParams.skuIds.length === 0) {
              throw new Error('skuIds are required for remove operation');
            }

            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/assignLicense`).post({
                addLicenses: [],
                removeLicenses: validatedParams.skuIds,
              });
            });

            result = {
              operation: 'remove',
              success: true,
              removedLicenses: validatedParams.skuIds,
              message: `Successfully removed ${validatedParams.skuIds.length} license(s)`,
            };
            break;
        }

        logger.info(`User license ${validatedParams.operation} operation completed`);

        return {
          content: {
            ...result,
            userId: validatedParams.userId,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in manage-user-licenses tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'manage-user-licenses',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for list-available-licenses tool
 */
const ListAvailableLicensesInputSchema = z.object({
  includeConsumedUnits: z.boolean().optional().describe('Include consumed units information'),
}).describe('Parameters for listing available licenses');

type ListAvailableLicensesInput = z.infer<typeof ListAvailableLicensesInputSchema>;

/**
 * Create list-available-licenses MCP tool
 */
export function createListAvailableLicensesTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'list-available-licenses',
    description: 'List all available licenses in the organization with usage information',
    inputSchema: ListAvailableLicensesInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = ListAvailableLicensesInputSchema.parse(params);
        
        logger.info('Executing list-available-licenses tool', { 
          includeConsumedUnits: validatedParams.includeConsumedUnits 
        });

        const subscribedSkus = await graphClient.executeRequest<any>(async (client) => {
          let request = client.api('/subscribedSkus');
          
          if (validatedParams.includeConsumedUnits) {
            request = request.select('skuId,skuPartNumber,servicePlans,prepaidUnits,consumedUnits');
          }
          
          const response = await request.get();
          return response.value || response;
        });

        const licenses = subscribedSkus.map((sku: any) => ({
          skuId: sku.skuId,
          skuPartNumber: sku.skuPartNumber,
          servicePlans: sku.servicePlans,
          prepaidUnits: sku.prepaidUnits,
          consumedUnits: sku.consumedUnits,
          availableUnits: sku.prepaidUnits?.enabled - sku.consumedUnits,
        }));

        logger.info(`Retrieved ${licenses.length} available licenses`);

        return {
          content: {
            licenses,
            totalLicenseTypes: licenses.length,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in list-available-licenses tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'list-available-licenses',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Input schema for manage-user-security tool
 */
const ManageUserSecurityInputSchema = z.object({
  userId: z.string().describe('User ID or User Principal Name'),
  operation: z.enum(['resetPassword', 'enableAccount', 'disableAccount', 'getSignInActivity', 'revokeSignInSessions']).describe('Security operation to perform'),
  newPassword: z.string().optional().describe('New password for reset operation'),
  forceChangePassword: z.boolean().optional().describe('Force password change on next sign-in'),
}).describe('Parameters for user security operations');

type ManageUserSecurityInput = z.infer<typeof ManageUserSecurityInputSchema>;

/**
 * Create manage-user-security MCP tool
 */
export function createManageUserSecurityTool(graphClient: GraphClient): MCPTool {
  return {
    name: 'manage-user-security',
    description: 'Manage user security settings (password reset, account enable/disable, sign-in activity, revoke sessions)',
    inputSchema: ManageUserSecurityInputSchema,
    handler: async (params: unknown): Promise<MCPToolResult> => {
      try {
        const validatedParams = ManageUserSecurityInputSchema.parse(params);
        
        logger.info('Executing manage-user-security tool', { 
          userId: validatedParams.userId,
          operation: validatedParams.operation 
        });

        let result: any = {};

        switch (validatedParams.operation) {
          case 'resetPassword':
            if (!validatedParams.newPassword) {
              throw new Error('newPassword is required for resetPassword operation');
            }

            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}`).patch({
                passwordProfile: {
                  password: validatedParams.newPassword,
                  forceChangePasswordNextSignIn: validatedParams.forceChangePassword ?? true,
                },
              });
            });

            result = {
              operation: 'resetPassword',
              success: true,
              forceChangePasswordNextSignIn: validatedParams.forceChangePassword ?? true,
              message: 'Password reset successfully',
            };
            break;

          case 'enableAccount':
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}`).patch({
                accountEnabled: true,
              });
            });

            result = {
              operation: 'enableAccount',
              success: true,
              accountEnabled: true,
              message: 'Account enabled successfully',
            };
            break;

          case 'disableAccount':
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}`).patch({
                accountEnabled: false,
              });
            });

            result = {
              operation: 'disableAccount',
              success: true,
              accountEnabled: false,
              message: 'Account disabled successfully',
            };
            break;

          case 'getSignInActivity':
            const signInActivity = await graphClient.executeRequest<any>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}`)
                .select('signInActivity,lastSignInDateTime,lastSignInRequestId')
                .get();
            });

            result = {
              operation: 'getSignInActivity',
              signInActivity: signInActivity.signInActivity,
              lastSignInDateTime: signInActivity.lastSignInDateTime,
              lastSignInRequestId: signInActivity.lastSignInRequestId,
            };
            break;

          case 'revokeSignInSessions':
            await graphClient.executeRequest<void>(async (client) => {
              return await client.api(`/users/${validatedParams.userId}/revokeSignInSessions`).post({});
            });

            result = {
              operation: 'revokeSignInSessions',
              success: true,
              message: 'All sign-in sessions revoked successfully',
            };
            break;
        }

        logger.info(`User security ${validatedParams.operation} operation completed`);

        return {
          content: {
            ...result,
            userId: validatedParams.userId,
            parameters: validatedParams,
          },
        };
      } catch (error) {
        logger.error('Error in manage-user-security tool:', error);
        
        return {
          content: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            tool: 'manage-user-security',
          },
          isError: true,
        };
      }
    },
  };
}

/**
 * Export all user management tools
 */
export const userTools = {
  createListUsersTool,
  createGetUserTool,
  createBulkCreateUsersTool,
  createBulkUpdateUsersTool,
  createManageUserPhotoTool,
  createManageUserManagerTool,
  createManageUserLicensesTool,
  createListAvailableLicensesTool,
  createManageUserSecurityTool,
};

/**
 * Export individual tool executors for the tools registry
 */
export const executeListUsers = async (graphClient: GraphClient, args: unknown) => {
  const tool = createListUsersTool(graphClient);
  return await tool.handler(args);
};

export const executeGetUser = async (graphClient: GraphClient, args: unknown) => {
  const tool = createGetUserTool(graphClient);
  return await tool.handler(args);
};

export const executeBulkCreateUsers = async (graphClient: GraphClient, args: unknown) => {
  const tool = createBulkCreateUsersTool(graphClient);
  return await tool.handler(args);
};

export const executeBulkUpdateUsers = async (graphClient: GraphClient, args: unknown) => {
  const tool = createBulkUpdateUsersTool(graphClient);
  return await tool.handler(args);
};

export const executeManageUserPhoto = async (graphClient: GraphClient, args: unknown) => {
  const tool = createManageUserPhotoTool(graphClient);
  return await tool.handler(args);
};

export const executeManageUserManager = async (graphClient: GraphClient, args: unknown) => {
  const tool = createManageUserManagerTool(graphClient);
  return await tool.handler(args);
};

export const executeManageUserLicenses = async (graphClient: GraphClient, args: unknown) => {
  const tool = createManageUserLicensesTool(graphClient);
  return await tool.handler(args);
};

export const executeListAvailableLicenses = async (graphClient: GraphClient, args: unknown) => {
  const tool = createListAvailableLicensesTool(graphClient);
  return await tool.handler(args);
};

export const executeManageUserSecurity = async (graphClient: GraphClient, args: unknown) => {
  const tool = createManageUserSecurityTool(graphClient);
  return await tool.handler(args);
}; 