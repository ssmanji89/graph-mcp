---
description: Chunked writing strategy for large file implementations
globs: ["src/**/*.ts", "src/**/*.js"]  
alwaysApply: true
---

# Chunked Writing Strategy

## When You See This Warning:
```
File was written with warning: Line count limit exceeded: X lines (maximum: 50).
SOLUTION: Split your content into smaller chunks
```

## Immediate Actions Required:

### 1. STOP Current Implementation
- Do not continue adding to the oversized file
- Do not attempt to append more content

### 2. REDESIGN Into Logical Chunks
- Identify natural separation points (types, core logic, utilities)
- Plan separate focused files
- Design clean export/import structure

### 3. IMPLEMENT Modular Structure
```typescript
// Instead of one large file, create:
// types.ts (interfaces and types only)
// core.ts (main logic only)  
// utils.ts (utility functions only)
// index.ts (aggregates exports)
```

### 4. USE Index Files for Aggregation
```typescript
// index.ts
export * from './types';
export * from './core';
export * from './utils';
```

## File Size Targets
- **Target**: 30-40 lines per file
- **Maximum**: 50 lines (hard limit)
- **Functions**: 15 lines maximum
- **Interfaces**: 10 lines maximum

## Examples of Good Separation
```typescript
// ✅ Good: rbac-types.ts (types only)
export interface Role { ... }

// ✅ Good: rbac-core.ts (core logic only)
export class RBACCore { ... }
```

## Never Use Append Mode for Large Files
- Append mode is for small additions only
- Large implementations must be properly chunked
- Always redesign oversized files into modules