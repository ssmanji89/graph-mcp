---
description: Modular organization patterns for large implementations
globs: ["src/**/*.ts"]
alwaysApply: true
---

# Modular Organization Patterns

## Standard Directory Patterns

### Tool Files Pattern
```
tools/user/
├── types.ts               # User tool types only
├── list-users.ts          # Single tool implementation
├── get-user.ts            # Single tool implementation  
├── executors.ts           # Execution logic only
└── index.ts               # Export aggregation
```

### Service Files Pattern  
```
services/auth/
├── types.ts               # Auth types only
├── token-manager.ts       # Token operations only
├── auth-provider.ts       # Authentication logic only
└── index.ts               # Service aggregation
```

### Enterprise Module Pattern
```
enterprise/governance/
├── types.ts               # All interfaces/types
├── rbac-core.ts           # Core RBAC logic
├── permissions.ts         # Permission evaluation
├── compliance.ts          # Compliance logic
└── index.ts               # Module aggregation
```

## Implementation Rules

### 1. Single Responsibility
- One tool per file
- One service concern per file
- Clear separation of concerns

### 2. Export Patterns
```typescript
// ❌ Don't: Large monolithic files
// ✅ Do: Modular exports  
export { listUsersTool } from './list-users.js';
export { getUserTool } from './get-user.js';
```

### 3. Import Aggregation
Use index files for clean imports.