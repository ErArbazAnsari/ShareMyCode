# Contributing to ShareMyCode

Thank you for your interest in contributing to ShareMyCode! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Git installed and configured
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Next.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/ShareMyCode.git
   cd ShareMyCode
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/originalowner/ShareMyCode.git
   ```

## Development Setup

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure

Familiarize yourself with the project structure:

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and configurations
- `public/` - Static assets
- `styles/` - Global styles

## Making Changes

### Branch Naming

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Making Your Changes

1. **Plan your changes**
   - Check existing issues and discussions
   - Create an issue if it's a significant change
   - Discuss major changes before implementing

2. **Write your code**
   - Follow the coding standards (see below)
   - Write clear, self-documenting code
   - Add comments for complex logic
   - Keep functions small and focused

3. **Test your changes**
   - Test manually in the browser
   - Check for TypeScript errors
   - Verify the build works: `npm run build`
   - Test edge cases

4. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update API documentation if you change endpoints

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### Examples

```bash
feat(editor): add syntax highlighting for Python

fix(auth): resolve session expiration issue

docs(readme): update installation instructions

refactor(api): simplify gist creation logic
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Keep commits focused (one logical change per commit)
- Use present tense ("add feature" not "added feature")
- Reference issues in commit messages: `fix #123`

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**
   ```bash
   npm run build
   npm run lint
   ```

3. **Test thoroughly**
   - Test all affected features
   - Test edge cases
   - Test on different browsers (if UI changes)

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   How was this tested?

   ## Screenshots (if applicable)
   Add screenshots here

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   ```

### PR Review Process

1. **Automated Checks**
   - Build must pass
   - Linting must pass
   - No merge conflicts

2. **Code Review**
   - At least one approval required
   - Address all review comments
   - Make requested changes

3. **Merge**
   - Squash and merge (preferred)
   - Delete branch after merge

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define interfaces for all props and data structures
- Avoid `any` type (use `unknown` if necessary)
- Use type inference where appropriate

```typescript
// Good
interface UserProps {
  name: string
  email: string
}

function User({ name, email }: UserProps) {
  // ...
}

// Bad
function User(props: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful component and prop names

```typescript
// Good
export function GistCard({ gist, onDelete }: GistCardProps) {
  // ...
}

// Bad
export function Card(props: any) {
  // ...
}
```

### File Organization

- One component per file
- Co-locate related files
- Use index files for clean imports
- Group by feature, not by type

```
// Good
components/
  gist-card/
    index.tsx
    gist-card.tsx
    gist-card.test.tsx

// Avoid
components/
  components/
  tests/
```

### Naming Conventions

- **Components**: PascalCase (`GistCard`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Files**: kebab-case (`gist-card.tsx`)
- **Types/Interfaces**: PascalCase (`GistData`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (or double, be consistent)
- Add trailing commas in objects/arrays
- Use semicolons (or don't, be consistent)
- Maximum line length: 100 characters

### Comments

- Write self-documenting code (prefer code over comments)
- Add comments for complex logic
- Use JSDoc for public functions
- Keep comments up-to-date

```typescript
// Good
// Calculate view count with exponential backoff to prevent spam
const viewCount = Math.floor(Math.log(views + 1) * 10)

// Bad
// Add 1 to views
const viewCount = views + 1
```

## Testing

### Manual Testing

Before submitting a PR, manually test:

1. **Feature functionality**
   - Does it work as expected?
   - Are edge cases handled?

2. **UI/UX**
   - Does it look good?
   - Is it responsive?
   - Are there any visual bugs?

3. **Browser compatibility**
   - Chrome/Edge
   - Firefox
   - Safari (if possible)

### Automated Testing (Future)

When tests are added:

```bash
npm test          # Run all tests
npm test:watch    # Watch mode
npm test:coverage # Coverage report
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Explain "why" not "what" in comments

```typescript
/**
 * Uploads a file to Cloudinary and returns the CDN URL.
 * 
 * @param file - The file to upload (max 2KB)
 * @returns Promise resolving to the file URL and public ID
 * @throws Error if upload fails or file is too large
 */
export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  // ...
}
```

### README Updates

Update the README if you:
- Add new features
- Change installation steps
- Modify environment variables
- Update dependencies

### API Documentation

Update API documentation if you:
- Add new endpoints
- Change existing endpoints
- Modify request/response formats

## Getting Help

### Questions?

- Open a discussion on GitHub
- Ask in the project chat (if available)
- Check existing issues and discussions

### Found a Bug?

1. Check if it's already reported
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

### Need Help with Code?

- Review existing code for patterns
- Check the architecture documentation
- Ask in discussions or issues

## Recognition

Contributors will be:
- Listed in the README (if desired)
- Credited in release notes
- Appreciated by the community! 🎉

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ShareMyCode! Your efforts help make this project better for everyone. 🙏

