# Contributing to Microsoft Graph MCP Server

Welcome to our community! We're excited to have you contribute to the Microsoft Graph MCP Server project. This guide will help you get started with contributing effectively.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Search existing issues before creating new ones
- Use the bug report template
- Include detailed reproduction steps
- Provide system information and error logs

### 💡 Feature Requests
- Check our [roadmap](./docs/roadmap.md) first
- Use GitHub Discussions for feature ideas
- Follow the feature request template
- Explain the business value and use case

### 🛠️ Code Contributions
- Fork the repository
- Create feature branches from `main`
- Follow our coding standards
- Add tests for new functionality
- Update documentation

### 📚 Documentation
- Fix typos and improve clarity
- Add examples and tutorials
- Update API documentation
- Translate content (future)

### 🧩 Extensions
- Build community tools and resources
- Follow extension development guidelines
- Share in our community registry
- Help others with extension development

## 🚀 Getting Started

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/graph-mcp-server.git
   cd graph-mcp-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your Azure app credentials
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, tested code
   - Follow TypeScript best practices
   - Add JSDoc comments for public APIs

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new graph tool for calendar management"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use Zod for runtime validation
- Follow established patterns in existing code

### Code Style
- Use Prettier for formatting (automated)
- Follow ESLint rules (automated)
- Use meaningful variable and function names
- Keep functions focused and small

### File Organization
- Follow existing directory structure
- Use appropriate file sizes (see `.cursor/rules/file-size-limits.md`)
- Group related functionality
- Export public APIs through index files

### Testing Standards
- Write unit tests for all new functions
- Add integration tests for MCP tools
- Mock external dependencies appropriately
- Aim for >80% code coverage

## 🧩 Extension Development

### Creating Extensions

1. **Use Extension Template**
   ```bash
   npx @graph-mcp/create-extension my-extension
   ```

2. **Follow Extension API**
   - Implement required interfaces
   - Use Zod schemas for validation
   - Include comprehensive error handling
   - Add thorough documentation

3. **Testing Extensions**
   - Test with real Graph API endpoints
   - Validate error scenarios
   - Test permission requirements
   - Performance test with large datasets

### Extension Submission
- Follow extension guidelines
- Include example usage
- Provide demo data or scenarios
- Submit to community registry

## 📚 Documentation Standards

### Writing Guidelines
- Write clear, concise prose
- Include practical examples
- Use consistent terminology
- Structure content logically

### Code Documentation
- Add JSDoc comments for all public APIs
- Include parameter descriptions and examples
- Document return types and error conditions
- Provide usage examples

### API Documentation
- Keep API docs synchronized with code
- Include authentication requirements
- Show example requests and responses
- Document rate limits and best practices

## 🔍 Review Process

### Pull Request Guidelines
- Fill out the PR template completely
- Reference related issues
- Include testing instructions
- Add screenshots for UI changes

### Review Criteria
- Code follows established patterns
- Tests provide adequate coverage
- Documentation is updated
- No breaking changes without discussion
- Security considerations addressed

### Review Timeline
- Initial review within 2 business days
- Feedback incorporated within 1 week
- Final approval and merge within 2 weeks

## 🏆 Recognition

### Contributor Levels
- **First-time Contributor**: Welcome package and recognition
- **Regular Contributor**: Listed in contributors section
- **Core Contributor**: Code review privileges
- **Maintainer**: Release and roadmap input

### Recognition Programs
- Monthly contributor spotlight
- Annual contributor awards
- Conference presentation opportunities
- Microsoft Graph API team connections

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Celebrate community achievements

### Communication
- Use GitHub Discussions for questions
- Join our Discord for real-time chat
- Attend monthly office hours
- Participate in community events

### Mentorship
- New contributors get mentor assignment
- Experienced contributors mentor others
- Regular mentorship check-ins
- Skill development opportunities

## 🚨 Security

### Reporting Security Issues
- Email security@graph-mcp.dev
- Do not create public issues for security vulnerabilities
- Include detailed reproduction steps
- Provide fix suggestions if possible

### Security Guidelines
- Never commit credentials or secrets
- Follow Microsoft Graph security best practices
- Validate all user inputs
- Use principle of least privilege

## 📋 Checklist Templates

### Pull Request Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Security implications considered

### Extension Checklist
- [ ] Follows extension API
- [ ] Includes comprehensive tests
- [ ] Documentation complete
- [ ] Example usage provided
- [ ] Performance acceptable

## 📞 Getting Help

### Support Channels
- 💬 [GitHub Discussions](https://github.com/microsoft/graph-mcp-server/discussions)
- 🗣️ [Discord Community](https://discord.gg/graph-mcp)
- 📧 Email: community@graph-mcp.dev
- 📺 [Office Hours](./docs/community/office-hours.md)

### Mentorship
- Request mentor assignment in Discord
- Join weekly mentorship sessions
- Access learning resources and guides
- Get code review from experienced contributors

---

Thank you for contributing to the Microsoft Graph MCP Server! Together, we're building the future of AI-powered Microsoft 365 automation. 🚀 