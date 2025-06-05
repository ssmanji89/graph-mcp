---
description: Strict file size enforcement rules
globs: ["src/**/*.ts", "src/**/*.js"]
alwaysApply: true
---

# File Size Enforcement

## Hard Limits
- **Maximum file size**: 50 lines (no exceptions)
- **Target file size**: 30-40 lines
- **Function maximum**: 15 lines
- **Interface maximum**: 10 lines

## When Limit Exceeded

### Immediate Action Required:
1. **STOP** writing to the oversized file
2. **REDESIGN** into logical chunks
3. **CREATE** separate focused files
4. **AGGREGATE** through index.ts

### Warning Message:
```
File was written with warning: Line count limit exceeded
SOLUTION: Split your content into smaller chunks
```

## Modular Approach Required
```typescript
// ❌ Bad: One large file (100+ lines)
export class LargeService { /* too much */ }

// ✅ Good: Multiple focused files
// types.ts - interfaces only
// core.ts - main logic only
// utils.ts - helper functions only
// index.ts - aggregates exports
```

## No Append Mode for Large Files
- Append mode only for small additions (< 10 lines)
- Large implementations must be properly modularized
- Always redesign oversized files

## Enforcement
- Files over 50 lines must be split immediately
- No exceptions for "almost done" implementations
- Prefer many small files over few large files