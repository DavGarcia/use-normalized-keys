# use-normalized-keys

[![npm version](https://img.shields.io/npm/v/use-normalized-keys.svg)](https://www.npmjs.com/package/use-normalized-keys)
[![CI Status](https://github.com/DavGarcia/use-normalized-keys/workflows/CI/badge.svg)](https://github.com/DavGarcia/use-normalized-keys/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional React hook for normalized keyboard input handling, designed for productivity applications, drawing tools, and professional interfaces.

**📖 [USAGE.md](./USAGE.md) - Quick start guide for AI tools and developers**

## ✨ Features

- **⚡ Professional Shortcuts** - Build keyboard-driven interfaces like Photoshop, Figma, VS Code
- **🚀 60fps Animations** - RequestAnimationFrame for perfectly smooth visual feedback  
- **🎨 Drawing Tools Ready** - Optimized for creative applications with pressure sensitivity and tool switching
- **🌐 Cross-Platform** - Handles Windows, macOS, and Linux keyboard differences seamlessly
- **🔄 Context Provider** - Simplified setup with automatic state management
- **🎹 Advanced Sequences** - Detect shortcuts (Ctrl+S), key sequences (jk), and hold patterns
- **⏱️ Tap vs Hold** - Distinguish between quick taps and long holds with configurable thresholds
- **🚫 Smart Prevention** - Block browser shortcuts selectively while respecting input fields
- **🔤 Key Normalization** - Consistent key names across browsers and keyboard layouts  
- **📊 Rich Event Data** - Detailed timing, modifiers, and accessibility information
- **📝 TypeScript First** - Complete type definitions with excellent IntelliSense support

## 📦 Installation

```bash
npm install use-normalized-keys
```

## 🚀 Quick Start

### Basic Productivity Shortcuts

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function TextEditor() {
  const keys = useNormalizedKeys();
  
  React.useEffect(() => {
    // Handle Ctrl+S (Save)
    if (keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.s)) {
      console.log('Save document');
    }
    
    // Handle Ctrl+Z (Undo)  
    if (keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.z)) {
      console.log('Undo last action');
    }
    
    // Handle Ctrl+Shift+Z (Redo)
    if (keys.activeModifiers.ctrl && keys.activeModifiers.shift && keys.isKeyPressed(Keys.z)) {
      console.log('Redo action');
    }
  }, [keys.isKeyPressed, keys.activeModifiers]);
  
  return (
    <div>
      <textarea placeholder="Start typing..." />
      <p>Last key: {keys.lastEvent?.key || 'None'}</p>
      <p>Pressed keys: {Array.from(keys.pressedKeys).join(', ')}</p>
    </div>
  );
}
```

### Drawing Tool with Pressure Sensitivity

```tsx
import { NormalizedKeysProvider, useHoldSequence, holdSequence, chordSequence, Keys } from 'use-normalized-keys';

function DrawingCanvas() {
  const brushPressure = useHoldSequence('brush-pressure');
  
  return (
    <div className="canvas">
      <div className="brush-preview" style={{ 
        transform: `scale(${1 + brushPressure.progress / 200})`,
        opacity: 0.5 + brushPressure.progress / 200 
      }}>
        Brush Size: {Math.round(10 + brushPressure.progress / 10)}px
        {brushPressure.isCharging && <span> (Hold Space for pressure)</span>}
      </div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        // Pressure sensitivity
        holdSequence('brush-pressure', Keys.SPACE, 100, { continuous: true }),
        // Standard shortcuts  
        chordSequence('save', [Keys.CONTROL, Keys.s], { name: 'Save' }),
        chordSequence('undo', [Keys.CONTROL, Keys.z], { name: 'Undo' })
      ]}
    >
      <DrawingCanvas />
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
if (keys.isKeyPressed(Keys.w)) moveUp();
if (keys.isKeyPressed(Keys.SPACE)) jump();

// Get all pressed keys
console.log(Array.from(keys.pressedKeys)); // [Keys.w, Keys.SPACE, Keys.SHIFT]

// Access modifier states
if (keys.activeModifiers.shift) runFaster();
```

### Sequence Detection

```tsx
const keys = useNormalizedKeys({
  sequences: [
    {
      id: 'konami',
      keys: [Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.b, Keys.a],
      type: 'sequence'
    },
    {
      id: 'save',
      keys: [Keys.CONTROL, Keys.s],
      type: 'chord'
    },
    {
      id: 'charge-jump',
      keys: [{ key: Keys.SPACE, minHoldTime: 750 }],
      type: 'hold'
    }
  ],
  onSequenceMatch: (match) => {
    console.log(`Sequence ${match.sequenceId} detected!`);
  }
});
```

### Hold Detection

Hold detection allows you to trigger events when a key is held for a specific duration. Unlike tap/hold detection which only reports on key release, hold sequences fire **during** the hold when the minimum time is reached.

```tsx
const keys = useNormalizedKeys({
  sequences: [
    // Simple hold - fires after holding space for 500ms
    {
      id: 'charge-jump',
      name: 'Charge Jump',
      keys: [{ key: Keys.SPACE, minHoldTime: 500 }],
      type: 'hold'
    },
    // Hold with modifiers
    {
      id: 'special-move',
      name: 'Special Move',
      keys: [{ 
        key: Keys.s, 
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
  preventDefault: [Keys.TAB, Keys.F5, Keys.F11]
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
    sequences: [
      { id: 'special-move', keys: [Keys.a, Keys.s, Keys.d, Keys.f], type: 'sequence' }
    ],
    onSequenceMatch: (match) => {
      if (match.sequenceId === 'special-move') {
        executeSpecialMove();
      }
    }
  });

  useEffect(() => {
    const gameLoop = () => {
      // Movement
      const speed = keys.activeModifiers.shift ? 2 : 1;
      if (keys.isKeyPressed(Keys.w)) player.y -= speed;
      if (keys.isKeyPressed(Keys.s)) player.y += speed;
      if (keys.isKeyPressed(Keys.a)) player.x -= speed;
      if (keys.isKeyPressed(Keys.d)) player.x += speed;
      
      // Actions
      if (keys.isKeyPressed(Keys.SPACE)) player.jump();
      
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
import { useHoldSequence, NormalizedKeysProvider, holdSequence, Keys } from 'use-normalized-keys';

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
        holdSequence('power-attack', Keys.f, 1000, { name: 'Power Attack' })
      ]}
    >
      <PowerAttackButton />
    </NormalizedKeysProvider>
  );
}
```

### Game Character with Multiple Hold Sequences

```tsx
import { useHoldSequence, NormalizedKeysProvider, holdSequence, Keys } from 'use-normalized-keys';
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
        holdSequence('charge-jump', Keys.SPACE, 750, { name: 'Charge Jump' }),
        holdSequence('power-attack', Keys.f, 1000, { name: 'Power Attack' }),
        holdSequence('shield', Keys.s, 500, { name: 'Shield' })
      ]}
    >
      <GameCharacter />
    </NormalizedKeysProvider>
  );
}
```

### Key Benefits of useHoldSequence

- **🚀 60fps Smooth Animations**: Uses requestAnimationFrame for perfect visual effects
- **⚡ Unified API**: Single hook with comprehensive functionality
- **🎯 Real-time Properties**: Progress, timing, animation values, and event flags
- **🎮 Game-Optimized**: Built for responsive game mechanics
- **📊 Complete API**: Everything you need in one optimized hook

## 🔧 Helper Functions

### holdSequence

Create hold sequence definitions easily:

```tsx
import { holdSequence, Keys } from 'use-normalized-keys';

const sequences = [
  holdSequence('charge-jump', Keys.SPACE, 750, { name: 'Charge Jump' }),
  holdSequence('power-attack', Keys.f, 1000, { 
    name: 'Power Attack',
    modifiers: { ctrl: true }
  }),
  holdSequence('special-move', Keys.s, 600)
];

function GameComponent() {
  const keys = useNormalizedKeys({
    sequences
  });
  // ... rest of component
}
```

### comboSequence

Create sequential combo definitions:

```tsx
import { comboSequence, Keys, CommonSequences } from 'use-normalized-keys';

const combos = [
  comboSequence('konami', CommonSequences.KONAMI_CODE),
  comboSequence('hadouken', [...CommonSequences.HADOUKEN, Keys.p], { timeout: 500 }),
  comboSequence('vim-escape', CommonSequences.VIM_ESCAPE, { 
    name: 'Vim Escape', 
    timeout: 300 
  })
];
```

### chordSequence

Create simultaneous key combination definitions:

```tsx
import { chordSequence, Keys } from 'use-normalized-keys';

const shortcuts = [
  chordSequence('save', [Keys.CONTROL, Keys.s]),
  chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy' }),
  chordSequence('screenshot', [Keys.CONTROL, Keys.SHIFT, Keys.s])
];
```


### holdSequences

Create multiple hold sequences with a common pattern:

```tsx
import { holdSequences, Keys } from 'use-normalized-keys';

const chargeMoves = holdSequences([
  { id: 'light-punch', key: Keys.j, duration: 200, name: 'Light Punch' },
  { id: 'medium-punch', key: Keys.j, duration: 500, name: 'Medium Punch' },
  { id: 'heavy-punch', key: Keys.j, duration: 1000, name: 'Heavy Punch' }
]);
```

## 🔄 Context Provider

The **NormalizedKeysProvider** simplifies setup and provides automatic Context management:

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('charge-jump', Keys.SPACE, 750),
        holdSequence('power-attack', Keys.f, 1000),
        holdSequence('shield', Keys.s, 500)
      ]}
      debug={true}
      tapHoldThreshold={200}
      preventDefault={[Keys.TAB, Keys.F5]}
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
  // Core Progress Data
  progress: number;              // Real-time progress (0-100)
  isHolding: boolean;           // Currently holding key
  isComplete: boolean;          // Hold completed
  elapsedTime: number;          // Time elapsed in ms
  remainingTime: number;        // Time remaining in ms
  startTime: number | null;     // When hold started
  minHoldTime: number;          // Required hold duration
  
  // Animation Properties
  scale: number;                // Scale multiplier (1.0-1.3)
  opacity: number;              // Opacity value (0.3-1.0) 
  glow: number;                 // Glow intensity (0-1)
  shake: number;                // Shake offset in pixels
  isCharging: boolean;          // Currently charging
  isReady: boolean;             // At 90%+ progress
  isAnimating: boolean;         // Animation active
  
  // Game Event Flags 
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