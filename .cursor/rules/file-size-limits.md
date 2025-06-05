---
description: Strict 50-line file size limits
globs: ["**/*.ts", "**/*.js"]
alwaysApply: true
---

# MANDATORY 50-Line File Limit

## Absolute Rule
Every file MUST be under 50 lines. NO EXCEPTIONS.

## Split Protocol
When file reaches 45 lines:
1. STOP writing
2. SPLIT immediately  
3. Follow established patterns

## Split Triggers
- File reaches 45 lines
- Function exceeds 30 lines
- Class has >5 methods
- More than 5 imports

## Standard Patterns
- `index.ts` - Exports only (<20 lines)
- `types.ts` - Type definitions
- `schemas.ts` - Validation schemas
- `impl.ts` - Implementation details
- `utils.ts` - Utility functions

## Split Strategies
1. Extract implementations to `*-impl.ts`
2. Move types to `types.ts`
3. Separate schemas to `schemas.ts`
4. Create focused utility files

## Quality Standards
- Single responsibility per file
- Clear naming conventions
- Minimal dependencies
- Focused imports (maximum 5)