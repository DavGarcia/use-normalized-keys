# use-normalized-keys

[![npm version](https://badge.fury.io/js/use-normalized-keys.svg)](https://badge.fury.io/js/use-normalized-keys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React hook for normalized keyboard input handling optimized for games and interactive applications. Provides consistent key mapping across different browsers, platforms, and keyboard layouts with support for gaming inputs, key sequences, and platform-specific quirks.

## Features

- 🎮 **Gaming-Optimized**: Perfect for games and interactive applications requiring precise keyboard input
- 🌐 **Cross-Browser Compatibility**: Handles browser-specific key mapping differences automatically  
- ⌨️ **Keyboard Layout Agnostic**: Works consistently across QWERTY, AZERTY, DVORAK and other layouts
- 🔄 **Key Normalization**: Converts browser-specific key codes to standardized identifiers
- 🔗 **Sequence Detection**: Built-in support for detecting key combinations and sequences
- 🛡️ **Platform Quirks Handling**: Automatic handling of Windows, macOS, and Linux-specific keyboard behaviors
- 🚫 **Prevent Default API**: Easy management of browser default behaviors for specific keys
- 📱 **Mobile Friendly**: Graceful handling of virtual keyboards and mobile input scenarios
- 🔧 **TypeScript Ready**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install use-normalized-keys
```

Or with yarn:

```bash
yarn add use-normalized-keys
```

## Quick Start

```tsx
import React from 'react';
import { useNormalizedKeys } from 'use-normalized-keys';

function GameComponent() {
  const { pressedKeys, keySequence } = useNormalizedKeys({
    target: 'document',
    preventDefault: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
  });

  // Check if specific keys are pressed
  const isJumping = pressedKeys.has('Space');
  const isMovingLeft = pressedKeys.has('ArrowLeft');
  const isMovingRight = pressedKeys.has('ArrowRight');

  return (
    <div>
      <p>Use arrow keys and space to control</p>
      <p>Jumping: {isJumping ? 'Yes' : 'No'}</p>
      <p>Moving: {isMovingLeft ? 'Left' : isMovingRight ? 'Right' : 'None'}</p>
      <p>Last sequence: {keySequence.join(' + ')}</p>
    </div>
  );
}
```

## API Reference

### useNormalizedKeys(options?)

The main hook that provides normalized keyboard input handling.

#### Parameters

- `options` (optional): Configuration object

```typescript
interface UseNormalizedKeysOptions {
  target?: EventTarget | 'document' | 'window';
  preventDefault?: string[] | boolean;
  enableSequenceDetection?: boolean;
  sequenceTimeout?: number;
  includeMouseEvents?: boolean;
  customMappings?: Record<string, string>;
}
```

#### Options

- **target** (`EventTarget | 'document' | 'window'`): Event target for keyboard listeners. Defaults to `'document'`.
- **preventDefault** (`string[] | boolean`): Keys or key patterns to prevent default behavior for. Pass `true` to prevent all defaults.
- **enableSequenceDetection** (`boolean`): Enable detection of key sequences and combinations. Defaults to `true`.
- **sequenceTimeout** (`number`): Timeout in milliseconds for sequence detection. Defaults to `1000`.
- **includeMouseEvents** (`boolean`): Include mouse button events in key detection. Defaults to `false`.
- **customMappings** (`Record<string, string>`): Custom key mappings to override default normalization.

#### Returns

```typescript
interface UseNormalizedKeysReturn {
  pressedKeys: Set<string>;
  keySequence: string[];
  isPressed: (key: string) => boolean;
  getModifiers: () => ModifierState;
  clearSequence: () => void;
}
```

- **pressedKeys**: Set of currently pressed normalized key identifiers
- **keySequence**: Array of recent key presses for sequence detection
- **isPressed**: Function to check if a specific key is currently pressed
- **getModifiers**: Function returning current modifier key states (ctrl, alt, shift, meta)
- **clearSequence**: Function to manually clear the current key sequence

### Key Normalization

The hook automatically normalizes various browser-specific and platform-specific key representations:

```typescript
// Browser differences normalized to standard identifiers
'Spacebar' → 'Space'           // IE/Edge compatibility
'Left' → 'ArrowLeft'           // IE compatibility  
'Esc' → 'Escape'               // Shortened form
'Del' → 'Delete'               // Shortened form

// Gaming keys normalized
'WASD' keys work consistently across keyboard layouts
Function keys (F1-F24) normalized across browsers
Numpad keys distinguished from main number keys
```

### Sequence Detection

The hook can detect key combinations and sequences:

```tsx
function SequenceExample() {
  const { keySequence, clearSequence } = useNormalizedKeys();

  useEffect(() => {
    // Detect specific sequence
    if (keySequence.join(' ') === 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA') {
      console.log('Konami code detected!');
      clearSequence();
    }
  }, [keySequence, clearSequence]);

  return <div>Enter the Konami code!</div>;
}
```

### Platform Quirks Handling

The hook automatically handles platform-specific keyboard behaviors:

- **Windows**: Handles Shift+NumLock phantom events, Windows key behavior
- **macOS**: Proper Command key handling, Option key combinations  
- **Linux**: Various desktop environment key handling differences
- **Mobile**: Virtual keyboard support and touch event integration

## Advanced Usage

### Custom Key Mappings

```tsx
const { pressedKeys } = useNormalizedKeys({
  customMappings: {
    'NumpadEnter': 'Enter',      // Treat numpad enter same as regular enter
    'ContextMenu': 'Menu',       // Normalize context menu key
  }
});
```

### Prevent Default for Specific Keys

```tsx
const { pressedKeys } = useNormalizedKeys({
  preventDefault: [
    'Tab',           // Prevent tab navigation
    'Space',         // Prevent page scroll
    'ArrowUp',       // Prevent page scroll
    'ArrowDown',     // Prevent page scroll
    'F5',           // Prevent page refresh
    'F11',          // Prevent fullscreen toggle
  ]
});
```

### Gaming Controller Integration

```tsx
function GameWithController() {
  const { pressedKeys, isPressed } = useNormalizedKeys({
    includeMouseEvents: true,
    preventDefault: true
  });

  // Handle WASD movement
  const movement = {
    up: isPressed('KeyW'),
    left: isPressed('KeyA'), 
    down: isPressed('KeyS'),
    right: isPressed('KeyD')
  };

  // Handle mouse buttons as additional inputs
  const shooting = isPressed('Mouse0'); // Left mouse button
  const aiming = isPressed('Mouse2');   // Right mouse button

  return <GameRenderer movement={movement} shooting={shooting} aiming={aiming} />;
}
```

## Browser Support

- Chrome/Chromium 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dgarcia102/use-normalized-keys.git
cd use-normalized-keys

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run interactive demo
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run browser-based tests
npm run test:browser
```

## License

MIT © [Daniel Garcia](https://github.com/dgarcia102)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

## Related Projects

- [use-keyboard-shortcut](https://github.com/arthurtyukayev/use-keyboard-shortcut) - React hook for keyboard shortcuts
- [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) - React hook for hotkeys
- [hotkeys-js](https://github.com/jaywcjlove/hotkeys) - Vanilla JavaScript hotkeys library