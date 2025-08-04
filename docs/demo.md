# Interactive Demo

Experience useNormalizedKeys in action! This live demo shows the hook responding to your keyboard input in real-time.

::: info
The demo component will be implemented in a future phase when the interactive demo functionality is added.
:::

## Demo Features

The interactive demo will showcase:

- **Real-time key detection** - See keys as you press them
- **Multi-key combinations** - Test complex key combinations
- **Game-like controls** - WASD movement demonstration
- **Modifier key handling** - Shift, Ctrl, Alt combinations
- **Cross-browser testing** - Verify consistent behavior

## Coming Soon

The interactive demo component is planned for Phase 3 of development. It will include:

1. **Live Key Visualizer** - Visual representation of pressed keys
2. **WASD Movement Demo** - Character movement simulation
3. **Shortcut Tester** - Test keyboard shortcuts
4. **Performance Monitor** - Real-time performance metrics

## Try It Locally

To test the hook in your own environment:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function TestDemo() {
  const keys = useNormalizedKeys();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>useNormalizedKeys Test</h3>
      <div>
        <strong>Last Key:</strong> {keys.lastKey || 'None'}
      </div>
      <div>
        <strong>Pressed Keys:</strong> {
          keys.pressedKeys.size > 0 
            ? Array.from(keys.pressedKeys).join(', ')
            : 'None'
        }
      </div>
      <div style={{ marginTop: '20px' }}>
        <h4>WASD Test:</h4>
        <div>W: {keys.isKeyPressed('w') ? '🟢 ON' : '🔴 OFF'}</div>
        <div>A: {keys.isKeyPressed('a') ? '🟢 ON' : '🔴 OFF'}</div>
        <div>S: {keys.isKeyPressed('s') ? '🟢 ON' : '🔴 OFF'}</div>
        <div>D: {keys.isKeyPressed('d') ? '🟢 ON' : '🔴 OFF'}</div>
      </div>
    </div>
  );
}
```

Check back soon for the full interactive demo experience!