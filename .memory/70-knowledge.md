# Domain & Project Knowledge: Microsoft Graph MCP Server

## Microsoft Graph API Knowledge

### Core Concepts
- **Graph API**: Unified REST API for accessing Microsoft 365 data and services
- **Permissions**: Delegated (user context) vs Application (app context) permissions
- **Throttling**: Rate limiting based on tenant, application, and resource type
- **Batching**: Combine multiple requests into single HTTP call for efficiency
- **Change Notifications**: Webhooks for real-time data change notifications

### Authentication Flows
- **Authorization Code**: Interactive user authentication with PKCE
- **Client Credentials**: App-only authentication for background services
- **Device Code**: Authentication for devices without web browser
- **On-Behalf-Of**: Service-to-service authentication with user context

### Common Permission Scopes
- **User.Read**: Read user profile information
- **User.ReadWrite.All**: Read and write all user profiles (admin only)
- **Group.ReadWrite.All**: Manage all groups (admin only)
- **Sites.ReadWrite.All**: Access to all SharePoint sites
- **Mail.ReadWrite**: Read and write user's mail
- **Calendars.ReadWrite**: Manage user's calendar

## MCP Protocol Knowledge

### Core Components
- **Tools**: Functions that AI agents can call to perform actions
- **Resources**: Static or dynamic content that provides context
- **Prompts**: Reusable prompt templates for common scenarios
- **Sampling**: Request/response examples for tool usage

### Protocol Patterns
- **Request/Response**: JSON-RPC 2.0 over stdio transport
- **Progressive Disclosure**: Resources can reference other resources
- **Error Handling**: Standard error codes with contextual messages
- **Capability Negotiation**: Server and client exchange supported features

## Enterprise IT Context

### IT Administrator Challenges
- **User Lifecycle Management**: Onboarding, role changes, offboarding
- **Security Monitoring**: Unusual access patterns, permission audits
- **Compliance Reporting**: Regular reports for governance and audit
- **Cost Optimization**: License usage analysis and optimization

### Power User Scenarios
- **Data Analysis**: Cross-service analytics for business insights
- **Workflow Automation**: Custom processes for team productivity
- **Content Management**: Organization and governance of digital assets
- **Collaboration Optimization**: Team structure and communication analysis

## Implementation Patterns

### Common Graph API Patterns
- **Pagination**: Handle large result sets with @odata.nextLink
- **Filtering**: Use $filter query parameter for efficient queries
- **Selection**: Use $select to limit returned properties
- **Expansion**: Use $expand to include related entities
- **Batch Operations**: Combine operations for efficiency

### Security Best Practices
- **Principle of Least Privilege**: Request minimal required permissions
- **Token Security**: Secure storage and transmission of access tokens
- **Audit Logging**: Comprehensive logging of all operations
- **Error Handling**: Avoid exposing sensitive information in errors

## Troubleshooting Knowledge

### Common Issues
- **403 Forbidden**: Insufficient permissions for requested operation
- **429 Too Many Requests**: Rate limiting throttling (implement backoff)
- **401 Unauthorized**: Token expired or invalid (refresh token)
- **400 Bad Request**: Invalid query parameters or request format

### Resolution Patterns
- **Permission Issues**: Check required permissions in Graph Explorer
- **Rate Limiting**: Implement exponential backoff with jitter
- **Token Issues**: Implement automatic token refresh logic
- **Query Issues**: Validate OData query syntax and parameters

## Performance Optimization

### Caching Strategies
- **User Profiles**: Cache for 1 hour (low volatility)
- **Group Memberships**: Cache for 30 minutes (medium volatility)
- **Mail/Calendar**: No caching (high volatility)
- **Organization Data**: Cache for 24 hours (very low volatility)

### Efficiency Patterns
- **Batch Requests**: Combine related operations
- **Parallel Processing**: Execute independent operations concurrently
- **Smart Pagination**: Use appropriate page sizes for data type
- **Selective Queries**: Request only needed properties and relationships