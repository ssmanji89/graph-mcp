---
description: Automated triggers and processes for agile planning and memory bank updates
globs: ["**/*.md", "package.json", ".github/**/*", "src/**/*"]
alwaysApply: true
---

# Agile Automation Rules

## Overview
This rule defines automated triggers and processes to ensure the project planning and memory bank system stays current and accurate.

## Automated Memory Bank Updates

### Git Hook Triggers
Automatically trigger memory bank updates on these Git events:

#### Pre-commit Hooks
```bash
# Update active state if planning files changed
if git diff --cached --name-only | grep -E "(\.memory/40-active\.md|\.memory/50-progress\.md)"; then
  echo "Planning files updated - validating memory bank consistency"
  # Run validation script
fi
```

#### Post-commit Hooks
```bash
# Auto-update progress after significant commits
if git log -1 --pretty=format:"%s" | grep -E "(feat:|fix:|docs:|BREAKING CHANGE)"; then
  echo "Significant commit detected - updating memory bank"
  # Trigger mem:update equivalent
fi
```

### File Change Triggers
Monitor these files for changes and trigger updates:

- **Epic/Feature Completion**: When Epic status changes in `.memory/40-active.md`
- **Quality Gates**: When test coverage or build status changes
- **Documentation**: When README.md or docs/ files are updated
- **Package Changes**: When package.json version or dependencies change

### Weekly Automation
Every Monday, automatically:
1. Generate sprint progress report
2. Update velocity metrics
3. Check for stale tasks
4. Validate memory bank consistency
5. Create weekly planning template

## Quality Gate Automation

### Continuous Integration Triggers
On every pull request:
```yaml
name: Quality Gates
on: [pull_request]
jobs:
  validate-planning:
    runs-on: ubuntu-latest
    steps:
      - name: Check memory bank consistency
        run: |
          # Validate that .memory files are internally consistent
          # Check that active work aligns with progress tracking
          # Ensure Epic/Feature status indicators are accurate
      
      - name: Validate test coverage
        run: |
          # Check if test coverage meets 85% threshold
          # Update .memory/40-active.md if coverage gates pass
      
      - name: Check documentation completeness
        run: |
          # Validate that new features have documentation
          # Check that API changes are documented
```

### Release Preparation Triggers
When version number changes in package.json:
1. Validate all quality gates are met
2. Update `.memory/50-progress.md` with completed work
3. Generate changelog from commits and memory bank
4. Validate publication readiness checklist
5. Create release preparation checklist

## Sprint Planning Automation

### Sprint Boundary Detection
Automatically detect sprint boundaries:
- **Sprint Start**: When new goals are added to `.memory/40-active.md`
- **Sprint End**: When all sprint goals marked complete
- **Phase Transition**: When Epic status changes from "In Progress" to "Complete"

### Planning Document Generation
Auto-generate planning documents:

#### Weekly Sprint Template
```markdown
## Sprint Planning: [Week X] - [Date Range]

### Previous Sprint Review
- Goals Achieved: [Auto-populated from memory bank]
- Velocity: [Calculated from completed tasks]
- Blockers Resolved: [From previous sprint issues]

### Current Sprint Goals
- [ ] Goal 1: [Template for manual input]
- [ ] Goal 2: [Template for manual input]

### Resource Allocation
- Development: [X] hours available
- Testing: [X] hours planned
- Documentation: [X] hours allocated

### Risk Assessment
- [Auto-populated known risks from memory bank]
```

#### Epic Progress Report
```markdown
## Epic Progress Report: [Epic Name]

### Completion Status
- Features Complete: X/Y (Z%)
- Tasks Remaining: [Auto-populated list]
- Estimated Completion: [Based on velocity]

### Quality Metrics
- Test Coverage: X% (Target: 85%)
- Documentation: [Complete/In Progress/Planned]
- Security Audit: [Status]

### Blockers and Risks
- [Auto-populated from issue tracking]
```

## Issue and Task Management

### GitHub Integration
Automatically sync with GitHub issues:

#### Issue Creation
When new tasks added to memory bank:
```javascript
// Create GitHub issue if task marked as "blocked" or "help wanted"
if (task.status === 'blocked' || task.labels.includes('community')) {
  createGitHubIssue({
    title: `[${epic.name}] ${task.title}`,
    body: generateTaskDescription(task),
    labels: task.labels
  });
}
```

#### Issue Updates
When task status changes:
```javascript
// Update GitHub issue status based on memory bank changes
if (task.statusChanged) {
  updateGitHubIssue(task.issueId, {
    state: task.status === 'complete' ? 'closed' : 'open',
    labels: task.labels
  });
}
```

### Progress Tracking
Automatically calculate and update:
- Epic completion percentage
- Sprint velocity (tasks/week)
- Quality metrics trends
- Risk mitigation progress

## Documentation Automation

### README Updates
When package.json or core features change:
1. Update feature list in README.md
2. Refresh installation instructions
3. Update version references
4. Validate all links are working

### API Documentation
When source code changes:
1. Regenerate TypeScript documentation
2. Update tool and resource documentation
3. Refresh usage examples
4. Validate code examples still work

### Changelog Generation
Automatically maintain CHANGELOG.md:
```javascript
// Generate changelog entries from commits and memory bank
generateChangelog({
  version: newVersion,
  features: extractFeaturesFromMemoryBank(),
  fixes: extractFixesFromCommits(),
  breaking: extractBreakingChanges(),
  deprecated: extractDeprecations()
});
```

## Notification System

### Stakeholder Alerts
Send automated notifications for:
- Epic completion
- Quality gate failures
- Sprint goal achievement
- Release milestone reached
- Critical issues detected

### Team Communication
Integration with communication channels:
```javascript
// Slack/Discord integration for team updates
notifyTeam({
  channel: '#development',
  message: `Sprint ${sprintNumber} completed!
  - Goals achieved: ${goalsAchieved}/${totalGoals}
  - Velocity: ${velocity} tasks/week
  - Next sprint starts: ${nextSprintDate}`
});
```

## Metrics and Analytics

### Automated Metrics Collection
Track and update these metrics automatically:

#### Velocity Metrics
- Tasks completed per sprint
- Epic completion timeline
- Feature delivery rate
- Quality gate pass rate

#### Quality Metrics
- Test coverage trends
- Security vulnerability count
- Documentation completeness
- Code review turnaround time

#### Community Metrics
- Issue response time
- Pull request merge time
- Community contribution rate
- Extension ecosystem growth

### Dashboard Updates
Automatically update project dashboards:
1. GitHub repository insights
2. Memory bank metrics summary
3. Publication readiness status
4. Community health indicators

## Error Handling and Recovery

### Automation Failure Recovery
When automation fails:
1. Log failure with context
2. Notify team of manual intervention needed
3. Provide recovery instructions
4. Update automation to prevent recurrence

### Data Consistency Validation
Regular validation of:
- Memory bank internal consistency
- GitHub issue sync accuracy
- Documentation alignment with code
- Planning document accuracy

## Configuration and Customization

### Automation Settings
Configurable automation behaviors:
```json
{
  "automation": {
    "memoryUpdates": {
      "enabled": true,
      "triggers": ["commit", "pr", "weekly"],
      "threshold": "significant-changes"
    },
    "notifications": {
      "channels": ["slack", "email"],
      "frequency": "daily",
      "priority": "high"
    },
    "qualityGates": {
      "testCoverage": 85,
      "securityScan": "required",
      "documentation": "complete"
    }
  }
}
```

### Custom Triggers
Allow project-specific automation:
- Custom quality gates
- Project-specific metrics
- Integration with external tools
- Custom notification rules 