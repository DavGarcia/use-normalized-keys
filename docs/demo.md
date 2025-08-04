# Interactive Demo

Experience the full power of useNormalizedKeys with our comprehensive interactive demo!

## Launch the Interactive Demo

The interactive demo showcases all features of useNormalizedKeys with a beautiful, responsive interface including:

- 🎹 **Virtual Keyboard** - See keys light up as you type
- 🎮 **Game Controls** - Test WASD movement and gaming features
- 🔤 **Sequence Detection** - Try the Konami code and custom sequences
- ⏱️ **Tap vs Hold** - Visualize timing with configurable thresholds
- 🌐 **Platform Quirks** - Test Windows Shift+Numpad handling
- 📊 **Real-time Metrics** - Performance monitoring and event logs
- 🎯 **preventDefault API** - Test browser shortcut blocking

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://davgarcia.github.io/use-normalized-keys/demo/" 
     target="_blank" 
     rel="noopener noreferrer"
     style="display: inline-block; padding: 12px 24px; background-color: #3eaf7c; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
    🚀 Launch Interactive Demo
  </a>
</div>

### Run the Demo Locally

You can also run the demo locally from the project root directory:

```bash
npm run demo
```

This will start the interactive demo at `http://localhost:5173` (or next available port).

### Demo Features

The interactive demo includes:

1. **Visual Keyboard Display**
   - Full QWERTY layout with numpad
   - Real-time key highlighting
   - Modifier state indicators
   - Platform-specific quirk visualization

2. **Game Control Testing**
   - WASD movement visualization
   - Character sprite that responds to input
   - Running with Shift modifier
   - Jump and special actions

3. **Sequence Detection Playground**
   - Pre-configured sequences (Konami code, shortcuts)
   - Add custom sequences on the fly
   - Visual feedback for matches
   - Timing visualization

4. **Advanced Features**
   - Tap vs hold threshold adjustment
   - Event log with detailed information
   - preventDefault testing
   - Debug mode toggle
   - Copy state to clipboard

### Quick Examples from the Demo

While the full demo provides the best experience, here are some simple examples you can try in your own code:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function SimpleDemo() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        {
          id: 'konami',
          keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
          type: 'sequence'
        }
      ],
      onSequenceMatch: (match) => {
        console.log('Konami code activated!');
      }
    },
    preventDefault: ['F5', 'F12'], // Block refresh and dev tools
    tapHoldThreshold: 200
  });
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>useNormalizedKeys Quick Test</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Last Key:</strong> {keys.lastEvent?.key || 'None'}
        {keys.lastEvent?.isTap && ' (tap)'}
        {keys.lastEvent?.isHold && ' (hold)'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Pressed Keys:</strong> {
          keys.pressedKeys.size > 0 
            ? Array.from(keys.pressedKeys).join(', ')
            : 'None'
        }
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Modifiers:</strong>
        {' Shift: ' + (keys.activeModifiers.shift ? '✓' : '✗')}
        {' Ctrl: ' + (keys.activeModifiers.ctrl ? '✓' : '✗')}
        {' Alt: ' + (keys.activeModifiers.alt ? '✓' : '✗')}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px',
        marginTop: '20px' 
      }}>
        <div>
          <h4>WASD Movement:</h4>
          <div>W: {keys.isKeyPressed('w') ? '🟢' : '⚪'}</div>
          <div>A: {keys.isKeyPressed('a') ? '🟢' : '⚪'}</div>
          <div>S: {keys.isKeyPressed('s') ? '🟢' : '⚪'}</div>
          <div>D: {keys.isKeyPressed('d') ? '🟢' : '⚪'}</div>
        </div>
        
        <div>
          <h4>Arrow Keys:</h4>
          <div>↑: {keys.isKeyPressed('ArrowUp') ? '🟢' : '⚪'}</div>
          <div>←: {keys.isKeyPressed('ArrowLeft') ? '🟢' : '⚪'}</div>
          <div>↓: {keys.isKeyPressed('ArrowDown') ? '🟢' : '⚪'}</div>
          <div>→: {keys.isKeyPressed('ArrowRight') ? '🟢' : '⚪'}</div>
        </div>
      </div>
      
      {keys.sequences?.matches.length > 0 && (
        <div style={{ marginTop: '20px', color: '#00ff00' }}>
          <strong>🎉 Sequence Matched!</strong>
        </div>
      )}
    </div>
  );
}
```

## Why Use the Full Demo?

The full interactive demo (`npm run demo`) provides:

- **Better visualization** of all features working together
- **Real-time performance metrics** to see the hook's efficiency
- **Platform-specific testing** for your OS
- **Comprehensive examples** of every feature
- **Beautiful UI** that's fun to interact with

[View the source code](https://github.com/DavGarcia/use-normalized-keys/tree/main/packages/use-normalized-keys/demo) to see how the demo implements advanced features.