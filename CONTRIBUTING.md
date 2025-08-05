# Contributing to use-normalized-keys

First off, thank you for considering contributing to use-normalized-keys! It's people like you that make this library better for everyone.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions with other contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what you expected**
* **Include browser and OS information**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the enhancement**
* **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes (`npm test`)
5. Make sure your code follows the existing style
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/use-normalized-keys.git
cd use-normalized-keys

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run the interactive demo
npm run demo

# Run documentation site
npm run docs:dev
```

### Project Structure

```
use-normalized-keys/
├── packages/
│   └── use-normalized-keys/    # Main library package
│       ├── src/                 # Source code
│       ├── demo/                # Interactive demo
│       └── __tests__/           # Test files
├── docs/                        # VitePress documentation
└── .github/                     # GitHub Actions workflows
```

### Testing

We use Vitest for testing. Please ensure all tests pass and add new tests for any new functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run interactive test UI
npm run test:ui
```

### Code Style

We follow these conventions:

- **TypeScript** for all source code
- **2 spaces** for indentation
- **Single quotes** for strings (except JSX)
- **Semicolons** at the end of statements
- **Trailing commas** in multi-line objects and arrays
- **Functional components** with hooks for React code

### Commit Messages

We follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Examples:
```
feat: add tap vs hold detection
fix: resolve Windows Shift+Numpad phantom events
docs: update sequence detection examples
```

### Documentation

- Update the README.md if needed
- Update API documentation in `docs/api.md`
- Add examples to `docs/examples.md` for new features
- Ensure all TypeScript types are properly documented

### Release Process

Releases are handled by maintainers through GitHub Actions:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v1.0.0`
4. Push the tag: `git push origin v1.0.0`
5. GitHub Actions will handle the npm publish

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉