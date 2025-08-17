# use-normalized-keys

A professional React hook for normalized keyboard input handling, designed for productivity applications, drawing tools, and professional interfaces.

[![npm version](https://img.shields.io/npm/v/use-normalized-keys.svg)](https://www.npmjs.com/package/use-normalized-keys)
[![CI Status](https://github.com/DavGarcia/use-normalized-keys/workflows/CI/badge.svg)](https://github.com/DavGarcia/use-normalized-keys/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/docs-vitepress-brightgreen)](https://davgarcia.github.io/use-normalized-keys/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Live Demos

- **📖 [Documentation](https://davgarcia.github.io/use-normalized-keys/)** - Complete API reference and guides
- **🚀 [Interactive Demo](https://davgarcia.github.io/use-normalized-keys/demo/)** - Test sequences and explore features  
- **🎨 [Drawing Tools Demo](https://davgarcia.github.io/use-normalized-keys/tools/)** - Professional keyboard shortcuts for creative apps

## 📦 Packages

This monorepo contains:

- **[packages/use-normalized-keys](./packages/use-normalized-keys)** - The React hook library
- **docs** - VitePress documentation site

## 🚀 Quick Start

```bash
# Install the package
npm install use-normalized-keys
```

```jsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function TextEditor() {
  const keys = useNormalizedKeys();
  
  // Handle productivity shortcuts
  React.useEffect(() => {
    // Check for Ctrl+S (Save)
    if (keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.s)) {
      console.log('Save document');
    }
    
    // Check for Ctrl+Z (Undo)
    if (keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.z)) {
      console.log('Undo action');
    }
  }, [keys.isKeyPressed, keys.activeModifiers]);
  
  return (
    <div>
      <textarea placeholder="Start typing..." />
      <p>Last key: {keys.lastEvent?.key || 'None'}</p>
      <p>Pressed keys: {keys.pressedKeys.size}</p>
      <p>Ctrl held: {keys.activeModifiers.ctrl ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## 🔧 Development

This project uses npm workspaces for monorepo management.

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/DavGarcia/use-normalized-keys.git
cd use-normalized-keys

# Install dependencies for all workspaces
npm install

# Build the library
npm run build

# Run tests
npm run test

# Start the demo
npm run demo
```

### Available Scripts

- `npm run build` - Build the library
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run demo` - Start the interactive demo
- `npm run tools` - Start the drawing tools demo
- `npm run dev` - Build in watch mode
- `npm run clean` - Clean all build artifacts and node_modules
- `npm run reinstall` - Clean and reinstall all dependencies

### Publishing New Versions

This project uses automated releases via GitHub Actions with npm Trusted Publishing:

1. **Update all package versions:**
   ```bash
   # Update main package version
   cd packages/use-normalized-keys/
   npm version patch  # or minor/major
   
   # Update root and docs package.json versions to match
   # Edit package.json and docs/package.json manually
   
   # Update lockfile
   cd ../..
   npm install
   ```

2. **Run quality checks:**
   ```bash
   npm test
   npx tsc --noEmit
   ```

3. **Commit changes and create tag:**
   ```bash
   git add .
   git commit -m "chore: bump version to v1.x.x"
   git tag v1.x.x  # Use the version from step 1
   ```

4. **Push via GitHub Desktop:**
   - Push commits to origin/main
   - Push tags using **Repository → Push Tags** (or Ctrl+Shift+T)
   - **Important:** Both commits AND tags must be pushed to trigger release

5. **GitHub Actions handles the rest:**
   - Runs all tests automatically
   - Builds the library with production config
   - Publishes to npm using Trusted Publishing (no token needed)
   - Creates GitHub release with changelog

6. **Verify publication:**
   - Check [GitHub Actions](https://github.com/DavGarcia/use-normalized-keys/actions) for workflow status
   - Verify on [npm registry](https://www.npmjs.com/package/use-normalized-keys)
   - Check [GitHub Releases](https://github.com/DavGarcia/use-normalized-keys/releases)

> **Note:** Never run `npm publish` manually. The automated workflow ensures consistent builds and uses npm Trusted Publishing for security.

### Project Structure

```
use-normalized-keys/
├── packages/
│   └── use-normalized-keys/    # React hook library
│       ├── src/                # Source code
│       ├── demo/               # Interactive demo
│       └── dist/               # Build output
├── docs/                       # Documentation site (VitePress)
└── package.json               # Root workspace configuration
```

## 🎯 Features

- ✅ **Professional Shortcuts** - Build keyboard-driven interfaces like Photoshop, Figma, VS Code
- ✅ **Cross-Platform Reliability** - Consistent behavior on Windows, macOS, and Linux
- ✅ **Browser Normalization** - Works perfectly across Chrome, Firefox, Safari, Edge
- ✅ **Advanced Sequences** - Detect chords (Ctrl+S), sequences (jk), and hold patterns
- ✅ **Smart Input Handling** - Automatically respects text fields and form inputs
- ✅ **Accessibility Ready** - Focus management and keyboard navigation support  
- ✅ **Performance Optimized** - 60fps animations with requestAnimationFrame
- ✅ **TypeScript First** - Complete type definitions and excellent IntelliSense
- ✅ **Zero Dependencies** - Only React as peer dependency

## 📖 Documentation

For detailed documentation, API reference, and examples, visit the [documentation site](https://davgarcia.github.io/use-normalized-keys/).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./packages/use-normalized-keys/LICENSE) file for details.

## 👤 Author

**David Garcia**

- Email: dgarcia182@gmail.com
- GitHub: [@DavGarcia](https://github.com/DavGarcia)

## 🙏 Acknowledgments

- Inspired by the need for consistent keyboard handling in professional applications
- Built with React hooks best practices  
- Platform quirks research from various browser compatibility resources