# Quick Start

This guide will get you up and running with useNormalizedKeys in just a few minutes.

## Basic Usage

Import the hook and use it in your component:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function MyComponent() {
  const { lastEvent, pressedKeys } = useNormalizedKeys();
  
  return (
    <div>
      <p>Press any key...</p>
      <p>Last key: {lastEvent?.key || 'None'}</p>
      <p>Keys pressed: {pressedKeys.size}</p>
    </div>
  );
}
```

## Check if Specific Keys are Pressed

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function GameControls() {
  const { isKeyPressed } = useNormalizedKeys();
  
  return (
    <div>
      <h3>Movement Controls</h3>
      <div>W (forward): {isKeyPressed('w') ? '🟢' : '🔴'}</div>
      <div>A (left): {isKeyPressed('a') ? '🟢' : '🔴'}</div>
      <div>S (backward): {isKeyPressed('s') ? '🟢' : '🔴'}</div>
      <div>D (right): {isKeyPressed('d') ? '🟢' : '🔴'}</div>
    </div>
  );
}
```

## Configuration Options

The hook accepts an optional configuration object:

```tsx
const { lastEvent, pressedKeys, isKeyPressed } = useNormalizedKeys({
  enabled: true, // Enable/disable the hook
  excludeInputFields: true, // Ignore input/textarea fields
  debug: false, // Debug logging
});
```

## Simplified API

For common use cases, we provide helper hooks and functions:

### Hold Progress Tracking

```tsx
import { useNormalizedKeys, useHoldProgress, holdSequence } from 'use-normalized-keys';

function ChargingAttack() {
  // First initialize the main hook with sequences
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        holdSequence('charge-attack', ' ', 1000) // Hold space for 1 second
      ]
    }
  });
  
  // Then use helper hook to track specific sequence
  const { progress, isHolding } = useHoldProgress('charge-attack');
  
  return (
    <div>
      <div>Charging: {isHolding ? `${Math.round(progress)}%` : 'Ready'}</div>
      <div style={{
        width: '200px',
        height: '20px',
        background: '#ddd',
        borderRadius: '10px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#4CAF50',
          borderRadius: '10px',
          transition: 'none'
        }}/>
      </div>
    </div>
  );
}
```

### Combo Detection

```tsx
import { useNormalizedKeys, comboSequence } from 'use-normalized-keys';

const { sequences } = useNormalizedKeys({
  sequences: {
    sequences: [
      comboSequence('konami', ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], {
        name: 'Konami Code',
        timeout: 2000
      })
    ],
    onSequenceMatch: (match) => {
      console.log(`Matched: ${match.sequenceName}`);
    }
  }
});
```

## What's Next?

- Explore the [API Reference](/api) for detailed documentation
- Check out more [Examples](/examples)
- Try the [Interactive Demo](/demo)