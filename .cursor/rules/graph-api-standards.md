---
description: Microsoft Graph API integration standards and best practices
globs: ["**/graph/**/*.{ts,js}", "**/auth/**/*.{ts,js}"]
alwaysApply: true
---

# Microsoft Graph API Standards

## Authentication Patterns

### MSAL Configuration
```typescript
const msalConfig = {
  auth: {
    clientId: process.env.GRAPH_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret: process.env.GRAPH_CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => logger.debug(message),
      piiLoggingEnabled: false
    }
  }
};
```

### Token Management
- Always check token expiration before requests
- Implement automatic token refresh logic
- Store tokens securely (never in logs or errors)
- Use appropriate scopes for minimal permissions

## Request Patterns

### Standard Graph Client Setup
```typescript
const graphClient = Client.initWithMiddleware({
  authProvider: authProvider,
  middleware: [
    new RetryHandler(),
    new RedirectHandler(),
    new TelemetryHandler()
  ]
});
```

### Query Construction
- Use Graph SDK client when possible
- Implement proper OData query building
- Always include error handling for malformed queries
- Support pagination for large result sets

### Batch Operations
```typescript
const batch = new BatchRequestContent([
  {
    id: '1',
    request: new Request('/users', { method: 'GET' })
  },
  {
    id: '2', 
    request: new Request('/groups', { method: 'GET' })
  }
]);
```

## Error Handling

### Graph API Error Structure
```typescript
interface GraphApiError {
  code: string;
  message: string;
  innerError?: {
    code: string;
    message: string;
    'request-id': string;
  };
}
```

### Retry Logic
- Implement exponential backoff for 429 responses
- Retry on transient errors (5xx status codes)
- Do not retry on authentication errors (401, 403)
- Include jitter to prevent thundering herd