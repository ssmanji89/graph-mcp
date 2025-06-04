---
description: Memory-driven development methodology using mem:search for context-aware implementation
globs: ["**/*.{ts,js,md,json}"]
alwaysApply: true
---

# Memory-Driven Development Methodology

## Core Principle
Every development decision must be informed by project context retrieved through `mem:search`. No implementation should proceed without consulting the Memory Bank for relevant patterns, decisions, and requirements.

## Mandatory Search Patterns

### Before Starting Any Task
```
REQUIRED SEARCHES:
1. mem:search "[task domain] requirements"
2. mem:search "[component type] patterns" 
3. mem:search "[feature area] decisions"
4. mem:search "similar implementation examples"
```

### Phase Transition Protocol
```
PHASE ENTRY CHECKLIST:
□ mem:search "current phase completion criteria"
□ mem:search "next phase requirements" 
□ mem:search "blocking dependencies"
□ mem:search "architectural constraints"
□ Update .memory/40-active.md with findings
```

## Context Integration Workflow

### 1. Research Mode Search Strategy
- **Broad Context**: `mem:search "project goals [feature area]"`
- **Technical Requirements**: `mem:search "[component] architecture requirements"`
- **User Needs**: `mem:search "[user type] use cases [feature]"`
- **Constraints**: `mem:search "constraints limitations [domain]"`

### 2. Planning Mode Search Strategy  
- **Existing Patterns**: `mem:search "[component type] implementation patterns"`
- **Dependencies**: `mem:search "[feature] dependencies requirements"`
- **Standards**: `mem:search "coding standards [technology]"`
- **Previous Decisions**: `mem:search "decisions [related area]"`

### 3. Implementation Search Strategy
- **Code Patterns**: `mem:search "[language] [pattern type] examples"`
- **Error Handling**: `mem:search "error handling [component type]"`
- **Testing Approach**: `mem:search "testing [component] patterns"`
- **Security Requirements**: `mem:search "security [operation type]"`

## Memory Update Triggers

### Automatic Updates Required
- After completing any RIPER-5 mode
- When making architectural decisions
- Upon discovering new requirements
- After resolving significant issues

### Update Process
1. `mem:search "current progress [area]"` - Check existing context
2. Update relevant .memory/ files with new information
3. Add any new patterns to .cursor/rules/
4. Update semantic index with new keywords
5. `mem:update` to refresh the system

## Search Query Optimization

### Effective Query Patterns
- **Specific**: "Graph API authentication flows" vs "authentication"
- **Multi-keyword**: "MCP tools error handling patterns"
- **User-focused**: "IT administrator user management requirements"
- **Technical**: "TypeScript interface Graph API response"

### Query Categories by Development Phase
- **Requirements**: "[user type] needs", "business requirements", "constraints"
- **Architecture**: "system design", "component patterns", "data flow"
- **Implementation**: "code examples", "error handling", "testing patterns"
- **Integration**: "API patterns", "authentication", "deployment"

## Context Validation Rules

### Before Implementation
- [ ] Searched for existing similar implementations
- [ ] Verified alignment with architectural decisions
- [ ] Confirmed compliance with coding standards
- [ ] Validated against user requirements

### During Implementation
- [ ] Referenced applicable project rules
- [ ] Followed established patterns
- [ ] Maintained consistency with memory bank context
- [ ] Documented any new patterns discovered

## Memory Bank Health Monitoring

### Weekly Health Checks
```bash
# Check memory bank completeness
mem:search "TODO incomplete items"
mem:search "missing documentation areas"
mem:search "outdated information"
```

### Quality Indicators
- Search queries return relevant results (>80% relevance)
- All major decisions documented and searchable
- Implementation patterns consistently applied
- No contradictions between memory files

## Integration with RIPER-5 Modes

### Research Mode
- Start with `mem:search "research methodology [domain]"`
- Use memory context to focus research efforts
- Document findings in structured format for indexing

### Innovate Mode  
- Search for existing solutions before brainstorming
- Build on documented patterns and decisions
- Reference user needs from memory bank

### Plan Mode
- Validate plans against architectural decisions
- Ensure consistency with established patterns
- Reference implementation examples from memory

### Execute Mode
- Follow patterns established in project rules
- Reference coding standards and examples
- Maintain consistency with documented architecture

### Review Mode
- Compare implementation against documented requirements
- Verify adherence to established patterns
- Update memory bank with lessons learned