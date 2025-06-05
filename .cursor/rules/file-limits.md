---
description: Strict file size limits
globs: ["src/**/*.ts"]
alwaysApply: true
---

# File Size Limits

## Maximum Sizes
- **Files**: 40 lines maximum
- **Functions**: 15 lines maximum  
- **Interfaces**: 10 lines maximum

## Split Requirements
- One tool per file
- One service concern per file
- Use index.ts for exports

## Examples
```typescript
// ✅ Good: Single tool file
export function createListUsersTool(): Tool {
  return {
    name: 'list-users',
    description: 'List users',
    inputSchema: { /* schema */ }
  };
}

// ✅ Good: Single executor
export async function executeListUsers(
  client: GraphClient, 
  args: unknown
): Promise<any> {
  // Implementation
}
```

## Enforcement
Files over 40 lines must be split immediately.
No exceptions for "almost done" implementations.