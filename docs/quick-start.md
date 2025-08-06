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
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function KeyboardShortcuts() {
  const { isKeyPressed } = useNormalizedKeys();
  
  return (
    <div>
      <h3>Productivity Shortcuts</h3>
      <div>Save (Ctrl+S): {isKeyPressed([Keys.CONTROL, Keys.S]) ? '🟢' : '🔴'}</div>
      <div>Copy (Ctrl+C): {isKeyPressed([Keys.CONTROL, Keys.C]) ? '🟢' : '🔴'}</div>
      <div>Paste (Ctrl+V): {isKeyPressed([Keys.CONTROL, Keys.V]) ? '🟢' : '🔴'}</div>
      <div>Undo (Ctrl+Z): {isKeyPressed([Keys.CONTROL, Keys.Z]) ? '🟢' : '🔴'}</div>
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

## Unified API with Context Provider

The new unified approach uses a Context Provider and single hook for maximum simplicity:

### Advanced Tool Switching with Hold Progress

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';

function ToolSelector() {
  // Track tool switching progress
  const toolSwitch = useHoldSequence('tool-switch');
  
  return (
    <div className="tool-selector">
      <div>Current Tool: Brush</div>
      <div>Hold Tab to switch: {toolSwitch.isHolding ? `${Math.round(toolSwitch.progress)}%` : 'Released'}</div>
      <div style={{
        width: '200px',
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${toolSwitch.progress}%`,
          height: '100%',
          background: '#3b82f6',
          borderRadius: '4px',
          transition: 'none' // Smooth 60fps RAF animations
        }}/>
      </div>
      {toolSwitch.isReady && <div style={{ color: '#10b981' }}>Tool switched!</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('tool-switch', Keys.TAB, 800) // Hold Tab for 800ms to switch tools
      ]}
    >
      <ToolSelector />
    </NormalizedKeysProvider>
  );
}
```

### Drawing Application with Multiple Hold Actions

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function DrawingCanvas() {
  const brushPressure = useHoldSequence('brush-pressure');
  const panMode = useHoldSequence('pan-mode');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (brushPressure.justStarted) {
      console.log('Start applying pressure to brush');
    }
    if (brushPressure.justCompleted) {
      console.log('Maximum brush pressure reached');
    }
    if (panMode.justCompleted) {
      console.log('Entering pan mode');
    }
  }, [brushPressure.justStarted, brushPressure.justCompleted, panMode.justCompleted]);
  
  return (
    <div className="drawing-canvas">
      <div>Brush Pressure (Space): {Math.round(brushPressure.progress)}%</div>
      <div>Pan Mode (H): {Math.round(panMode.progress)}%</div>
      <div>Brush Size: {10 + (brushPressure.progress / 5)}px</div>
      {panMode.isReady && <div style={{ color: '#10b981' }}>Pan Mode Active</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', Keys.SPACE, 100), // Quick pressure response
        holdSequence('pan-mode', Keys.h, 800) // Hold H to activate pan mode
      ]}
    >
      <DrawingCanvas />
    </NormalizedKeysProvider>
  );
}
```

## What's Next?

- Explore the [API Reference](/api) for detailed documentation
- Check out more [Examples](/examples)
- Try the [Interactive Demo](/demo)