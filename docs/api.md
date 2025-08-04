# API Reference

## useNormalizedKeys

The main hook for normalized keyboard input handling, providing comprehensive keyboard event processing with advanced features like sequence detection, tap/hold recognition, and cross-platform compatibility.

### Signature

```typescript
function useNormalizedKeys(options?: UseNormalizedKeysOptions): NormalizedKeyState
```

### Parameters

#### `options` (optional)

Configuration object for the hook.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether the hook should be active |
| `debug` | `boolean` | `false` | Enable debug logging for troubleshooting |
| `excludeInputFields` | `boolean` | `true` | Whether to ignore events from input fields |
| `tapHoldThreshold` | `number` | `200` | Threshold in ms for tap vs hold detection |
| `sequences` | `SequenceOptions` | `undefined` | Configuration for sequence detection |
| `preventDefault` | `boolean \| string[]` | `false` | Prevent default for all keys or specific combinations |

### Return Value

The hook returns a `NormalizedKeyState` object with the following properties:

#### `lastEvent`

- **Type:** `NormalizedKeyEvent | null`
- **Description:** The last keyboard event that was processed, containing detailed information about the key, timing, and context

#### `pressedKeys`

- **Type:** `Set<string>`
- **Description:** A Set containing all currently pressed keys (normalized key names)

#### `isKeyPressed`

- **Type:** `(key: string) => boolean`
- **Description:** Function to check if a specific key is currently pressed

#### `activeModifiers`

- **Type:** `ModifierState`
- **Description:** Object containing the current state of all modifier keys (shift, ctrl, alt, meta, caps, numLock, scrollLock)

#### `sequences` (optional)

- **Type:** `SequenceAPI | undefined`
- **Description:** Sequence detection API when sequences are configured, providing methods to manage and detect key sequences

## Type Definitions

### `NormalizedKeyState`

```typescript
interface NormalizedKeyState {
  lastEvent: NormalizedKeyEvent | null;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
  activeModifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    caps: boolean;
    numLock: boolean;
    scrollLock: boolean;
  };
  sequences?: {
    matches: MatchedSequence[];
    addSequence: (definition: SequenceDefinition) => void;
    removeSequence: (id: string) => void;
    clearSequences: () => void;
    resetState: () => void;
  };
}
```

### `UseNormalizedKeysOptions`

```typescript
interface UseNormalizedKeysOptions {
  enabled?: boolean;
  debug?: boolean;
  excludeInputFields?: boolean;
  tapHoldThreshold?: number;
  sequences?: SequenceOptions;
  preventDefault?: boolean | string[];
}
```

### `NormalizedKeyEvent`

```typescript
interface NormalizedKeyEvent {
  key: string;              // Normalized key name
  originalKey: string;      // Original key from event
  code: string;            // Normalized key code
  originalCode: string;    // Original code from event
  type: 'keydown' | 'keyup';
  isModifier: boolean;
  activeModifiers: ModifierState;
  timestamp: number;
  isRepeat: boolean;
  isNumpad: boolean;
  duration?: number;       // For keyup events, duration since keydown
  isTap?: boolean;        // True if duration < tapHoldThreshold
  isHold?: boolean;       // True if duration >= tapHoldThreshold
  preventedDefault: boolean;
  numpadInfo?: {
    isNumLockOn: boolean;
    activeMode: 'digit' | 'navigation';
    digit: string;
    navigation: string;
  };
}
```

## Examples

### Basic Usage

```tsx
const keys = useNormalizedKeys();

// Check the last event with detailed information
console.log(keys.lastEvent?.key); // "a", "Enter", "ArrowUp", etc.
console.log(keys.lastEvent?.duration); // Duration in ms for keyup events
console.log(keys.lastEvent?.isTap); // true/false for tap vs hold

// Check if a key is currently pressed
if (keys.isKeyPressed('Space')) {
  console.log('Spacebar is pressed!');
}

// Check modifier states
if (keys.activeModifiers.shift && keys.isKeyPressed('a')) {
  console.log('Shift+A combination!');
}

// Get all pressed keys
console.log(Array.from(keys.pressedKeys)); // ["w", "Shift"]
```

### Advanced Configuration

```tsx
const keys = useNormalizedKeys({
  debug: true,                    // Enable debug logging
  tapHoldThreshold: 150,         // 150ms threshold for tap vs hold
  excludeInputFields: false,     // Process events from input fields
  preventDefault: ['Tab', 'F5'], // Prevent default for specific keys
});
```

### Sequence Detection

```tsx
const keys = useNormalizedKeys({
  sequences: {
    sequences: [
      {
        id: 'konami',
        keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        type: 'sequence'
      },
      {
        id: 'ctrl-s',
        keys: ['Control', 's'],
        type: 'chord'
      }
    ],
    onSequenceMatch: (match) => {
      console.log(`Sequence ${match.sequenceId} matched!`);
    }
  }
});

// Access matched sequences
console.log(keys.sequences?.matches);
```

### preventDefault API

```tsx
// Prevent default for all keys
const keys1 = useNormalizedKeys({ preventDefault: true });

// Prevent default for specific keys
const keys2 = useNormalizedKeys({ 
  preventDefault: ['Tab', 'F5', 'F12'] 
});

// Check if default was prevented
if (keys.lastEvent?.preventedDefault) {
  console.log('Default behavior was prevented');
}
```

### Tap vs Hold Detection

```tsx
const keys = useNormalizedKeys({ tapHoldThreshold: 200 });

useEffect(() => {
  if (keys.lastEvent?.type === 'keyup') {
    if (keys.lastEvent.isTap) {
      console.log(`${keys.lastEvent.key} was tapped (${keys.lastEvent.duration}ms)`);
    } else if (keys.lastEvent.isHold) {
      console.log(`${keys.lastEvent.key} was held (${keys.lastEvent.duration}ms)`);
    }
  }
}, [keys.lastEvent]);
```

### Game Input Handling

```tsx
function GameComponent() {
  const keys = useNormalizedKeys({
    excludeInputFields: true,
    preventDefault: true, // Prevent all browser shortcuts
  });

  useEffect(() => {
    const handleMovement = () => {
      const movement = {
        x: 0,
        y: 0
      };

      if (keys.isKeyPressed('w') || keys.isKeyPressed('ArrowUp')) movement.y -= 1;
      if (keys.isKeyPressed('s') || keys.isKeyPressed('ArrowDown')) movement.y += 1;
      if (keys.isKeyPressed('a') || keys.isKeyPressed('ArrowLeft')) movement.x -= 1;
      if (keys.isKeyPressed('d') || keys.isKeyPressed('ArrowRight')) movement.x += 1;

      // Apply movement
      updatePlayerPosition(movement);
    };

    const gameLoop = setInterval(handleMovement, 16); // 60 FPS
    return () => clearInterval(gameLoop);
  }, [keys]);

  return (
    <div>
      <p>Use WASD or arrow keys to move</p>
      <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
    </div>
  );
}
```

### Disabled Hook

```tsx
const [gameActive, setGameActive] = useState(true);
const keys = useNormalizedKeys({ enabled: gameActive });

// Hook will not respond to keyboard events when gameActive is false
```