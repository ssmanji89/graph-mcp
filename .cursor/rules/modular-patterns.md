---
description: Modular code patterns for MCP tools and services
globs: ["src/**/*.ts"]
alwaysApply: true
---

# Modular Code Patterns

## Tool Implementation Pattern

### Individual Tool Files (Max 40 lines each)
```typescript
// tools/users/list-users.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const ListUsersSchema = z.object({
  top: z.number().optional(),
  filter: z.string().optional()
});

export function createListUsersTool(): Tool {
  return {
    name: 'list-users',
    description: 'List users in organization',
    inputSchema: {
      type: 'object',
      properties: {
        top: { type: 'number' },
        filter: { type: 'string' }
      }
    }
  };
}

export async function executeListUsers(
  graphClient: any, 
  args: unknown
): Promise<any> {
  const params = ListUsersSchema.parse(args);
  // Implementation logic here
  return { users: [] };
}
```

### Aggregation Pattern
```typescript
// tools/users/index.ts
export { createListUsersTool, executeListUsers } from './list-users.js';
export { createGetUserTool, executeGetUser } from './get-user.js';
```

## Service Modular Pattern

### Single Concern Services
```typescript
// services/cache/cache-manager.ts
export class CacheManager {
  private cache = new Map();
  
  get(key: string): any {
    return this.cache.get(key);
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }
}
```