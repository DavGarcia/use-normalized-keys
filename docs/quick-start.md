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

function GameControls() {
  const { isKeyPressed } = useNormalizedKeys();
  
  return (
    <div>
      <h3>Movement Controls</h3>
      <div>W (forward): {isKeyPressed(Keys.W) ? '🟢' : '🔴'}</div>
      <div>A (left): {isKeyPressed(Keys.A) ? '🟢' : '🔴'}</div>
      <div>S (backward): {isKeyPressed(Keys.S) ? '🟢' : '🔴'}</div>
      <div>D (right): {isKeyPressed(Keys.D) ? '🟢' : '🔴'}</div>
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

### Hold Progress Tracking with Smooth Animations

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';

function ChargingAttack() {
  // Single unified hook with all functionality
  const charge = useHoldSequence('charge-attack');
  
  return (
    <div style={{
      transform: `scale(${charge.scale})`,
      opacity: charge.opacity,
      boxShadow: charge.glow > 0 ? `0 0 ${charge.glow * 20}px #4CAF50` : 'none'
    }}>
      <div>Charging: {charge.isHolding ? `${Math.round(charge.progress)}%` : 'Ready'}</div>
      <div style={{
        width: '200px',
        height: '20px',
        background: '#ddd',
        borderRadius: '10px'
      }}>
        <div style={{
          width: `${charge.progress}%`,
          height: '100%',
          background: '#4CAF50',
          borderRadius: '10px',
          transition: 'none' // No CSS transitions needed - 60fps RAF animations!
        }}/>
      </div>
      {charge.isReady && <div className="ready">READY!</div>}
      <div>Time remaining: {charge.remainingTime}ms</div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('charge-attack', Keys.SPACE, 1000) // Hold space for 1 second
      ]}
    >
      <ChargingAttack />
    </NormalizedKeysProvider>
  );
}
```

### Game Character with Multiple Hold Sequences

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function GameCharacter() {
  const jump = useHoldSequence('charge-jump');
  const attack = useHoldSequence('power-attack');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (jump.justCompleted) {
      console.log('Execute charge jump!');
    }
    if (attack.justStarted) {
      console.log('Start charging power attack...');
    }
    if (attack.justCompleted) {
      console.log('Execute power attack!');
    }
  }, [jump.justCompleted, attack.justStarted, attack.justCompleted]);
  
  return (
    <div className="character">
      <div>Charge Jump (Space): {Math.round(jump.progress)}%</div>
      <div>Power Attack (F): {Math.round(attack.progress)}%</div>
      {attack.isReady && <div>Power Attack READY!</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('charge-jump', Keys.SPACE, 500),
        holdSequence('power-attack', Keys.F, 1000)
      ]}
    >
      <GameCharacter />
    </NormalizedKeysProvider>
  );
}
```

## What's Next?

- Explore the [API Reference](/api) for detailed documentation
- Check out more [Examples](/examples)
- Try the [Interactive Demo](/demo)