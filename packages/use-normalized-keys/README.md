# use-normalized-keys

[![npm version](https://img.shields.io/npm/v/use-normalized-keys.svg)](https://www.npmjs.com/package/use-normalized-keys)
[![CI Status](https://github.com/DavGarcia/use-normalized-keys/workflows/CI/badge.svg)](https://github.com/DavGarcia/use-normalized-keys/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional React hook for normalized keyboard input handling, optimized for games and interactive applications.

## ✨ Features

- **⚡ Unified Hook API** - Single `useHoldSequence` hook replaces multiple specialized hooks
- **🚀 60fps Animations** - RequestAnimationFrame for perfectly smooth visual effects
- **🎮 Gaming-Optimized** - Built for games with high-frequency input and real-time feedback
- **🌐 Cross-Platform** - Handles Windows Shift+Numpad phantom events, macOS Meta key issues, and platform quirks
- **🔄 Context Provider** - Simplified setup with automatic state management
- **🎹 Sequence Detection** - Detect key sequences (Konami code), chords (Ctrl+S), and hold patterns
- **⏱️ Tap vs Hold** - Distinguish between quick taps and long holds with configurable thresholds
- **🚫 preventDefault API** - Block browser shortcuts selectively or globally
- **🔤 Key Normalization** - Consistent key names across browsers and keyboard layouts
- **📊 Rich Event Data** - Detailed timing, modifiers, numpad state, and duration information
- **📝 TypeScript Ready** - Full type definitions with comprehensive IntelliSense

## 📦 Installation

```bash
npm install use-normalized-keys
```

## 🚀 Quick Start

### Basic Key Detection

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function App() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <p>Pressed keys: {Array.from(keys.pressedKeys).join(', ')}</p>
      <p>Space pressed: {keys.isKeyPressed('Space') ? 'Yes' : 'No'}</p>
      <p>Last key: {keys.lastEvent?.key} {keys.lastEvent?.isTap && '(tap)'}</p>
    </div>
  );
}
```

### With Context Provider & Hold Sequences

```tsx
import { NormalizedKeysProvider, useHoldSequence, holdSequence } from 'use-normalized-keys';

function ChargeButton() {
  const charge = useHoldSequence('power-charge');
  
  return (
    <div style={{ 
      transform: `scale(${charge.scale})`,
      opacity: charge.opacity 
    }}>
      Progress: {Math.round(charge.progress)}%
      {charge.isReady && <span> READY!</span>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('power-charge', 'Space', 1000)
      ]}
    >
      <ChargeButton />
    </NormalizedKeysProvider>
  );
}
```

## 📖 Documentation

- 📚 [Full Documentation](https://davgarcia.github.io/use-normalized-keys/)
- 🎮 [Interactive Demo](https://davgarcia.github.io/use-normalized-keys/demo/)
- 🔧 [API Reference](#-api-reference)
- ⚡ [Unified Helper Hook](#-unified-helper-hook)
- 🔧 [Helper Functions](#-helper-functions)
- 🔄 [Context Provider](#-context-provider)

## 🎯 Key Features

### Real-Time Key State

```tsx
const keys = useNormalizedKeys();

// Check if specific keys are pressed
if (keys.isKeyPressed('w')) moveUp();
if (keys.isKeyPressed('Space')) jump();

// Get all pressed keys
console.log(Array.from(keys.pressedKeys)); // ['w', 'Space', 'Shift']

// Access modifier states
if (keys.activeModifiers.shift) runFaster();
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
        id: 'save',
        keys: ['Control', 's'],
        type: 'chord'
      },
      {
        id: 'charge-jump',
        keys: [{ key: 'Space', minHoldTime: 750 }],
        type: 'hold'
      }
    ],
    onSequenceMatch: (match) => {
      console.log(`Sequence ${match.sequenceId} detected!`);
    }
  }
});
```

### Hold Detection

Hold detection allows you to trigger events when a key is held for a specific duration. Unlike tap/hold detection which only reports on key release, hold sequences fire **during** the hold when the minimum time is reached.

```tsx
const keys = useNormalizedKeys({
  sequences: {
    sequences: [
      // Simple hold - fires after holding space for 500ms
      {
        id: 'charge-jump',
        name: 'Charge Jump',
        keys: [{ key: 'Space', minHoldTime: 500 }],
        type: 'hold'
      },
      // Hold with modifiers
      {
        id: 'special-move',
        name: 'Special Move',
        keys: [{ 
          key: 's', 
          minHoldTime: 600,
          modifiers: { ctrl: true }
        }],
        type: 'hold'
      }
    ],
    onSequenceMatch: (match) => {
      if (match.type === 'hold') {
        console.log(`Hold detected: ${match.sequenceId}`);
        // Fires DURING the hold, not on release
      }
    }
  }
});
```

#### Hold Configuration

The `minHoldTime` parameter specifies how long (in milliseconds) a key must be held before the hold event fires:

- **Timing**: Hold events fire exactly when `minHoldTime` is reached, while the key is still pressed
- **Range**: Typically 200-2000ms depending on your use case
- **Modifiers**: Can require specific modifier keys to be held simultaneously

Common use cases:
- **Charge mechanics**: Hold to charge jump power, attacks, etc. (500-1000ms)
- **Heavy attacks**: Fighting game style heavy/EX moves (300-600ms)  
- **Context menus**: Long press to show options (600-800ms)
- **Safety actions**: Hold to confirm dangerous operations (1000-2000ms)

### Tap vs Hold Detection

```tsx
const keys = useNormalizedKeys({ 
  tapHoldThreshold: 200 // milliseconds
});

// In your component
if (keys.lastEvent?.type === 'keyup') {
  if (keys.lastEvent.isTap) {
    console.log('Quick tap!');
  } else if (keys.lastEvent.isHold) {
    console.log('Long hold!');
  }
}
```

### preventDefault API

```tsx
// Prevent specific keys
const keys = useNormalizedKeys({
  preventDefault: ['Tab', 'F5', 'F11']
});

// Prevent all keys (useful for games)
const keys = useNormalizedKeys({
  preventDefault: true
});
```

## 🎮 Game Example

```tsx
function GameComponent() {
  const keys = useNormalizedKeys({
    preventDefault: true,
    tapHoldThreshold: 150,
    sequences: {
      sequences: [
        { id: 'special-move', keys: ['a', 's', 'd', 'f'], type: 'sequence' }
      ],
      onSequenceMatch: (match) => {
        if (match.sequenceId === 'special-move') {
          executeSpecialMove();
        }
      }
    }
  });

  useEffect(() => {
    const gameLoop = () => {
      // Movement
      const speed = keys.activeModifiers.shift ? 2 : 1;
      if (keys.isKeyPressed('w')) player.y -= speed;
      if (keys.isKeyPressed('s')) player.y += speed;
      if (keys.isKeyPressed('a')) player.x -= speed;
      if (keys.isKeyPressed('d')) player.x += speed;
      
      // Actions
      if (keys.isKeyPressed('Space')) player.jump();
      
      requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  }, [keys]);
  
  return <canvas />;
}
```

## 🎯 Unified Helper Hook

### useHoldSequence - **NEW!** ⚡

The all-in-one unified hook that combines progress tracking, smooth animations, and game events into a single optimized hook with **60fps requestAnimationFrame** animations:

```tsx
import { useHoldSequence, NormalizedKeysProvider } from 'use-normalized-keys';
import { holdSequence } from 'use-normalized-keys';

function PowerAttackButton() {
  const powerAttack = useHoldSequence('power-attack');
  
  return (
    <div 
      className="power-button"
      style={{
        transform: `scale(${powerAttack.scale})`,
        opacity: powerAttack.opacity,
        boxShadow: powerAttack.glow > 0 ? `0 0 ${powerAttack.glow * 20}px #ff6b35` : 'none',
        marginLeft: `${powerAttack.shake}px`
      }}
    >
      <div 
        className="progress-bar"
        style={{ width: `${powerAttack.progress}%` }}
      />
      {powerAttack.isReady && <span className="ready-indicator">READY!</span>}
      {powerAttack.isCharging && <span>Charging Power Attack...</span>}
      <span>Progress: {Math.round(powerAttack.progress)}%</span>
      <span>Time: {powerAttack.remainingTime}ms remaining</span>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('power-attack', 'f', 1000, { name: 'Power Attack' })
      ]}
    >
      <PowerAttackButton />
    </NormalizedKeysProvider>
  );
}
```

### Game Character with Multiple Hold Sequences

```tsx
import { useHoldSequence, NormalizedKeysProvider } from 'use-normalized-keys';
import { holdSequence } from 'use-normalized-keys';
import { useEffect } from 'react';

function GameCharacter() {
  const chargeJump = useHoldSequence('charge-jump');
  const powerAttack = useHoldSequence('power-attack');
  const shield = useHoldSequence('shield');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (chargeJump.justCompleted) {
      executeChargeJump();
    }
    if (powerAttack.justStarted) {
      showChargingEffect();
    }
    if (powerAttack.justCompleted) {
      executePowerAttack();
    }
    if (shield.justCancelled) {
      hideShield();
    }
  }, [
    chargeJump.justCompleted, 
    powerAttack.justStarted, 
    powerAttack.justCompleted, 
    shield.justCancelled
  ]);
  
  return (
    <div className="character">
      <div className="abilities">
        <div className="ability charge-jump">
          <div>Charge Jump: {Math.round(chargeJump.progress)}%</div>
          {chargeJump.isCharging && <div>Hold Space to charge...</div>}
        </div>
        
        <div className="ability power-attack">
          <div>Power Attack: {Math.round(powerAttack.progress)}%</div>
          {powerAttack.isReady && <div className="ready">READY!</div>}
        </div>
        
        <div className="ability shield">
          <div>Shield: {shield.isHolding ? 'ACTIVE' : 'Ready'}</div>
          <div>Duration: {shield.elapsedTime}ms</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('charge-jump', 'Space', 750, { name: 'Charge Jump' }),
        holdSequence('power-attack', 'f', 1000, { name: 'Power Attack' }),
        holdSequence('shield', 's', 500, { name: 'Shield' })
      ]}
    >
      <GameCharacter />
    </NormalizedKeysProvider>
  );
}
```

### Key Benefits of useHoldSequence

- **🚀 60fps Smooth Animations**: Uses requestAnimationFrame for perfect visual effects
- **⚡ Single Hook**: Replaces useHoldProgress + useHoldAnimation + useSequence
- **🎯 Real-time Properties**: Progress, timing, animation values, and event flags
- **🎮 Game-Optimized**: Built for responsive game mechanics
- **📊 Complete API**: Everything you need in one optimized hook

## 🔧 Helper Functions

### holdSequence

Create hold sequence definitions easily:

```tsx
import { holdSequence } from 'use-normalized-keys';

const sequences = [
  holdSequence('charge-jump', 'Space', 750, { name: 'Charge Jump' }),
  holdSequence('power-attack', 'f', 1000, { 
    name: 'Power Attack',
    modifiers: { ctrl: true }
  }),
  holdSequence('special-move', 's', 600)
];

function GameComponent() {
  const keys = useNormalizedKeys({
    sequences: { sequences }
  });
  // ... rest of component
}
```

### comboSequence

Create sequential combo definitions:

```tsx
import { comboSequence } from 'use-normalized-keys';

const combos = [
  comboSequence('konami', ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'b', 'a']),
  comboSequence('hadouken', ['↓', '↘', '→', 'p'], { timeout: 500 }),
  comboSequence('vim-escape', ['j', 'k'], { 
    name: 'Vim Escape', 
    timeout: 300 
  })
];
```

### chordSequence

Create simultaneous key combination definitions:

```tsx
import { chordSequence } from 'use-normalized-keys';

const shortcuts = [
  chordSequence('save', ['Control', 's']),
  chordSequence('copy', ['Control', 'c'], { name: 'Copy' }),
  chordSequence('screenshot', ['Control', 'Shift', 's'])
];
```


### holdSequences

Create multiple hold sequences with a common pattern:

```tsx
import { holdSequences } from 'use-normalized-keys';

const chargeMoves = holdSequences([
  { id: 'light-punch', key: 'j', duration: 200, name: 'Light Punch' },
  { id: 'medium-punch', key: 'j', duration: 500, name: 'Medium Punch' },
  { id: 'heavy-punch', key: 'j', duration: 1000, name: 'Heavy Punch' }
]);
```

## 🔄 Context Provider

The **NormalizedKeysProvider** simplifies setup and provides automatic Context management:

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence 
} from 'use-normalized-keys';

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('charge-jump', 'Space', 750),
        holdSequence('power-attack', 'f', 1000),
        holdSequence('shield', 's', 500)
      ]}
      debug={true}
      tapHoldThreshold={200}
      preventDefault={['Tab', 'F5']}
      excludeInputFields={true}
    >
      <GameComponent />
    </NormalizedKeysProvider>
  );
}

function GameComponent() {
  // Now you can use useHoldSequence directly!
  const chargeJump = useHoldSequence('charge-jump');
  const powerAttack = useHoldSequence('power-attack');
  const shield = useHoldSequence('shield');
  
  return (
    <div>
      <div>Charge Jump: {Math.round(chargeJump.progress)}%</div>
      <div>Power Attack: {Math.round(powerAttack.progress)}%</div>
      <div>Shield: {shield.isHolding ? 'ACTIVE' : 'Ready'}</div>
    </div>
  );
}
```

## 🛠️ API Reference

### Hook Options

```typescript
interface UseNormalizedKeysOptions {
  enabled?: boolean;              // Enable/disable the hook
  debug?: boolean;                // Enable debug logging
  excludeInputFields?: boolean;   // Ignore input/textarea elements (default: true)
  tapHoldThreshold?: number;      // Tap vs hold threshold in ms (default: 200)
  sequences?: SequenceOptions;    // Sequence detection configuration
  preventDefault?: boolean | string[]; // Prevent default for all or specific keys
}
```

### useHoldSequence API

```typescript
// useHoldSequence - Unified hook combining all functionality
interface UseHoldSequenceResult {
  // Core Progress Data (from useHoldProgress functionality)
  progress: number;              // Real-time progress (0-100)
  isHolding: boolean;           // Currently holding key
  isComplete: boolean;          // Hold completed
  elapsedTime: number;          // Time elapsed in ms
  remainingTime: number;        // Time remaining in ms
  startTime: number | null;     // When hold started
  minHoldTime: number;          // Required hold duration
  
  // Animation Properties (from useHoldAnimation functionality)
  scale: number;                // Scale multiplier (1.0-1.3)
  opacity: number;              // Opacity value (0.3-1.0) 
  glow: number;                 // Glow intensity (0-1)
  shake: number;                // Shake offset in pixels
  isCharging: boolean;          // Currently charging
  isReady: boolean;             // At 90%+ progress
  isAnimating: boolean;         // Animation active
  
  // Game Event Flags (from useSequence functionality) 
  justStarted: boolean;         // Just started (100ms window)
  justCompleted: boolean;       // Just completed (100ms window)
  justCancelled: boolean;       // Just cancelled (100ms window)
  
  // Extended Timing Information
  timeSinceStart: number | null;   // Time since hold started
  timeSinceLastEvent: number | null; // Time since last event
  
  // Match Information
  lastMatch: MatchedSequence | undefined; // Last sequence match
  matchCount: number;                     // Total matches
  
  // Event History for Advanced Use Cases
  eventHistory: Array<{
    timestamp: number;
    type: 'started' | 'completed' | 'cancelled';
  }>;
}

// Context Provider Props
interface NormalizedKeysProviderProps {
  children: React.ReactNode;
  sequences?: SequenceDefinition[];   // Simplified: just pass array
  debug?: boolean;
  tapHoldThreshold?: number;
  excludeInputFields?: boolean;
  preventDefault?: boolean | string[];
}
```
```

### Return Value

```typescript
interface NormalizedKeyState {
  lastEvent: NormalizedKeyEvent | null;  // Last keyboard event
  pressedKeys: Set<string>;               // Currently pressed keys
  isKeyPressed: (key: string) => boolean; // Check if key is pressed
  activeModifiers: ModifierState;         // Modifier key states
  sequences?: SequenceAPI;                // Sequence detection API
}
```

### Event Data

```typescript
interface NormalizedKeyEvent {
  key: string;                // Normalized key name
  type: 'keydown' | 'keyup';
  duration?: number;          // Duration in ms (keyup only)
  isTap?: boolean;           // True if duration < threshold
  isHold?: boolean;          // True if duration >= threshold
  timestamp: number;
  activeModifiers: ModifierState;
  // ... and more
}
```

## 🌍 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/DavGarcia/use-normalized-keys/blob/main/CONTRIBUTING.md) for details.

## 📄 License

MIT © [David Garcia](https://github.com/DavGarcia)

---

Made with ❤️ for the React gaming and interactive app community.