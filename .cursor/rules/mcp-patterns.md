---
description: MCP protocol implementation patterns and standards
globs: ["**/*mcp*.{ts,js}", "**/tools/*.{ts,js}", "**/resources/*.{ts,js}"]
alwaysApply: true
---

# MCP Implementation Patterns

## Tool Implementation

### Standard Tool Structure
```typescript
interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (params: unknown) => Promise<MCPToolResult>;
}
```

### Tool Naming Convention
- Use verb-noun pattern: `list-users`, `create-group`, `get-user-details`
- Group related tools with prefixes: `user-`, `group-`, `team-`
- Keep names descriptive but concise

### Input Validation
- Always validate inputs using Zod schemas
- Provide clear error messages for validation failures
- Support both required and optional parameters
- Document parameter types and constraints

## Resource Implementation

### Resource Categories
- **Documentation**: `/docs/graph-api`, `/docs/permissions`
- **Schemas**: `/schemas/user`, `/schemas/group`
- **Examples**: `/examples/queries`, `/examples/batch`
- **Troubleshooting**: `/troubleshooting/errors`, `/troubleshooting/permissions`

### Dynamic Resources
```typescript
async function getResourceHandler(uri: string): Promise<MCPResource> {
  // Parse URI and determine resource type
  // Fetch current data from Graph API if needed
  // Return formatted resource with content
}
```

## Error Handling Patterns

### Graph API Error Transformation
```typescript
function transformGraphError(error: GraphApiError): MCPError {
  return {
    code: getErrorCode(error.status),
    message: sanitizeErrorMessage(error.message),
    data: {
      graphCode: error.code,
      requestId: error.requestId
    }
  };
}
```

### Common Error Codes
- `-32001`: Graph API authentication failed
- `-32002`: Insufficient permissions
- `-32003`: Rate limit exceeded
- `-32004`: Resource not found
- `-32005`: Invalid request parameters