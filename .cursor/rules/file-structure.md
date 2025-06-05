---
description: File structure and size limits for Microsoft Graph MCP Server
globs: ["**/*.ts", "**/*.js"]
alwaysApply: true
---

# File Structure Rules

## STRICT 50-Line Limit

**MANDATORY**: Every file MUST be under 50 lines. NO EXCEPTIONS.

### Enforcement Strategy

When any file exceeds 45 lines during development:

1. **STOP** - Do not continue writing
2. **SPLIT** - Break into smaller, focused files
3. **ORGANIZE** - Follow the established patterns

### File Splitting Patterns

#### Tool Implementation Pattern (from `src/tools/`)
```
tool-name/
├── index.ts          # Exports and registry (< 20 lines)
├── tool-name.ts      # Tool definition (< 20 lines)  
├── tool-name-impl.ts # Implementation (< 50 lines)
├── schemas.ts        # Validation schemas (< 50 lines)
└── helpers.ts        # Utility functions (< 50 lines)
```

#### API Implementation Pattern
```
feature-name/
├── index.ts          # Main exports (< 20 lines)
├── api.ts           # Route definitions (< 50 lines)
├── handlers.ts      # Request handlers (< 50 lines)
├── validators.ts    # Input validation (< 50 lines)
└── types.ts         # Type definitions (< 50 lines)
```

#### Service Implementation Pattern
```
service-name/
├── index.ts          # Main service class (< 50 lines)
├── core.ts          # Core functionality (< 50 lines)
├── utils.ts         # Utility functions (< 50 lines)
└── types.ts         # Service types (< 50 lines)
```

### Required Split Triggers

**Immediately split when:**
- File reaches 45 lines
- Function exceeds 30 lines
- Class has more than 5 methods
- More than 3 imports from same module

### Split Strategies

1. **Functional Decomposition**
   - Extract utility functions
   - Separate validation logic
   - Split request handlers

2. **Domain Separation**
   - Group related functionality
   - Separate types and interfaces
   - Extract constants and configs

3. **Layer Separation**
   - API layer (routes, validation)
   - Business layer (logic, processing)
   - Data layer (types, schemas)

### File Naming Conventions

- `index.ts` - Main exports only
- `types.ts` - Type definitions
- `schemas.ts` - Validation schemas
- `utils.ts` - Utility functions
- `handlers.ts` - Request handlers
- `core.ts` - Core implementation
- `impl.ts` - Implementation details

### Import Organization

Maximum 5 imports per file:
```typescript
// ✅ Good
import { Router } from 'express';
import { z } from 'zod';
import { Logger } from '../logger';

// ❌ Bad - too many imports
import { Router, Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { Logger, LogLevel, LogEntry } from '../logger';
```

### Code Quality Standards

- **Single Responsibility**: Each file serves one purpose
- **Clear Naming**: File names describe exact contents
- **Minimal Dependencies**: Keep imports focused
- **Export Clarity**: Clear public interface