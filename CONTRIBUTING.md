# Contributing to Amora

Thank you for your interest in contributing to Amora! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Respect privacy and confidentiality

## Development Workflow

### Branch Naming

- `feature/description` — New features
- `bugfix/description` — Bug fixes
- `hotfix/description` — Critical fixes
- `docs/description` — Documentation updates

### Commit Messages

Follow conventional commits:

```
feat: add AI matching algorithm
fix: resolve WebSocket reconnection issue
docs: update API documentation
style: format code with prettier
refactor: simplify auth middleware
test: add unit tests for matching service
chore: update dependencies
```

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass
3. Update the CHANGELOG.md
4. Request review from at least one team member
5. Squash commits before merging

## Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use explicit return types for functions
- Avoid `any` type

### React
- Use functional components with hooks
- Use custom hooks for reusable logic
- Keep components under 300 lines
- Use React.memo for performance-critical components

### CSS/Tailwind
- Use Tailwind utility classes
- Avoid arbitrary values when possible
- Use CSS variables for theme colors
- Mobile-first responsive design

## Testing

### Unit Tests
```bash
# Frontend
npm run test

# Backend
npm run test
```

### E2E Tests
```bash
# Backend
npm run test:e2e
```

### Test Coverage
- Aim for 80%+ coverage
- Test critical paths thoroughly
- Mock external services

## Database Migrations

When changing the Prisma schema:

```bash
cd backend
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

## Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Follow OWASP guidelines
- Report security issues privately

## Questions?

Contact the team at dev@amora.app
