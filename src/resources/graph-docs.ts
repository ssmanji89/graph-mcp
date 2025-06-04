/**
 * Graph API documentation resource provider
 * Implements dynamic resources for Graph API schemas and documentation
 */

import { MCPResource, MCPResourceHandler } from '@/types/mcp';
import { logger } from '@/services/logger';

/**
 * Graph API documentation resources
 */
export class GraphDocsResourceProvider {
  private resources: Map<string, MCPResource> = new Map();

  constructor() {
    this.initializeResources();
  }

  /**
   * Initialize static documentation resources
   */
  private initializeResources(): void {
    // API Overview
    this.resources.set('graph://docs/api-overview', {
      uri: 'graph://docs/api-overview',
      name: 'Microsoft Graph API Overview',
      description: 'Overview of Microsoft Graph API capabilities and endpoints',
      mimeType: 'text/markdown',
      text: this.getApiOverview(),
    });

    // Authentication Guide
    this.resources.set('graph://docs/authentication', {
      uri: 'graph://docs/authentication',
      name: 'Graph API Authentication Guide',
      description: 'Authentication flows and token management for Graph API',
      mimeType: 'text/markdown',
      text: this.getAuthenticationGuide(),
    });

    // Common Endpoints
    this.resources.set('graph://docs/endpoints', {
      uri: 'graph://docs/endpoints',
      name: 'Common Graph API Endpoints',
      description: 'Most frequently used Graph API endpoints and their purposes',
      mimeType: 'text/markdown',
      text: this.getCommonEndpoints(),
    });

    // Error Handling
    this.resources.set('graph://docs/error-handling', {
      uri: 'graph://docs/error-handling',
      name: 'Graph API Error Handling',
      description: 'Error codes, troubleshooting, and best practices',
      mimeType: 'text/markdown',
      text: this.getErrorHandling(),
    });

    logger.info(`Initialized ${this.resources.size} Graph documentation resources`);
  }

  /**
   * Get resource handler for Graph documentation
   * @returns Resource handler function
   */
  getResourceHandler(): MCPResourceHandler {
    return async (uri: string): Promise<MCPResource> => {
      logger.info(`Retrieving Graph documentation resource: ${uri}`);

      const resource = this.resources.get(uri);
      if (!resource) {
        throw new Error(`Graph documentation resource not found: ${uri}`);
      }

      return resource;
    };
  }

  /**
   * List available documentation resources
   * @returns Array of available resources
   */
  listResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Generate API overview documentation
   * @returns Markdown content
   */
  private getApiOverview(): string {
    return `# Microsoft Graph API Overview

## What is Microsoft Graph?
Microsoft Graph is the unified REST API for accessing Microsoft 365 data and services. It provides a single endpoint to access data across:

- **Users**: User profiles, authentication, directory information
- **Groups**: Security groups, distribution lists, Microsoft 365 groups
- **Mail**: Email messages, folders, attachments, calendar events
- **Files**: OneDrive and SharePoint files and folders
- **Teams**: Teams, channels, messages, and collaboration data
- **Security**: Security alerts, incidents, and compliance data

## Base URL
\`\`\`
https://graph.microsoft.com/v1.0/
https://graph.microsoft.com/beta/
\`\`\`

## Common Resource Types
- \`/users\` - User management and profiles
- \`/groups\` - Group management and membership
- \`/me\` - Current user context
- \`/sites\` - SharePoint sites and content
- \`/teams\` - Microsoft Teams data
- \`/security\` - Security and compliance data

## Key Features
- **Unified API**: Single endpoint for all Microsoft 365 services
- **Rich Permissions**: Granular permission scopes for different operations
- **Batching**: Combine multiple requests for efficiency
- **Change Notifications**: Real-time updates via webhooks
- **Filtering**: OData query parameters for precise data retrieval`;
  }

  /**
   * Generate authentication guide
   * @returns Markdown content
   */
  private getAuthenticationGuide(): string {
    return `# Graph API Authentication Guide

## Authentication Flows

### 1. Client Credentials Flow (App-Only)
Used for server-to-server authentication without user interaction.

**Required Permissions**: Application permissions
**Use Cases**: Background services, automation, admin operations

\`\`\`javascript
const authResult = await confidentialClientApp.acquireTokenByClientCredential({
  scopes: ['https://graph.microsoft.com/.default']
});
\`\`\`

### 2. Authorization Code Flow
Used for interactive user authentication with PKCE.

**Required Permissions**: Delegated permissions
**Use Cases**: User-interactive applications, personal data access

## Permission Types

### Application Permissions
- No signed-in user required
- Typically require admin consent
- Examples: \`User.ReadWrite.All\`, \`Group.ReadWrite.All\`

### Delegated Permissions
- Act on behalf of signed-in user
- User must consent to permissions
- Examples: \`User.Read\`, \`Mail.ReadWrite\`

## Common Permission Scopes
- \`User.Read\`: Read user profile
- \`User.ReadWrite.All\`: Manage all user profiles (admin)
- \`Group.ReadWrite.All\`: Manage all groups (admin)
- \`Sites.ReadWrite.All\`: Access SharePoint sites
- \`Mail.ReadWrite\`: Read and write user's mail

## Token Management
- **Access Tokens**: Short-lived (1 hour default)
- **Refresh Tokens**: Long-lived for token renewal
- **Token Caching**: Implement proper caching for performance`;
  }

  /**
   * Generate common endpoints documentation
   * @returns Markdown content
   */
  private getCommonEndpoints(): string {
    return `# Common Graph API Endpoints

## User Management
- \`GET /users\` - List all users
- \`GET /users/{id}\` - Get specific user
- \`POST /users\` - Create new user
- \`PATCH /users/{id}\` - Update user
- \`DELETE /users/{id}\` - Delete user

## Group Management
- \`GET /groups\` - List all groups
- \`GET /groups/{id}\` - Get specific group
- \`GET /groups/{id}/members\` - Get group members
- \`POST /groups/{id}/members/$ref\` - Add member to group
- \`DELETE /groups/{id}/members/{id}/$ref\` - Remove member

## Mail Operations
- \`GET /me/messages\` - Get user's messages
- \`POST /me/sendMail\` - Send email
- \`GET /me/mailFolders\` - Get mail folders
- \`POST /me/messages/{id}/reply\` - Reply to message

## Calendar Operations
- \`GET /me/calendar/events\` - Get calendar events
- \`POST /me/calendar/events\` - Create event
- \`PATCH /me/calendar/events/{id}\` - Update event

## Files and SharePoint
- \`GET /me/drive/root/children\` - Get OneDrive files
- \`GET /sites/{site-id}/drive/items\` - Get SharePoint files
- \`PUT /me/drive/items/{id}/content\` - Upload file

## Teams Operations
- \`GET /me/joinedTeams\` - Get user's teams
- \`GET /teams/{id}/channels\` - Get team channels
- \`POST /teams/{id}/channels/{id}/messages\` - Send team message

## Query Parameters
- \`$select\`: Choose specific properties
- \`$filter\`: Filter results
- \`$orderby\`: Sort results
- \`$top\`: Limit number of results
- \`$skip\`: Skip results for pagination
- \`$expand\`: Include related data`;
  }

  /**
   * Generate error handling documentation
   * @returns Markdown content
   */
  private getErrorHandling(): string {
    return `# Graph API Error Handling

## Common HTTP Status Codes

### 400 Bad Request
- Invalid request syntax
- Missing required parameters
- Invalid query parameters

### 401 Unauthorized
- Missing or invalid access token
- Token expired
- Insufficient authentication

### 403 Forbidden
- Insufficient permissions
- Resource access denied
- Admin consent required

### 404 Not Found
- Resource does not exist
- Invalid endpoint URL
- User or object not found

### 429 Too Many Requests
- Rate limit exceeded
- Retry after specified time
- Implement exponential backoff

### 500 Internal Server Error
- Temporary service issues
- Retry with exponential backoff

## Error Response Format
\`\`\`json
{
  "error": {
    "code": "ErrorCode",
    "message": "Human readable error message",
    "innerError": {
      "request-id": "unique-request-id",
      "date": "2025-01-09T12:00:00Z"
    }
  }
}
\`\`\`

## Common Error Codes
- \`InvalidAuthenticationToken\`: Token is invalid or expired
- \`Forbidden\`: Insufficient permissions
- \`NotFound\`: Resource not found
- \`TooManyRequests\`: Rate limit exceeded
- \`ServiceNotAvailable\`: Temporary service issue

## Best Practices
1. **Implement Retry Logic**: For 429 and 5xx errors
2. **Handle Token Expiration**: Refresh tokens automatically
3. **Log Request IDs**: For troubleshooting with Microsoft
4. **Implement Circuit Breaker**: For service availability
5. **Graceful Degradation**: Fallback mechanisms for failures

## Rate Limiting
- **Per App**: 10,000 requests per 10 minutes
- **Per User**: 10,000 requests per 10 minutes
- **Per Tenant**: Various limits based on licenses
- **Retry-After Header**: Indicates when to retry

## Troubleshooting Steps
1. Check access token validity
2. Verify required permissions
3. Validate request syntax
4. Check service health status
5. Review request and response logs`;
  }
} 