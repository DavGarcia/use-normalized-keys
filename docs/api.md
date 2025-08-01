# API Reference

## useNormalizedKeys

The main hook for normalized keyboard input handling.

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

### Return Value

The hook returns a `NormalizedKeyState` object with the following properties:

#### `lastKey`

- **Type:** `string | null`
- **Description:** The last key that was pressed, or `null` if no key has been pressed yet

#### `pressedKeys`

- **Type:** `Set<string>`
- **Description:** A Set containing all currently pressed keys

#### `isKeyPressed`

- **Type:** `(key: string) => boolean`
- **Description:** Function to check if a specific key is currently pressed

## Type Definitions

### `NormalizedKeyState`

```typescript
interface NormalizedKeyState {
  lastKey: string | null;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
}
```

### `UseNormalizedKeysOptions`

```typescript
interface UseNormalizedKeysOptions {
  enabled?: boolean;
}
```

## Examples

### Basic Usage

```tsx
const keys = useNormalizedKeys();

// Check the last pressed key
console.log(keys.lastKey); // "a", "Enter", "ArrowUp", etc.

// Check if a key is currently pressed
if (keys.isKeyPressed('Space')) {
  console.log('Spacebar is pressed!');
}

// Get all pressed keys
console.log(Array.from(keys.pressedKeys)); // ["w", "Shift"]
```

### Disabled Hook

```tsx
const [gameActive, setGameActive] = useState(true);
const keys = useNormalizedKeys({ enabled: gameActive });

// Hook will not respond to keyboard events when gameActive is false
```