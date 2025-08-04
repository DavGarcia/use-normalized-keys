# useNormalizedKeys

A React hook for normalized keyboard input handling, optimized for games and interactive applications with advanced features like sequence detection, tap/hold recognition, and cross-platform compatibility.

## What is useNormalizedKeys?

useNormalizedKeys is a comprehensive React hook that provides consistent, feature-rich keyboard input handling across different browsers and platforms. It's designed for applications that require precise, real-time keyboard interaction like games, drawing applications, interactive creative tools, and productivity applications.

## Key Features

- **🌐 Cross-platform compatibility** - Handles Windows Shift+Numpad phantom events, macOS Meta key issues, and other platform-specific quirks
- **⚡ Real-time performance** - Optimized for high-frequency input scenarios with minimal overhead
- **🎹 Sequence detection** - Detect complex key sequences (Konami code, shortcuts, etc.) and chord combinations
- **⏱️ Tap vs Hold detection** - Distinguish between quick taps and long holds with configurable thresholds
- **🚫 preventDefault API** - Prevent browser shortcuts for specific keys or all keys
- **🔤 Key normalization** - Consistent key names across different browsers and layouts
- **📊 Rich event data** - Detailed information about timing, modifiers, numpad state, and more
- **🎮 Gaming optimized** - Perfect for games with features like focus loss recovery and input field exclusion
- **📝 TypeScript support** - Full type definitions with comprehensive IntelliSense
- **🔧 Zero configuration** - Works out of the box with sensible defaults

## Quick Example

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function GameComponent() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        { id: 'konami', keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'], type: 'sequence' }
      ],
      onSequenceMatch: (match) => console.log(`${match.sequenceId} code entered!`)
    },
    preventDefault: true, // Prevent browser shortcuts
    tapHoldThreshold: 150 // 150ms for tap vs hold
  });
  
  return (
    <div>
      <p>Last key: {keys.lastEvent?.key} 
         {keys.lastEvent?.isTap && ' (tap)'} 
         {keys.lastEvent?.isHold && ' (hold)'}
      </p>
      <p>Currently pressed: {Array.from(keys.pressedKeys).join(', ')}</p>
      
      <div>
        <h3>WASD Movement</h3>
        <ul>
          <li>W (Up): {keys.isKeyPressed('w') ? '🟢' : '⚪'}</li>
          <li>A (Left): {keys.isKeyPressed('a') ? '🟢' : '⚪'}</li>
          <li>S (Down): {keys.isKeyPressed('s') ? '🟢' : '⚪'}</li>
          <li>D (Right): {keys.isKeyPressed('d') ? '🟢' : '⚪'}</li>
        </ul>
      </div>
      
      <div>
        <h3>Modifiers</h3>
        <p>Shift: {keys.activeModifiers.shift ? '🟢' : '⚪'}</p>
        <p>Ctrl: {keys.activeModifiers.ctrl ? '🟢' : '⚪'}</p>
      </div>
      
      {keys.sequences?.matches.length > 0 && (
        <div>
          <h3>Sequences Detected</h3>
          {keys.sequences.matches.map(match => (
            <p key={match.sequenceId}>✨ {match.sequenceId}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Getting Started

Ready to get started? Check out our [installation guide](/installation) and [quick start tutorial](/quick-start).

Or jump right into the [live demo](/demo) to see it in action!