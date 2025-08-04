# useNormalizedKeys

A React hook for normalized keyboard input handling, optimized for games and interactive applications.

## What is useNormalizedKeys?

useNormalizedKeys is a React hook that provides consistent keyboard input handling across different browsers and platforms. It's specifically designed for applications that require precise, real-time keyboard interaction like games, drawing applications, and interactive creative tools.

## Key Features

- **Cross-browser compatibility** - Consistent keyboard event handling across all major browsers
- **Real-time performance** - Optimized for high-frequency input scenarios
- **TypeScript support** - Full type definitions included
- **Zero configuration** - Works out of the box with sensible defaults
- **React hook pattern** - Familiar API that integrates seamlessly with React

## Quick Example

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function GameComponent() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <p>Last key pressed: {keys.lastKey}</p>
      <p>Currently pressed keys: {Array.from(keys.pressedKeys).join(', ')}</p>
      <p>WASD Status:</p>
      <ul>
        <li>W: {keys.isKeyPressed('w') ? '✓' : '✗'}</li>
        <li>A: {keys.isKeyPressed('a') ? '✓' : '✗'}</li>
        <li>S: {keys.isKeyPressed('s') ? '✓' : '✗'}</li>
        <li>D: {keys.isKeyPressed('d') ? '✓' : '✗'}</li>
      </ul>
    </div>
  );
}
```

## Getting Started

Ready to get started? Check out our [installation guide](/installation) and [quick start tutorial](/quick-start).

Or jump right into the [live demo](/demo) to see it in action!