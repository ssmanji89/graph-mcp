/**
 * Troubleshooting resources for Microsoft Graph MCP Server
 * Implements diagnostic and error resolution resources
 */

import { MCPResource, MCPResourceHandler } from '@/types/mcp';
import { AuditService } from '@/services/audit-service';
import { CacheService } from '@/services/cache-service';
import { logger } from '@/services/logger';

/**
 * Troubleshooting resource provider
 */
export class TroubleshootingResourceProvider {
  private resources: Map<string, MCPResource> = new Map();
  private auditService?: AuditService;
  private cacheService?: CacheService;

  constructor(auditService?: AuditService, cacheService?: CacheService) {
    this.auditService = auditService;
    this.cacheService = cacheService;
    this.initializeResources();
  }

  /**
   * Initialize troubleshooting resources
   */
  private initializeResources(): void {
    // Diagnostic Guide
    this.resources.set('graph://troubleshooting/diagnostic-guide', {
      uri: 'graph://troubleshooting/diagnostic-guide',
      name: 'Graph MCP Server Diagnostic Guide',
      description: 'Step-by-step troubleshooting guide for common issues',
      mimeType: 'text/markdown',
      text: this.getDiagnosticGuide(),
    });

    // Error Code Reference
    this.resources.set('graph://troubleshooting/error-codes', {
      uri: 'graph://troubleshooting/error-codes',
      name: 'Graph API Error Code Reference',
      description: 'Comprehensive error code reference with solutions',
      mimeType: 'text/markdown',
      text: this.getErrorCodeReference(),
    });

    // Permission Reference
    this.resources.set('graph://troubleshooting/permissions', {
      uri: 'graph://troubleshooting/permissions',
      name: 'Graph API Permission Reference',
      description: 'Permission requirements and troubleshooting guide',
      mimeType: 'text/markdown',
      text: this.getPermissionReference(),
    });

    // Rate Limiting Guide
    this.resources.set('graph://troubleshooting/rate-limiting', {
      uri: 'graph://troubleshooting/rate-limiting',
      name: 'Rate Limiting Troubleshooting Guide',
      description: 'Understanding and handling Graph API rate limits',
      mimeType: 'text/markdown',
      text: this.getRateLimitingGuide(),
    });

    // MCP Protocol Guide
    this.resources.set('graph://troubleshooting/mcp-protocol', {
      uri: 'graph://troubleshooting/mcp-protocol',
      name: 'MCP Protocol Troubleshooting',
      description: 'Model Context Protocol troubleshooting and debugging',
      mimeType: 'text/markdown',
      text: this.getMcpProtocolGuide(),
    });

    logger.info(`Initialized ${this.resources.size} troubleshooting resources`);
  }

  /**
   * Get resource handler for troubleshooting resources
   */
  getResourceHandler(): MCPResourceHandler {
    return async (uri: string): Promise<MCPResource> => {
      logger.info(`Retrieving troubleshooting resource: ${uri}`);

      // Handle dynamic diagnostic resources
      if (uri.startsWith('graph://troubleshooting/diagnostics/')) {
        return this.generateDynamicDiagnostic(uri);
      }

      // Handle static resources
      const resource = this.resources.get(uri);
      if (!resource) {
        throw new Error(`Troubleshooting resource not found: ${uri}`);
      }

      return resource;
    };
  }

  /**
   * List available troubleshooting resources
   */
  listResources(): MCPResource[] {
    const staticResources = Array.from(this.resources.values());
    
    // Add dynamic diagnostic resources
    const dynamicResources: MCPResource[] = [
      {
        uri: 'graph://troubleshooting/diagnostics/system-status',
        name: 'System Status Diagnostic',
        description: 'Current system health and status information',
        mimeType: 'text/markdown',
      },
      {
        uri: 'graph://troubleshooting/diagnostics/recent-errors',
        name: 'Recent Errors Diagnostic',
        description: 'Analysis of recent error patterns',
        mimeType: 'text/markdown',
      },
      {
        uri: 'graph://troubleshooting/diagnostics/performance-metrics',
        name: 'Performance Metrics',
        description: 'Current performance and cache statistics',
        mimeType: 'text/markdown',
      },
    ];

    return [...staticResources, ...dynamicResources];
  }

  /**
   * Generate dynamic diagnostic resource
   */
  private async generateDynamicDiagnostic(uri: string): Promise<MCPResource> {
    const resourceType = uri.split('/').pop();

    switch (resourceType) {
      case 'system-status':
        return {
          uri,
          name: 'System Status Diagnostic',
          description: 'Current system health and status information',
          mimeType: 'text/markdown',
          text: await this.generateSystemStatus(),
        };

      case 'recent-errors':
        return {
          uri,
          name: 'Recent Errors Diagnostic',
          description: 'Analysis of recent error patterns',
          mimeType: 'text/markdown',
          text: await this.generateRecentErrors(),
        };

      case 'performance-metrics':
        return {
          uri,
          name: 'Performance Metrics',
          description: 'Current performance and cache statistics',
          mimeType: 'text/markdown',
          text: await this.generatePerformanceMetrics(),
        };

      default:
        throw new Error(`Unknown diagnostic resource: ${resourceType}`);
    }
  }

  /**
   * Generate system status diagnostic
   */
  private async generateSystemStatus(): Promise<string> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return `# System Status Diagnostic

## Server Information
- **Uptime**: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s
- **Node.js Version**: ${process.version}
- **Platform**: ${process.platform} ${process.arch}
- **Process ID**: ${process.pid}

## Memory Usage
- **RSS**: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB
- **Heap Used**: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB
- **Heap Total**: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB
- **External**: ${Math.round(memoryUsage.external / 1024 / 1024)} MB

## Environment
- **NODE_ENV**: ${process.env.NODE_ENV || 'development'}
- **LOG_LEVEL**: ${process.env.LOG_LEVEL || 'info'}
- **Cache TTL**: ${process.env.CACHE_TTL || '3600'}s

## Health Status
✅ MCP Server Running
${this.auditService ? '✅ Audit Service Active' : '❌ Audit Service Unavailable'}
${this.cacheService ? '✅ Cache Service Active' : '❌ Cache Service Unavailable'}

## Quick Actions
- Check recent errors: \`graph://troubleshooting/diagnostics/recent-errors\`
- View performance metrics: \`graph://troubleshooting/diagnostics/performance-metrics\`
- Review error codes: \`graph://troubleshooting/error-codes\``;
  }

  /**
   * Generate recent errors diagnostic
   */
  private async generateRecentErrors(): Promise<string> {
    if (!this.auditService) {
      return `# Recent Errors Diagnostic

❌ **Audit Service Unavailable**

The audit service is not configured, so error analysis is not available.

## Manual Error Checking
1. Check server logs for error messages
2. Review console output for stack traces
3. Verify environment configuration
4. Test Graph API connectivity`;
    }

    const recentErrors = this.auditService.queryEvents({
      severity: 'ERROR',
      limit: 10,
    });

    const stats = this.auditService.getStats();

    let errorAnalysis = `# Recent Errors Diagnostic

## Error Summary
- **Total Errors**: ${stats.eventsBySeverity.ERROR || 0}
- **Critical Events**: ${stats.eventsBySeverity.CRITICAL || 0}
- **Recent 10 Errors**: ${recentErrors.length}

`;

    if (recentErrors.length === 0) {
      errorAnalysis += `✅ **No Recent Errors Found**

The system is operating normally with no errors in the recent audit log.`;
    } else {
      errorAnalysis += `## Recent Error Details

`;
      for (const error of recentErrors) {
        errorAnalysis += `### ${error.timestamp.toISOString()}
- **Type**: ${error.eventType}
- **Description**: ${error.description}
- **Target**: ${error.target || 'N/A'}
- **Event ID**: ${error.eventId}

`;
      }

      errorAnalysis += `## Recommended Actions
1. Review error patterns for common causes
2. Check Graph API connectivity and permissions
3. Verify authentication configuration
4. Review rate limiting and retry logic`;
    }

    return errorAnalysis;
  }

  /**
   * Generate performance metrics diagnostic
   */
  private async generatePerformanceMetrics(): Promise<string> {
    let metricsReport = `# Performance Metrics Diagnostic

## System Performance
- **CPU Usage**: Monitoring not implemented (would use process.cpuUsage())
- **Event Loop Lag**: Monitoring not implemented (would use perf_hooks)
- **Active Handles**: ${process._getActiveHandles().length}
- **Active Requests**: ${process._getActiveRequests().length}

`;

    if (this.cacheService) {
      const cacheStats = this.cacheService.getStats();
      metricsReport += `## Cache Performance
- **Cache Hit Rate**: ${(cacheStats.hitRate * 100).toFixed(1)}%
- **Total Hits**: ${cacheStats.hits}
- **Total Misses**: ${cacheStats.misses}
- **Current Keys**: ${cacheStats.keyCount}
- **Max Capacity**: ${cacheStats.maxSize}

### Cache Efficiency
${cacheStats.hitRate > 0.8 ? '✅ Excellent cache performance' : 
  cacheStats.hitRate > 0.6 ? '⚠️ Good cache performance' : 
  '❌ Poor cache performance - consider tuning TTL values'}

`;
    } else {
      metricsReport += `## Cache Performance
❌ **Cache Service Unavailable**

`;
    }

    if (this.auditService) {
      const auditStats = this.auditService.getStats();
      metricsReport += `## Audit Performance
- **Total Events**: ${auditStats.totalEvents}
- **Event Storage**: In-memory (production should use persistent storage)
- **Oldest Event**: ${auditStats.oldestEvent?.toISOString() || 'N/A'}
- **Newest Event**: ${auditStats.newestEvent?.toISOString() || 'N/A'}

### Event Distribution
`;
      for (const [type, count] of Object.entries(auditStats.eventsByType)) {
        metricsReport += `- **${type}**: ${count}\n`;
      }
    }

    metricsReport += `
## Recommendations
1. Monitor memory usage trends over time
2. Implement CPU and event loop monitoring
3. Set up persistent audit storage for production
4. Configure alerting for performance thresholds
5. Review cache hit rates and optimize TTL settings`;

    return metricsReport;
  }

  /**
   * Generate diagnostic guide
   */
  private getDiagnosticGuide(): string {
    return `# Graph MCP Server Diagnostic Guide

## Quick Diagnosis Checklist

### 1. Authentication Issues
\`\`\`
❓ Symptoms: 401 Unauthorized, token errors
✅ Check: Environment variables (CLIENT_ID, CLIENT_SECRET, TENANT_ID)
✅ Verify: App registration and permissions
✅ Test: Token acquisition manually
\`\`\`

### 2. Permission Errors
\`\`\`
❓ Symptoms: 403 Forbidden, access denied
✅ Check: Required permissions granted
✅ Verify: Admin consent provided
✅ Review: Permission scope matches operation
\`\`\`

### 3. Rate Limiting
\`\`\`
❓ Symptoms: 429 Too Many Requests
✅ Check: Request frequency and patterns
✅ Implement: Exponential backoff
✅ Monitor: Retry-After headers
\`\`\`

### 4. MCP Protocol Issues
\`\`\`
❓ Symptoms: Tool execution failures, JSON-RPC errors
✅ Check: Tool parameter validation
✅ Verify: Response format compliance
✅ Test: MCP client connection
\`\`\`

## Diagnostic Commands

### System Status
\`\`\`
Resource: graph://troubleshooting/diagnostics/system-status
Purpose: Check server health and configuration
\`\`\`

### Recent Errors
\`\`\`
Resource: graph://troubleshooting/diagnostics/recent-errors
Purpose: Analyze recent error patterns
\`\`\`

### Performance Metrics
\`\`\`
Resource: graph://troubleshooting/diagnostics/performance-metrics
Purpose: Review performance and cache statistics
\`\`\`

## Common Resolution Steps

### Authentication Problems
1. Verify environment variables are set correctly
2. Check app registration in Azure AD
3. Ensure proper permission scopes
4. Test token acquisition independently

### Graph API Errors
1. Check Graph API status page
2. Verify endpoint URLs and parameters
3. Review request/response logs
4. Test with Graph Explorer

### Performance Issues
1. Check cache hit rates
2. Monitor memory usage
3. Review audit logs for patterns
4. Optimize query parameters

### MCP Integration Issues
1. Validate tool schemas
2. Check parameter types and values
3. Verify response format compliance
4. Test with different MCP clients

## Emergency Procedures

### Server Unresponsive
1. Check process status
2. Review memory usage
3. Restart service if necessary
4. Check system resources

### Authentication Failure
1. Verify Azure AD app registration
2. Check certificate/secret expiration
3. Test authentication flow manually
4. Review audit logs for errors

### Data Inconsistency
1. Clear cache and retry
2. Check Graph API data freshness
3. Verify permission scopes
4. Review query parameters`;
  }

  /**
   * Generate error code reference
   */
  private getErrorCodeReference(): string {
    return `# Graph API Error Code Reference

## Authentication Errors (401)

### InvalidAuthenticationToken
**Cause**: Access token is invalid or expired
**Solution**: 
1. Refresh the access token
2. Verify token format and signature
3. Check token expiration time

### AuthenticationNotProvided
**Cause**: No authorization header provided
**Solution**: Include valid Bearer token in Authorization header

## Authorization Errors (403)

### Forbidden
**Cause**: Insufficient permissions for requested operation
**Solution**:
1. Check required permissions for endpoint
2. Verify admin consent is granted
3. Review app registration permissions

### InsufficientScope
**Cause**: Token doesn't include required permission scopes
**Solution**: Request token with appropriate scopes

## Not Found Errors (404)

### NotFound
**Cause**: Resource does not exist or is not accessible
**Solution**:
1. Verify resource ID/path is correct
2. Check if resource was deleted
3. Ensure proper permissions to access resource

### UnknownError
**Cause**: Unexpected server error
**Solution**: Retry request with exponential backoff

## Rate Limiting (429)

### TooManyRequests
**Cause**: Request rate limit exceeded
**Solution**:
1. Implement exponential backoff
2. Respect Retry-After header
3. Optimize request patterns
4. Use batching when possible

## Server Errors (500+)

### ServiceNotAvailable
**Cause**: Microsoft Graph service temporarily unavailable
**Solution**:
1. Retry with exponential backoff
2. Check Microsoft 365 service health
3. Implement circuit breaker pattern

### InternalServerError
**Cause**: Unexpected server error
**Solution**:
1. Retry request with backoff
2. Log request ID for Microsoft support
3. Check request format and parameters

## Client Errors (400)

### BadRequest
**Cause**: Invalid request syntax or parameters
**Solution**:
1. Validate request parameters
2. Check JSON syntax
3. Verify required fields are present

### InvalidRequest
**Cause**: Request format is invalid
**Solution**:
1. Review API documentation
2. Validate request structure
3. Check parameter types and values

## Resolution Strategies

### General Approach
1. **Log the Error**: Capture full error response with request ID
2. **Check Documentation**: Verify API usage against official docs
3. **Test Isolation**: Try request with minimal parameters
4. **Monitor Patterns**: Look for error frequency and timing

### Retry Logic
\`\`\`typescript
const retryableCodes = [429, 500, 502, 503, 504];
const maxRetries = 3;
let delay = 1000; // Start with 1 second

for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await makeRequest();
  } catch (error) {
    if (!retryableCodes.includes(error.status) || attempt === maxRetries - 1) {
      throw error;
    }
    await sleep(delay);
    delay *= 2; // Exponential backoff
  }
}
\`\`\`

### Error Handling Best Practices
1. **Capture Context**: Log request parameters and timing
2. **Preserve Request IDs**: Essential for Microsoft support
3. **Implement Fallbacks**: Graceful degradation when possible
4. **Monitor Trends**: Track error patterns over time`;
  }

  /**
   * Generate permission reference
   */
  private getPermissionReference(): string {
    return `# Graph API Permission Reference

## Permission Types

### Application Permissions
- **Use Case**: Server-to-server authentication (no user present)
- **Consent**: Requires admin consent
- **Access**: Full tenant access to resource type
- **Examples**: \`User.ReadWrite.All\`, \`Group.ReadWrite.All\`

### Delegated Permissions
- **Use Case**: On behalf of signed-in user
- **Consent**: User or admin consent required
- **Access**: Limited to user's accessible resources
- **Examples**: \`User.Read\`, \`Mail.ReadWrite\`

## Common Permissions by Resource

### User Management
| Operation | Application Permission | Delegated Permission |
|-----------|----------------------|---------------------|
| Read all users | \`User.Read.All\` | \`User.Read.All\` |
| Read user profile | \`User.Read.All\` | \`User.Read\` |
| Update all users | \`User.ReadWrite.All\` | \`User.ReadWrite.All\` |
| Update own profile | \`User.ReadWrite.All\` | \`User.ReadWrite\` |

### Group Management
| Operation | Application Permission | Delegated Permission |
|-----------|----------------------|---------------------|
| Read all groups | \`Group.Read.All\` | \`Group.Read.All\` |
| Create groups | \`Group.ReadWrite.All\` | \`Group.ReadWrite.All\` |
| Manage group membership | \`GroupMember.ReadWrite.All\` | \`GroupMember.ReadWrite.All\` |

### Mail Operations
| Operation | Application Permission | Delegated Permission |
|-----------|----------------------|---------------------|
| Read user mail | \`Mail.Read\` | \`Mail.Read\` |
| Send mail | \`Mail.Send\` | \`Mail.Send\` |
| Read all mailboxes | \`Mail.ReadWrite.All\` | \`Mail.ReadWrite.All\` |

## Permission Troubleshooting

### Missing Permissions Error
\`\`\`
Error: Forbidden (403)
Code: Forbidden
Message: Insufficient privileges to complete the operation
\`\`\`

**Resolution Steps**:
1. Identify required permission from API documentation
2. Add permission to app registration
3. Grant admin consent if required
4. Request new token with updated scopes

### Admin Consent Required
\`\`\`
Error: Forbidden (403)
Code: InsufficientScope
Message: Admin consent required for this scope
\`\`\`

**Resolution Steps**:
1. Navigate to Azure AD admin center
2. Go to App registrations > Your app > API permissions
3. Click "Grant admin consent for [tenant]"
4. Request new token

### Scope Not Included in Token
\`\`\`
Error: Forbidden (403)
Code: InsufficientScope
Message: The token does not contain the required scope
\`\`\`

**Resolution Steps**:
1. Verify requested scopes in token acquisition
2. Check that permissions are added to app registration
3. Ensure admin consent is granted
4. Request token with correct scope parameter

## Permission Best Practices

### Principle of Least Privilege
- Request only necessary permissions
- Use delegated permissions when possible
- Prefer read-only permissions unless write access needed

### Application vs Delegated
- **Use Application** for background services, automation
- **Use Delegated** for user-interactive scenarios
- **Consider Impact** of tenant-wide access with application permissions

### Permission Validation
\`\`\`typescript
// Check token scopes before API calls
function validateTokenScopes(requiredScopes: string[], tokenScopes: string[]): boolean {
  return requiredScopes.every(scope => tokenScopes.includes(scope));
}
\`\`\`

### Common Permission Patterns
- **User.Read.All + Group.Read.All**: Directory browsing
- **User.ReadWrite.All + Group.ReadWrite.All**: Full directory management
- **Mail.Read + Mail.Send**: Email operations
- **Sites.ReadWrite.All**: SharePoint content management

## Consent and Approval Process

### Admin Consent Flow
1. App requests permissions in manifest
2. Admin reviews and approves in Azure AD
3. Permissions granted tenant-wide
4. Users don't see consent prompts

### User Consent Flow
1. App requests delegated permissions
2. User sees consent prompt on first access
3. User approves or denies
4. Consent stored for future requests

### Monitoring Permissions
- Review app permissions regularly
- Monitor for unused permissions
- Audit permission grants and usage
- Remove unnecessary permissions`;
  }

  /**
   * Generate rate limiting guide
   */
  private getRateLimitingGuide(): string {
    return `# Rate Limiting Troubleshooting Guide

## Understanding Rate Limits

### Default Limits
- **Per Application**: 10,000 requests per 10 minutes
- **Per User**: 10,000 requests per 10 minutes  
- **Per Tenant**: Variable based on license and usage
- **Specific Endpoints**: May have lower limits

### Rate Limit Headers
\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
\`\`\`

## Handling Rate Limits

### Exponential Backoff Implementation
\`\`\`typescript
async function callWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let delay = 1000; // Start with 1 second
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.headers['retry-after'];
        const waitTime = retryAfter ? 
          parseInt(retryAfter) * 1000 : 
          delay * Math.pow(2, attempt);
          
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}
\`\`\`

### Batching Requests
\`\`\`typescript
// Instead of multiple individual requests
const users = await Promise.all([
  graphClient.api('/users/user1').get(),
  graphClient.api('/users/user2').get(),
  graphClient.api('/users/user3').get()
]);

// Use batch request
const batch = graphClient.createBatch();
batch.get('user1', '/users/user1');
batch.get('user2', '/users/user2');
batch.get('user3', '/users/user3');
const responses = await batch.execute();
\`\`\`

## Rate Limit Strategies

### Request Optimization
1. **Use \$select**: Reduce response size
   \`GET /users?$select=id,displayName\`

2. **Use \$filter**: Reduce result set
   \`GET /users?$filter=accountEnabled eq true\`

3. **Use \$top**: Limit results
   \`GET /users?$top=50\`

4. **Cache Results**: Avoid repeated requests
   \`Cache-Control: max-age=3600\`

### Monitoring Rate Limits
\`\`\`typescript
interface RateLimitTracker {
  remaining: number;
  resetTime: number;
  used: number;
}

class RateLimitMonitor {
  private limits = new Map<string, RateLimitTracker>();
  
  updateFromHeaders(endpoint: string, headers: Headers): void {
    this.limits.set(endpoint, {
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0'),
      resetTime: parseInt(headers.get('X-RateLimit-Reset') || '0'),
      used: parseInt(headers.get('X-RateLimit-Used') || '0')
    });
  }
  
  shouldThrottle(endpoint: string): boolean {
    const limit = this.limits.get(endpoint);
    return limit ? limit.remaining < 100 : false;
  }
}
\`\`\`

## Specific Scenarios

### High-Volume Operations
- **Use Delta Queries**: Track changes instead of full syncs
- **Implement Paging**: Process large datasets in chunks
- **Schedule Jobs**: Spread operations over time
- **Use Webhooks**: Event-driven instead of polling

### Multi-Tenant Applications
- **Per-Tenant Limits**: Each tenant has separate limits
- **Tenant Isolation**: Don't let one tenant affect others
- **Priority Queuing**: Critical operations first

### Real-Time Applications
- **WebSocket Alternatives**: Consider SignalR for real-time updates
- **Change Notifications**: Use webhooks instead of polling
- **Caching Strategy**: Aggressive caching for frequently accessed data

## Troubleshooting Rate Limit Errors

### Error Analysis
\`\`\`json
{
  "error": {
    "code": "TooManyRequests",
    "message": "Rate limit exceeded",
    "innerError": {
      "request-id": "12345678-1234-1234-1234-123456789012",
      "date": "2025-01-09T12:00:00"
    }
  }
}
\`\`\`

### Diagnostic Questions
1. **Frequency**: How often are you making requests?
2. **Concurrency**: How many simultaneous requests?
3. **Batching**: Are you batching related requests?
4. **Caching**: Are you caching responses appropriately?
5. **Timing**: Are requests spread evenly or in bursts?

### Resolution Steps
1. **Implement Backoff**: Add exponential backoff logic
2. **Add Caching**: Cache responses to reduce requests
3. **Optimize Queries**: Use filtering and selection
4. **Batch Operations**: Combine related requests
5. **Monitor Usage**: Track request patterns and limits

## Prevention Strategies

### Application Design
- **Lazy Loading**: Load data only when needed
- **Background Processing**: Move bulk operations to background
- **Request Coalescing**: Combine similar requests
- **Circuit Breaker**: Stop requests when limits are hit

### Monitoring and Alerting
- **Rate Limit Metrics**: Track usage vs limits
- **Alert Thresholds**: Warn when approaching limits
- **Usage Patterns**: Identify peak usage times
- **Error Tracking**: Monitor 429 error frequency`;
  }

  /**
   * Generate MCP protocol guide
   */
  private getMcpProtocolGuide(): string {
    return `# MCP Protocol Troubleshooting

## Protocol Overview

The Model Context Protocol (MCP) enables AI agents to interact with external systems through a standardized interface. This server implements MCP over JSON-RPC with stdio transport.

## Common Issues

### Connection Problems

#### Symptoms
- Server not responding to requests
- Connection timeouts
- JSON-RPC errors

#### Diagnostic Steps
1. **Check Process**: Verify server process is running
2. **Test Transport**: Ensure stdio transport is working
3. **Validate JSON**: Check request/response format
4. **Review Logs**: Look for startup errors

#### Solutions
\`\`\`bash
# Test server manually
echo '{"jsonrpc":"2.0","method":"initialize","params":{},"id":1}' | node dist/index.js

# Check process status
ps aux | grep node

# Review logs
tail -f logs/server.log
\`\`\`

### Tool Execution Failures

#### Symptoms
- Tool not found errors
- Parameter validation failures
- Execution timeouts

#### Diagnostic Steps
1. **Verify Tool Registration**: Check tools are properly registered
2. **Validate Parameters**: Ensure parameters match schema
3. **Check Permissions**: Verify Graph API access
4. **Review Error Messages**: Analyze specific error details

#### Example Tool Test
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-users",
    "arguments": {
      "top": 10
    }
  },
  "id": 1
}
\`\`\`

### Resource Access Issues

#### Symptoms
- Resource not found
- Access denied
- Invalid resource URI

#### Diagnostic Steps
1. **Check URI Format**: Verify resource URI syntax
2. **Validate Permissions**: Ensure proper access rights
3. **Test Resource**: Try accessing resource directly
4. **Review Logs**: Check for detailed error information

## Protocol Validation

### Request Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "METHOD_NAME",
  "params": {
    // Method-specific parameters
  },
  "id": "unique-request-id"
}
\`\`\`

### Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    // Method-specific result
  },
  "id": "unique-request-id"
}
\`\`\`

### Error Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Error description",
    "data": {
      // Additional error details
    }
  },
  "id": "unique-request-id"
}
\`\`\`

## Debugging Tools

### MCP Client Testing
\`\`\`bash
# Install MCP CLI tools
npm install -g @modelcontextprotocol/cli

# Test server connection
mcp-client test ./dist/index.js

# List available tools
mcp-client tools ./dist/index.js

# Execute specific tool
mcp-client call ./dist/index.js list-users '{"top": 5}'
\`\`\`

### Manual Protocol Testing
\`\`\`typescript
// Test tool schema validation
import { z } from 'zod';

const schema = z.object({
  top: z.number().min(1).max(999).optional()
});

try {
  const result = schema.parse({ top: 10 });
  console.log('Valid parameters:', result);
} catch (error) {
  console.error('Schema validation failed:', error);
}
\`\`\`

## Performance Optimization

### Response Time Optimization
1. **Cache Results**: Cache Graph API responses
2. **Batch Requests**: Combine multiple operations
3. **Optimize Queries**: Use selective fields
4. **Connection Pooling**: Reuse HTTP connections

### Memory Management
1. **Limit Result Sets**: Use pagination
2. **Stream Large Data**: Process in chunks
3. **Clean Up Resources**: Properly dispose objects
4. **Monitor Usage**: Track memory consumption

## Integration Testing

### End-to-End Tests
\`\`\`typescript
describe('MCP Integration', () => {
  test('should list users successfully', async () => {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'list-users',
        arguments: { top: 5 }
      },
      id: '1'
    };
    
    const response = await mcpServer.handleRequest(request);
    
    expect(response.result).toBeDefined();
    expect(response.result.users).toHaveLength(5);
  });
});
\`\`\`

### Client Compatibility
- **Test Multiple Clients**: Ensure compatibility across different MCP clients
- **Validate Schemas**: Verify tool and resource schemas
- **Check Responses**: Ensure response format compliance
- **Monitor Performance**: Track response times and resource usage

## Error Recovery

### Graceful Degradation
1. **Fallback Mechanisms**: Provide alternative data sources
2. **Partial Responses**: Return partial data when possible
3. **Error Context**: Include helpful error information
4. **Retry Logic**: Implement intelligent retry strategies

### Circuit Breaker Pattern
\`\`\`typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           Date.now() - this.lastFailureTime < this.timeout;
  }
}
\`\`\``;
  }
} 