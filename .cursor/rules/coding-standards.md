---
description: Core coding standards and conventions for the Microsoft Graph MCP Server
globs: ["**/*.{ts,js,tsx,jsx}"]
alwaysApply: true
---

# Coding Standards

## TypeScript Standards

### Type Safety
- Use strict TypeScript configuration with `strict: true`
- Prefer explicit return types for all public functions
- Use `unknown` instead of `any` for better type safety
- Define interfaces for all Graph API response types

### Naming Conventions
- Use PascalCase for classes, interfaces, types, enums
- Use camelCase for variables, functions, methods
- Use SCREAMING_SNAKE_CASE for constants
- Use descriptive names that indicate purpose

### Code Organization
- Export types and interfaces from dedicated `types/` directory
- Group related functionality in logical modules
- Use barrel exports (index.ts) for clean imports
- Separate concerns: auth, graph client, MCP handlers

## Error Handling

### Error Types
```typescript
interface GraphError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}
```

### Error Patterns
- Always catch and transform Graph API errors for MCP responses
- Include request IDs for troubleshooting
- Log errors with appropriate severity levels
- Provide actionable error messages for AI agents

## Documentation Standards

### Code Comments
- Use JSDoc for all public functions and classes
- Include parameter descriptions and return value documentation
- Document complex business logic with inline comments
- Provide examples for non-obvious usage patterns

### Type Documentation
```typescript
/**
 * Represents a user query result from Microsoft Graph
 * @interface UserQueryResult
 */
interface UserQueryResult {
  /** Unique identifier for the user */
  id: string;
  /** User's display name */
  displayName: string;
  /** User's principal name (email) */
  userPrincipalName: string;
}
```