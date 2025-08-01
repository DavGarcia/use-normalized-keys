# Configuration

useNormalizedKeys is designed to work out of the box with minimal configuration, but provides options for customization.

## Options

### `enabled`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Controls whether the hook is active and listening for keyboard events

```tsx
const keys = useNormalizedKeys({ enabled: false });
```

This is useful when you need to temporarily disable keyboard handling, such as when a modal is open or the game is paused.

## Dynamic Configuration

You can change the configuration dynamically by passing different options:

```tsx
function GameComponent() {
  const [isPaused, setIsPaused] = useState(false);
  const keys = useNormalizedKeys({ enabled: !isPaused });
  
  return (
    <div>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      {!isPaused && (
        <p>Last key: {keys.lastKey}</p>
      )}
    </div>
  );
}
```

## Advanced Usage Patterns

### Multiple Hook Instances

You can use multiple instances of the hook for different purposes:

```tsx
function ComplexGame() {
  const gameKeys = useNormalizedKeys({ enabled: gameActive });
  const menuKeys = useNormalizedKeys({ enabled: menuActive });
  
  // Each instance tracks keyboard state independently
}
```

### Conditional Enabling

```tsx
function ModalExample() {
  const [modalOpen, setModalOpen] = useState(false);
  const keys = useNormalizedKeys({ enabled: !modalOpen });
  
  // Keyboard handling is disabled when modal is open
}
```

## Future Configuration Options

The following configuration options are planned for future releases:

- **Key mapping customization** - Override default key normalization
- **Event filtering** - Specify which keys to listen for
- **Performance tuning** - Adjust update frequency for specific use cases

Stay tuned for updates!