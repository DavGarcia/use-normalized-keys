# use-normalized-keys

A professional React hook for normalized keyboard input handling, optimized for games and interactive applications.

[![npm version](https://img.shields.io/npm/v/use-normalized-keys.svg)](https://www.npmjs.com/package/use-normalized-keys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Packages

This monorepo contains:

- **[packages/use-normalized-keys](./packages/use-normalized-keys)** - The React hook library
- **docs** - Documentation site (coming soon)

## 🚀 Quick Start

```bash
# Install the package
npm install use-normalized-keys
```

```jsx
import { useNormalizedKeys } from 'use-normalized-keys';

function App() {
  const { lastEvent, pressedKeys, isKeyPressed } = useNormalizedKeys();
  
  return (
    <div>
      <p>Last key: {lastEvent?.key}</p>
      <p>Pressed keys: {Array.from(pressedKeys).join(', ')}</p>
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
- `npm run dev` - Build in watch mode
- `npm run clean` - Clean all build artifacts and node_modules
- `npm run reinstall` - Clean and reinstall all dependencies

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

- ✅ **Normalized Key Values** - Consistent key values across browsers
- ✅ **Cross-Browser Support** - Works reliably on Chrome, Firefox, Safari, Edge
- ✅ **Platform Quirk Handling** - Handles Windows, macOS, and Linux differences
- ✅ **Modifier Key Management** - Advanced tracking with tap vs hold detection
- ✅ **Sequence Detection** - Detect key combinations, sequences, and chords
- ✅ **Input Field Exclusion** - Automatically excludes or includes input fields
- ✅ **Focus Loss Recovery** - Prevents stuck keys when window loses focus
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Zero Dependencies** - Only React as peer dependency

## 📖 Documentation

For detailed documentation, API reference, and examples, visit the [documentation site](https://davgarcia.github.io/use-normalized-keys/) (coming soon).

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

- Inspired by the need for consistent keyboard handling in web games
- Built with React hooks best practices
- Platform quirks research from various browser compatibility resources