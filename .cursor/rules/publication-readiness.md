---
description: NPM publication and GitHub release readiness standards for Microsoft Graph MCP Server
globs: ["package.json", "README.md", "CONTRIBUTING.md", ".github/**/*", "docs/**/*"]
alwaysApply: true
---

# Publication Readiness Standards

## Overview
This rule ensures the Microsoft Graph MCP Server meets all requirements for successful NPM publication and GitHub release.

## NPM Package Requirements

### package.json Validation
Required fields for publication:
```json
{
  "name": "microsoft-graph-mcp-server",
  "version": "semantic version (e.g., 1.0.0)",
  "description": "Clear, compelling description < 200 characters",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["microsoft-graph", "mcp", "ai", "typescript", "automation"],
  "author": "Author name or organization",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/microsoft/graph-mcp-server.git"
  },
  "bugs": {
    "url": "https://github.com/microsoft/graph-mcp-server/issues"
  },
  "homepage": "https://github.com/microsoft/graph-mcp-server#readme",
  "files": [
    "dist/",
    "docs/",
    "templates/",
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE"
  ],
  "bin": {
    "graph-mcp": "./dist/cli/index.js"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Build Artifacts Validation
- [ ] `dist/` directory contains complete compiled TypeScript
- [ ] All `.d.ts` type definition files generated
- [ ] Source maps included for debugging
- [ ] CLI executables are properly built and executable
- [ ] No source TypeScript files in dist (only compiled .js)

### Quality Gates for NPM
- [ ] Test coverage ≥ 85%
- [ ] Zero critical security vulnerabilities (`npm audit`)
- [ ] Zero ESLint errors
- [ ] All tests pass on Node.js versions 18, 20, 21
- [ ] Package installs cleanly in fresh environment
- [ ] CLI commands execute without errors

## GitHub Release Requirements

### Repository Structure
Required files in repository root:
- [ ] `README.md` - Comprehensive project overview
- [ ] `CONTRIBUTING.md` - Contribution guidelines
- [ ] `LICENSE` - MIT license file
- [ ] `CHANGELOG.md` - Version history
- [ ] `.github/` - Issue templates, PR templates, workflows

### README.md Standards
Must include:
```markdown
# Project Title
Brief, compelling description

## Features
- Key feature 1
- Key feature 2

## Quick Start
```bash
npm install microsoft-graph-mcp-server
# Basic usage example
```

## Installation & Configuration
Step-by-step setup instructions

## Documentation
Links to comprehensive docs

## Contributing
Link to CONTRIBUTING.md

## License
MIT License statement
```

### Release Automation
Required GitHub Actions workflows:
- [ ] **CI/CD**: Test, lint, build on every PR
- [ ] **Release**: Automated NPM publish on tag
- [ ] **Security**: Dependency scanning and updates
- [ ] **Documentation**: Auto-generate docs on changes

## Documentation Standards

### User Documentation
Required documentation:
- [ ] **Installation Guide**: Step-by-step setup
- [ ] **Quick Start**: 5-minute getting started
- [ ] **API Reference**: Complete tool and resource documentation
- [ ] **Configuration**: All environment variables and options
- [ ] **Troubleshooting**: Common issues and solutions
- [ ] **Examples**: Real-world usage scenarios

### Developer Documentation
Required for contributors:
- [ ] **Development Setup**: Local environment configuration
- [ ] **Architecture**: System design and component overview
- [ ] **Contributing Guide**: How to contribute code
- [ ] **Extension Development**: Creating custom tools/resources
- [ ] **Testing**: How to run and write tests
- [ ] **Release Process**: How releases are managed

## Security Standards

### Vulnerability Management
- [ ] No critical or high-severity vulnerabilities
- [ ] All dependencies up to date
- [ ] Security policy documented
- [ ] Responsible disclosure process defined

### Authentication Security
- [ ] OAuth 2.0 flows properly implemented
- [ ] Token storage follows security best practices
- [ ] No secrets in repository or published package
- [ ] Environment variable configuration documented

## Performance Standards

### Runtime Performance
- [ ] Tool execution time < 500ms for typical operations
- [ ] Authentication token acquisition < 200ms
- [ ] Memory usage stable with no leaks
- [ ] Graceful handling of rate limits

### Package Performance
- [ ] Package size < 50MB compressed
- [ ] Installation time < 30 seconds
- [ ] Start-up time < 2 seconds
- [ ] CLI responsiveness < 100ms for help commands

## Community Standards

### Issue Management
Required GitHub repository setup:
- [ ] Issue templates for bugs, features, questions
- [ ] Clear labeling system
- [ ] Response time commitments documented
- [ ] Triage process defined

### Pull Request Process
- [ ] PR template with checklist
- [ ] Required status checks configured
- [ ] Branch protection rules enabled
- [ ] Code review requirements set

### Community Guidelines
- [ ] Code of Conduct published
- [ ] Contribution guidelines clear
- [ ] Recognition system for contributors
- [ ] Communication channels documented

## Pre-Publication Checklist

### Final Validation
Before publishing to NPM:
- [ ] All tests pass in CI
- [ ] Security audit clean
- [ ] Documentation complete and accurate
- [ ] Package.json validated
- [ ] Build artifacts verified
- [ ] Version number appropriate
- [ ] Changelog updated
- [ ] GitHub release prepared

### Post-Publication Monitoring
After publishing:
- [ ] NPM package accessible and installable
- [ ] GitHub release published successfully
- [ ] Documentation links working
- [ ] Community channels monitoring
- [ ] Initial feedback collection
- [ ] Download metrics tracking

## Version Management

### Semantic Versioning
Follow semantic versioning (semver):
- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### Release Frequency
- **Major releases**: Quarterly or for breaking changes
- **Minor releases**: Monthly for new features
- **Patch releases**: As needed for bug fixes
- **Security patches**: Immediate for critical vulnerabilities

## Quality Metrics

### Success Criteria for v1.0.0
- [ ] NPM downloads: 100+ in first week
- [ ] GitHub stars: 50+ in first month
- [ ] Zero critical issues reported
- [ ] Documentation feedback positive
- [ ] Community engagement active

### Ongoing Health Metrics
Track these metrics post-publication:
- Download trends and growth
- Issue resolution time
- Community contribution rate
- Security vulnerability response time
- User satisfaction surveys 