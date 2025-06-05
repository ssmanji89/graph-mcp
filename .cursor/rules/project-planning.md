---
description: Agile project planning and management rules for Microsoft Graph MCP Server
globs: [".memory/*.md", "docs/planning/*.md", "*.md"]
alwaysApply: true
---

# Agile Project Planning and Management Rules

## Overview
This rule ensures consistent project planning, tracking, and documentation throughout the Microsoft Graph MCP Server development lifecycle.

## Planning Structure

### Epic and Feature Organization
- **Epic**: High-level business capability or technical infrastructure (8+ days effort)
- **Feature**: Specific functionality within an Epic (2-5 days effort)
- **Task**: Granular work items within a Feature (< 1 day effort)
- **Story**: User-focused description of desired functionality

### Planning Hierarchy
```
Phase (4+ weeks)
├── Epic 1 (8+ days)
│   ├── Feature 1.1 (2-5 days)
│   │   ├── Task 1.1.1 (< 1 day)
│   │   └── Task 1.1.2 (< 1 day)
│   └── Feature 1.2 (2-5 days)
└── Epic 2 (8+ days)
```

## Memory Bank Integration

### Required Memory Updates
When creating or updating project plans:

1. **Update .memory/40-active.md**:
   - Current sprint/phase status
   - Active priorities and weekly goals
   - Epic breakdown with status indicators
   - Immediate next steps

2. **Update .memory/50-progress.md**:
   - Completed work documentation
   - Current phase objectives and progress
   - Success metrics tracking
   - Risk mitigation status

3. **Reference .memory/01-brief.md**:
   - Ensure alignment with project goals
   - Validate against success criteria
   - Check constraint compliance

### Status Indicators
- ✅ **Complete**: Work finished and validated
- 🔄 **In Progress**: Currently being worked on
- ⏳ **Planned**: Scheduled but not started
- ⚠️ **Blocked**: Cannot proceed due to dependencies
- 🚫 **Cancelled**: No longer required

## Sprint Planning Rules

### Sprint Structure
- **Duration**: 1 week sprints within 4-week phases
- **Planning**: Begin each sprint with clear goals and tasks
- **Review**: End each sprint with progress assessment
- **Retrospective**: Weekly lessons learned and process improvement

### Sprint Documentation Format
```markdown
## Current Sprint: [Phase Name] (Week X of Y)

### Sprint Goals
- [ ] Goal 1 with measurable outcome
- [ ] Goal 2 with measurable outcome

### Active Priorities
- [x] **Completed Item**: Description
- [ ] **In Progress Item**: Description
- [ ] **Planned Item**: Description

### Immediate Next Steps
1. Specific actionable task
2. Specific actionable task
```

## Quality Gates

### Epic Completion Criteria
Each Epic must meet these criteria before closure:
- [ ] All features within Epic completed
- [ ] Quality metrics achieved (test coverage, documentation)
- [ ] Stakeholder acceptance obtained
- [ ] Documentation updated in memory bank

### Phase Completion Criteria
Each Phase must meet these criteria before advancement:
- [ ] All Epic completion criteria met
- [ ] Phase objectives achieved
- [ ] Success metrics on track
- [ ] Risk mitigation plans executed
- [ ] Next phase planning completed

## Progress Tracking

### Weekly Updates Required
Every week, update memory bank with:
- Sprint progress assessment
- Completed tasks and outcomes
- Blockers and risk mitigation
- Next week's priorities

### Metrics to Track
- **Velocity**: Stories/tasks completed per sprint
- **Quality**: Test coverage, defect rates, code review feedback
- **Scope**: Feature scope changes and impact
- **Timeline**: Actual vs. planned completion dates

## Risk Management

### Risk Categories
- **Technical**: Architecture, performance, security concerns
- **Community**: Documentation, support, contribution barriers
- **Publication**: Package quality, discovery, maintenance
- **Timeline**: Scope creep, dependency delays, resource constraints

### Risk Documentation Format
```markdown
### [Risk Category] Risks [Status]
- **Risk Description**: Clear statement of risk
- **Impact**: High/Medium/Low impact on project success
- **Probability**: High/Medium/Low likelihood of occurrence
- **Mitigation**: Specific actions taken or planned
- **Status**: Active monitoring/Mitigated/Resolved
```

## Automation Rules

### Trigger Updates
These events should trigger memory bank updates:
- Sprint planning completed
- Epic or Feature status changed
- Milestone reached
- Risk status changed
- Quality gate passed/failed

### Update Templates
Use consistent templates for:
- Sprint planning documentation
- Progress reporting
- Risk assessment updates
- Milestone completion records

## Review and Retrospective

### Weekly Reviews
Each week, assess:
- Sprint goal achievement
- Quality metrics progress
- Risk status changes
- Process effectiveness

### Phase Retrospectives
At phase completion:
- Document lessons learned
- Identify process improvements
- Update planning templates
- Share insights across team

## Integration with Development

### Code-Planning Alignment
- Link commits to tasks where possible
- Reference Epic/Feature in pull requests
- Update progress based on code completion
- Maintain traceability from requirements to implementation

### Documentation Standards
- Keep planning documents current with implementation
- Ensure memory bank reflects actual project state
- Maintain consistency between code and planning artifacts
- Regular validation of documented vs. actual progress 