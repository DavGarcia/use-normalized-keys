# Library Usage Guide

This guide explains how to install and use the library after importing it via npm.

---

## 1. Installation

```bash
npm install use-normalized-keys
# or
yarn add use-normalized-keys
```

---

## 2. Importing

```ts
// ES Modules / TypeScript
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

// Context Provider (Recommended)
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';

// CommonJS
const { useNormalizedKeys, Keys } = require('use-normalized-keys');
```

---

## 3. Basic Example

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function MyComponent() {
  const keys = useNormalizedKeys({
    preventDefault: true
  });

  if (keys.isKeyPressed(Keys.SPACE)) {
    console.log('Space is pressed');
  }

  return <div>Press keys to test</div>;
}

// Recommended Context Provider Pattern
import { NormalizedKeysProvider, useHoldSequence, holdSequence } from 'use-normalized-keys';

function App() {
  return (
    <NormalizedKeysProvider sequences={[holdSequence('brush-pressure', 'b', 1000)]}>
      <DrawingCanvas />
    </NormalizedKeysProvider>
  );
}
```

---

## 4. API Overview

| Function | Description |
| -------- | ----------- |
| `useNormalizedKeys(options)` | Main hook for keyboard state management |
| `useHoldSequence(sequenceId)` | Unified hook for progress, animation, and event tracking |
| `NormalizedKeysProvider` | Context provider for sharing keyboard state |
| `useNormalizedKeysContext()` | Hook to access context data |
| `holdSequence(id, key, duration)` | Creates hold sequence definitions |
| `comboSequence(id, keys)` | Creates sequential key press patterns |
| `chordSequence(id, keys)` | Creates simultaneous key combinations |
| `Keys` | TypeScript constants for normalized key values |

---

## 5. Notes

* Compatible with React >=18.0.0 and modern browsers.
* Fully typed with TypeScript.
* No runtime dependencies (React is peer dependency).
* Optimized for 60fps animations using requestAnimationFrame.
* Cross-platform keyboard normalization for Windows, macOS, and Linux.
* Professional-grade features for productivity applications and drawing tools.