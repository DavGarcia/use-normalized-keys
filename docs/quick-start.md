# Quick Start

This guide will get you up and running with useNormalizedKeys in just a few minutes.

## Basic Usage

Import the hook and use it in your component:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function MyComponent() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <p>Press any key...</p>
      <p>Last key: {keys.lastKey || 'None'}</p>
    </div>
  );
}
```

## Check if Specific Keys are Pressed

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function GameControls() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <h3>Movement Controls</h3>
      <div>W (forward): {keys.isKeyPressed('w') ? '🟢' : '🔴'}</div>
      <div>A (left): {keys.isKeyPressed('a') ? '🟢' : '🔴'}</div>
      <div>S (backward): {keys.isKeyPressed('s') ? '🟢' : '🔴'}</div>
      <div>D (right): {keys.isKeyPressed('d') ? '🟢' : '🔴'}</div>
    </div>
  );
}
```

## Configuration Options

The hook accepts an optional configuration object:

```tsx
const keys = useNormalizedKeys({
  enabled: true, // Enable/disable the hook
});
```

## What's Next?

- Explore the [API Reference](/api) for detailed documentation
- Check out more [Examples](/examples)
- Try the [Interactive Demo](/demo)