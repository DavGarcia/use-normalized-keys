# Interactive Demo

Experience the full power of useNormalizedKeys with our comprehensive interactive demo!

## Launch the Interactive Demo

The interactive demo showcases all features of useNormalizedKeys with a beautiful, responsive interface including:

- 🎹 **Virtual Keyboard** - See keys light up as you type
- ⌨️ **Productivity Shortcuts** - Test common shortcuts and key combinations
- 🔤 **Sequence Detection** - Try custom sequences and shortcut patterns
- ⏱️ **Tap vs Hold** - Visualize timing with configurable thresholds
- 🌐 **Platform Quirks** - Test Windows Shift+Numpad handling
- 📊 **Real-time Metrics** - Performance monitoring and event logs
- 🎯 **preventDefault API** - Test browser shortcut blocking

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://davgarcia.github.io/use-normalized-keys/demo/" 
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

2. **Shortcut Testing**
   - Productivity keyboard shortcuts
   - Text editor commands (Ctrl+S, Ctrl+Z, etc.)
   - Tool switching and navigation
   - Multi-key combinations

3. **Sequence Detection Playground**
   - Pre-configured sequences (Konami code, shortcuts)
   - Add custom sequences on the fly
   - Visual feedback for matches
   - Timing visualization

4. **Hold Detection Examples**
   - Visual hold progress bars
   - Tool switching and mode changes
   - Custom hold duration configuration
   - Real-time progress tracking

5. **Advanced Features**
   - Tap vs hold threshold adjustment
   - Event log with detailed information
   - preventDefault testing
   - Debug mode toggle
   - Copy state to clipboard
   - Simplified API demonstrations

### Quick Examples from the Demo

The demo uses our modern unified API with Context Provider. Here are some simple patterns you can try:

```tsx
import { NormalizedKeysProvider, useHoldSequence, useNormalizedKeysContext, holdSequence, comboSequence } from 'use-normalized-keys';

function KeyboardTester() {
  // Access the keyboard state through context
  const keys = useNormalizedKeysContext();
  
  // Use unified hooks for specific sequences
  const chargeJump = useHoldSequence('charge-jump');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Unified API Demo</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Last Key:</strong> {keys.lastEvent?.key || 'None'}
        {keys.lastEvent?.isTap && ' (tap)'}
        {keys.lastEvent?.isHold && ' (hold)'}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Pressed Keys:</strong> {
          keys.pressedKeys.size > 0 
            ? Array.from(keys.pressedKeys).join(', ')
            : 'None'
        }
      </div>
      
      {/* Hold sequence example */}
      <div style={{ 
        marginBottom: '15px',
        padding: '10px',
        border: '2px solid #ddd',
        borderRadius: '5px',
        transform: `scale(${chargeJump.scale})`,
        opacity: chargeJump.opacity,
        backgroundColor: chargeJump.isReady ? '#e8f5e8' : '#f8f8f8'
      }}>
        <h4>Charge Jump (Hold Space)</h4>
        <div>Progress: {Math.round(chargeJump.progress)}%</div>
        <div>Status: {chargeJump.isCharging ? '⚡ Charging' : chargeJump.isComplete ? '✅ Ready!' : '⏳ Hold Space'}</div>
        {chargeJump.glow > 0 && (
          <div style={{ 
            marginTop: '5px',
            filter: `drop-shadow(0 0 ${chargeJump.glow * 10}px #4CAF50)`
          }}>
            🌟 Glowing at {Math.round(chargeJump.glow * 100)}% intensity!
          </div>
        )}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px' 
      }}>
        <div>
          <h4>Shortcuts:</h4>
          <div>Ctrl: {keys.activeModifiers.ctrl ? '🟢' : '⚪'}</div>
          <div>Shift: {keys.activeModifiers.shift ? '🟢' : '⚪'}</div>
          <div>Alt: {keys.activeModifiers.alt ? '🟢' : '⚪'}</div>
          <div>Meta: {keys.activeModifiers.meta ? '🟢' : '⚪'}</div>
        </div>
        
        <div>
          <h4>Sequences:</h4>
          <div>Matches: {keys.sequences?.matches.length || 0}</div>
          <div>Holds Active: {keys.currentHolds.size}</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', ' ', 750, { name: 'Brush Pressure' }),
        comboSequence('vim-escape', ['j', 'k'], {
          name: 'Vim Escape Sequence',
          timeout: 300
        })
      ]}
      preventDefault={['F5', 'F12']} // Block refresh and dev tools
      tapHoldThreshold={200}
    >
      <KeyboardTester />
    </NormalizedKeysProvider>
  );
}
```

### Unified API Example

The demo showcases our unified API with Context Provider and the `useHoldSequence` hook:

```tsx
import { NormalizedKeysProvider, useHoldSequence, holdSequence } from 'use-normalized-keys';

function BrushPressureDemo() {
  const brushPressure = useHoldSequence('brush-pressure');
  
  return (
    <div style={{
      transform: `scale(${1 + brushPressure.progress / 500})`,
      opacity: 0.7 + brushPressure.progress / 300,
      boxShadow: brushPressure.glow > 0 ? `0 0 ${brushPressure.glow * 20}px #3b82f6` : 'none',
      padding: '20px',
      background: brushPressure.isReady ? '#3b82f6' : '#f8fafc',
      color: brushPressure.isReady ? 'white' : '#1e293b',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      transition: 'color 0.3s'
    }}>
      <h3>Hold Space for Brush Pressure</h3>
      <div>
        {brushPressure.isComplete ? '🎨 Maximum Pressure!' : `Pressure: ${Math.round(brushPressure.progress)}%`}
      </div>
      <div>Brush Size: {Math.round(10 + brushPressure.progress / 10)}px</div>
      <div>Elapsed: {brushPressure.elapsedTime}ms</div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[holdSequence('brush-pressure', ' ', 1000, { name: 'Brush Pressure' })]}
    >
      <BrushPressureDemo />
    </NormalizedKeysProvider>
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