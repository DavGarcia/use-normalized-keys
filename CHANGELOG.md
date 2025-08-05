# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-04

### 🎉 Initial Release

The first stable release of `use-normalized-keys` - a professional React hook for normalized keyboard input handling, optimized for games and interactive applications.

### ✨ Features

#### Core Functionality
- **Normalized keyboard input** - Consistent key names across browsers and platforms
- **Real-time key state tracking** - Know exactly which keys are pressed at any moment
- **Modifier key states** - Track Shift, Ctrl, Alt, Meta, CapsLock, NumLock, ScrollLock
- **Focus loss recovery** - Automatically resets stuck keys when window loses focus
- **Input field exclusion** - Optionally ignore events from input/textarea elements

#### Advanced Features
- **Sequence detection** - Detect complex key sequences like Konami code or custom shortcuts
  - Sequential patterns (e.g., "hello", Konami code)
  - Chord combinations (e.g., Ctrl+S, Ctrl+Shift+N)
  - Hold patterns with configurable durations
- **Tap vs Hold detection** - Distinguish between quick taps and long holds
  - Configurable threshold (default 200ms)
  - Per-key timing information
- **preventDefault API** - Block browser shortcuts selectively
  - Block all keys or specific combinations
  - Useful for games and fullscreen applications

#### Platform-Specific Handling
- **Windows Shift+Numpad phantom event suppression** - Fixes the Windows-specific bug where Shift+Numpad generates phantom Shift events
- **macOS Meta key timeout handling** - Properly handles Meta key stuck states on macOS
- **Cross-platform numpad support** - Consistent numpad key detection with NumLock state awareness

#### Developer Experience
- **TypeScript support** - Full type definitions with comprehensive IntelliSense
- **Debug mode** - Detailed console logging for troubleshooting
- **Zero dependencies** - Only peer dependencies on React 18+
- **Optimized performance** - useRef for internal state, minimal re-renders
- **Comprehensive test suite** - 100% test coverage

### 📦 What's Included

- Core library (`use-normalized-keys`)
- Interactive demo showcasing all features
- Comprehensive documentation site
- Full TypeScript definitions
- Extensive test coverage

### 🚀 Getting Started

```bash
npm install use-normalized-keys
```

```jsx
import { useNormalizedKeys } from 'use-normalized-keys';

function App() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <p>Pressed keys: {Array.from(keys.pressedKeys).join(', ')}</p>
      <p>Space pressed: {keys.isKeyPressed('Space') ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 📖 Documentation

- [Full Documentation](https://davgarcia.github.io/use-normalized-keys/)
- [Interactive Demo](https://davgarcia.github.io/use-normalized-keys/demo/)
- [API Reference](https://davgarcia.github.io/use-normalized-keys/api.html)

### 🙏 Acknowledgments

Special thanks to all early testers and contributors who helped shape this library.

---

[1.0.0]: https://github.com/DavGarcia/use-normalized-keys/releases/tag/v1.0.0