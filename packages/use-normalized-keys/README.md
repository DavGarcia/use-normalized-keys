# use-normalized-keys

[![npm version](https://img.shields.io/npm/v/use-normalized-keys.svg)](https://www.npmjs.com/package/use-normalized-keys)
[![CI Status](https://github.com/DavGarcia/use-normalized-keys/workflows/CI/badge.svg)](https://github.com/DavGarcia/use-normalized-keys/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional React hook for normalized keyboard input handling, optimized for games and interactive applications.

## ✨ Features

- **🎮 Gaming-Optimized** - Built for games with high-frequency input, sequence detection, and tap/hold recognition
- **🌐 Cross-Platform** - Handles Windows Shift+Numpad phantom events, macOS Meta key issues, and platform quirks
- **⚡ Real-Time Performance** - Optimized with minimal re-renders and efficient state management
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

## 📖 Documentation

- 📚 [Full Documentation](https://davgarcia.github.io/use-normalized-keys/)
- 🎮 [Interactive Demo](https://davgarcia.github.io/use-normalized-keys/demo/)
- 🔧 [API Reference](#-api-reference)
- 🎯 [Helper Hooks](#-helper-hooks)
- 🔧 [Helper Functions](#-helper-functions)

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

## 🎯 Helper Hooks

### useHoldProgress

Track hold progress with smooth animation values for UI feedback:

```tsx
import { useHoldProgress } from 'use-normalized-keys';

function ChargeJumpButton() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        { id: 'charge-jump', keys: [{ key: 'Space', minHoldTime: 1000 }], type: 'hold' }
      ]
    }
  });
  
  const progress = useHoldProgress('charge-jump');
  
  return (
    <div className="charge-button">
      <div 
        className="progress-bar"
        style={{ width: `${progress.progress}%` }}
      />
      <span>
        {progress.isHolding ? `Charging... ${progress.remainingTime}ms` : 'Hold Space to Charge'}
      </span>
    </div>
  );
}
```

### useHoldAnimation

Advanced animated hold progress with visual effects:

```tsx
import { useHoldAnimation } from 'use-normalized-keys';

function AnimatedChargeButton() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        { id: 'power-move', keys: [{ key: 'f', minHoldTime: 750 }], type: 'hold' }
      ]
    }
  });
  
  const animation = useHoldAnimation('power-move');
  
  return (
    <div 
      className="power-button"
      style={{
        transform: `scale(${animation.scale})`,
        opacity: animation.opacity,
        boxShadow: animation.glow > 0 ? `0 0 ${animation.glow * 20}px #ff6b35` : 'none',
        marginLeft: `${animation.shake}px`
      }}
    >
      <div 
        className="charge-fill"
        style={{ width: `${animation.progress}%` }}
      />
      {animation.isReady && <span className="ready-indicator">READY!</span>}
      {animation.isCharging && <span>Charging Power Move...</span>}
    </div>
  );
}
```

### useSequence

Game-oriented sequence tracking with event flags:

```tsx
import { useSequence, useNormalizedKeys } from 'use-normalized-keys';
import { useEffect } from 'react';

function GameCharacter() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        { id: 'combo-attack', keys: ['a', 's', 'd'], type: 'sequence' },
        { id: 'special-move', keys: [{ key: 'f', minHoldTime: 500 }], type: 'hold' }
      ]
    }
  });
  
  const combo = useSequence('combo-attack');
  const special = useSequence('special-move');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (combo.justCompleted) {
      executeComboAttack();
    }
    if (special.justStarted) {
      showChargingEffect();
    }
    if (special.justCompleted) {
      executeSpecialMove();
    }
    if (special.justCancelled) {
      hideChargingEffect();
    }
  }, [combo.justCompleted, special.justStarted, special.justCompleted, special.justCancelled]);
  
  return (
    <div className="character">
      <div className="status">
        Combo Progress: {combo.progress}%
        Special Hold: {special.isHolding ? `${special.elapsedTime}ms` : 'Ready'}
      </div>
    </div>
  );
}
```

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

### fightingCombo

Create fighting game style combos with numpad notation:

```tsx
import { fightingCombo } from 'use-normalized-keys';

const fightingMoves = [
  fightingCombo('hadouken', '236P'),           // Quarter circle forward + punch
  fightingCombo('shoryuken', '623P'),          // Dragon punch motion
  fightingCombo('sonic-boom', '[4]6P', {      // Charge back, forward + punch
    chargeTime: 800
  })
];
```

### rhythmSequence  

Create rhythm-based sequences:

```tsx
import { rhythmSequence } from 'use-normalized-keys';

const rhythmPatterns = [
  rhythmSequence('dance-move', ['↑', '↓', '←', '→'], 120), // 120 BPM
  rhythmSequence('beat-match', ['Space', 'Space', 'Enter'], 140, {
    tolerance: 50 // 50ms timing tolerance
  })
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

### Helper Hook APIs

```typescript
// useHoldProgress return type
interface HoldProgressResult {
  progress: number;        // Smooth progress value (0-100)
  isHolding: boolean;      // Whether currently holding
  isComplete: boolean;     // Whether hold is complete
  elapsedTime: number;     // Time elapsed in ms
  remainingTime: number;   // Time remaining in ms
  startTime: number | null; // When hold started
  minHoldTime: number;     // Required hold duration
}

// useHoldAnimation return type
interface HoldAnimationResult {
  progress: number;        // Animated progress (0-100)
  scale: number;          // Scale multiplier (1.0-1.3)
  opacity: number;        // Opacity value (0.3-1.0)
  glow: number;          // Glow intensity (0-1)
  shake: number;         // Shake offset in pixels
  isAnimating: boolean;   // Whether animation is active
  isCharging: boolean;    // Whether currently charging
  isReady: boolean;       // Whether at 90%+ progress
}

// useSequence return type
interface SequenceResult {
  isHolding: boolean;      // Currently holding
  isComplete: boolean;     // Sequence complete
  progress: number;        // Progress percentage
  justStarted: boolean;    // Just started (100ms window)
  justCompleted: boolean;  // Just completed (100ms window)
  justCancelled: boolean;  // Just cancelled (100ms window)
  startTime: number | null; // When started
  elapsedTime: number;     // Time elapsed
  remainingTime: number;   // Time remaining
  minHoldTime: number;     // Required duration
  matchCount: number;      // Total matches
  eventHistory: Array<{    // Event history
    timestamp: number;
    type: 'started' | 'completed' | 'cancelled';
  }>;
}
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