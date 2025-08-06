# API Reference

## useNormalizedKeys

The main hook for normalized keyboard input handling, providing comprehensive keyboard event processing with advanced features like sequence detection, tap/hold recognition, and cross-platform compatibility.

### Signature

```typescript
function useNormalizedKeys(options?: UseNormalizedKeysOptions): NormalizedKeyState
```

### Parameters

#### `options` (optional)

Configuration object for the hook.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether the hook should be active |
| `debug` | `boolean` | `false` | Enable debug logging for troubleshooting |
| `excludeInputFields` | `boolean` | `true` | Whether to ignore events from input fields |
| `tapHoldThreshold` | `number` | `200` | Threshold in ms for tap vs hold detection |
| `sequences` | `SequenceOptions` | `undefined` | Configuration for sequence detection |
| `preventDefault` | `boolean \| string[]` | `false` | Prevent default for all keys or specific combinations |

### Return Value

The hook returns a `NormalizedKeyState` object with the following properties:

#### `lastEvent`

- **Type:** `NormalizedKeyEvent | null`
- **Description:** The last keyboard event that was processed, containing detailed information about the key, timing, and context

#### `pressedKeys`

- **Type:** `Set<string>`
- **Description:** A Set containing all currently pressed keys (normalized key names)

#### `isKeyPressed`

- **Type:** `(key: string) => boolean`
- **Description:** Function to check if a specific key is currently pressed

#### `activeModifiers`

- **Type:** `ModifierState`
- **Description:** Object containing the current state of all modifier keys (shift, ctrl, alt, meta, caps, numLock, scrollLock)

#### `sequences` (optional)

- **Type:** `SequenceAPI | undefined`
- **Description:** Sequence detection API when sequences are configured, providing methods to manage and detect key sequences

#### `currentHolds`

- **Type:** `CurrentHolds`
- **Description:** Map of currently active hold sequences, keyed by sequence ID. Each entry contains real-time progress information for active holds

## Type Definitions

### `NormalizedKeyState`

```typescript
interface NormalizedKeyState {
  lastEvent: NormalizedKeyEvent | null;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
  activeModifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    caps: boolean;
    numLock: boolean;
    scrollLock: boolean;
  };
  sequences?: {
    matches: MatchedSequence[];
    addSequence: (definition: SequenceDefinition) => void;
    removeSequence: (id: string) => void;
    clearSequences: () => void;
    resetState: () => void;
    debugState?: {
      currentSequence: NormalizedKeyEvent[];
      sequenceStartTime: number | null;
      lastKeyTime: number;
      activeChordKeys: Set<string>;
      potentialChord: NormalizedKeyEvent[];
      chordStartTime: number | null;
      chordMatched: boolean;
      heldKeys: Map<string, { startTime: number; event: NormalizedKeyEvent }>;
      recentMatches: MatchedSequence[];
    };
  };
  currentHolds: CurrentHolds;
}
```

### `UseNormalizedKeysOptions`

```typescript
interface UseNormalizedKeysOptions {
  enabled?: boolean;
  debug?: boolean;
  excludeInputFields?: boolean;
  tapHoldThreshold?: number;
  sequences?: SequenceOptions;
  preventDefault?: boolean | string[];
}
```

### `NormalizedKeyEvent`

```typescript
interface NormalizedKeyEvent {
  key: string;              // Normalized key name
  originalKey: string;      // Original key from event
  code: string;            // Normalized key code
  originalCode: string;    // Original code from event
  type: 'keydown' | 'keyup';
  isModifier: boolean;
  activeModifiers: ModifierState;
  timestamp: number;
  isRepeat: boolean;
  isNumpad: boolean;
  duration?: number;       // For keyup events, duration since keydown
  isTap?: boolean;        // True if duration < tapHoldThreshold
  isHold?: boolean;       // True if duration >= tapHoldThreshold
  preventedDefault: boolean;
  numpadInfo?: {
    isNumLockOn: boolean;
    activeMode: 'digit' | 'navigation';
    digit: string;
    navigation: string;
  };
}
```

### `SequenceDefinition`

```typescript
interface SequenceDefinition {
  id: string;                  // Unique identifier for the sequence
  name?: string;               // Optional human-readable name
  keys: SequenceKey[];         // Array of keys in the sequence
  type: 'sequence' | 'chord' | 'hold';  // Type of sequence
  timeout?: number;            // Timeout between keys (for 'sequence' type)
  allowOtherKeys?: boolean;    // Allow other keys between sequence keys
  caseSensitive?: boolean;     // Whether to match case exactly
}

type SequenceKey = string | {
  key: string;                 // The key to match
  minHoldTime?: number;        // Minimum hold time in ms (for 'hold' type)
  modifiers?: {                // Required modifier states
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
};
```

### `MatchedSequence`

```typescript
interface MatchedSequence {
  sequenceId: string;          // ID of the matched sequence
  sequenceName?: string;       // Name of the matched sequence
  type: 'sequence' | 'chord' | 'hold';
  startTime: number;           // When the sequence started
  endTime: number;             // When the sequence completed
  duration: number;            // Total duration
  keys: NormalizedKeyEvent[];  // The actual keys that matched
  matchedAt: number;          // Timestamp when match was detected
}
```

### `HoldProgress`

```typescript
interface HoldProgress {
  sequenceId: string;          // ID of the hold sequence
  sequenceName?: string;       // Optional name of the sequence
  key: string;                 // The key being held
  startTime: number;           // When the hold started
  minHoldTime: number;         // Required hold duration in ms
  progress: number;            // Progress value (0-1)
  progressPercent: number;     // Progress as percentage (0-100)
  elapsedTime: number;         // Time elapsed since start in ms
  remainingTime: number;       // Time remaining until complete in ms
  isComplete: boolean;         // Whether the hold duration has been reached
}
```

### `CurrentHolds`

```typescript
type CurrentHolds = Map<string, HoldProgress>;
```

## Examples

### Basic Usage

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useEffect } from 'react';

function KeyboardHandler() {
  const keys = useNormalizedKeys();

  // React to keyboard events with useEffect
  useEffect(() => {
    if (keys.lastEvent?.type === 'keydown') {
      console.log(`Key pressed: ${keys.lastEvent.key}`);
    }
    
    if (keys.lastEvent?.type === 'keyup') {
      console.log(`Key released: ${keys.lastEvent.key}`);
      console.log(`Duration: ${keys.lastEvent.duration}ms`);
      console.log(`Was ${keys.lastEvent.isTap ? 'tapped' : 'held'}`);
    }
  }, [keys.lastEvent]);

  // Check if a key is currently pressed
  const isSpacePressed = keys.isKeyPressed('Space');
  
  // Check modifier combinations
  const isShiftA = keys.activeModifiers.shift && keys.isKeyPressed('a');
  
  // Get all pressed keys
  const pressedKeysList = Array.from(keys.pressedKeys);

  return (
    <div>
      <p>Space pressed: {isSpacePressed ? 'Yes' : 'No'}</p>
      <p>Shift+A: {isShiftA ? 'Yes' : 'No'}</p>
      <p>Active keys: {pressedKeysList.join(', ')}</p>
    </div>
  );
}
```

### Advanced Configuration

```tsx
const keys = useNormalizedKeys({
  debug: true,                    // Enable debug logging
  tapHoldThreshold: 150,         // 150ms threshold for tap vs hold
  excludeInputFields: false,     // Process events from input fields
  preventDefault: ['Tab', 'F5'], // Prevent default for specific keys
});
```

### Sequence Detection

Detect complex key patterns like combos, chords, and hold sequences for advanced game mechanics and keyboard shortcuts.

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
        id: 'ctrl-s',
        keys: ['Control', 's'],
        type: 'chord'
      },
      {
        id: 'charge-jump',
        keys: [{ key: 'Space', minHoldTime: 500 }],
        type: 'hold'
      }
    ],
    onSequenceMatch: (match) => {
      console.log(`Sequence ${match.sequenceId} matched!`);
    }
  }
});

// Access matched sequences
console.log(keys.sequences?.matches);
```

### Hold Detection

Hold detection fires events when a key is held for a specified duration. Unlike tap/hold detection, hold sequences fire **during** the hold, not on release.

```tsx
const keys = useNormalizedKeys({
  sequences: {
    sequences: [
      // Basic hold - fires after 500ms while space is still pressed
      {
        id: 'charge-jump',
        name: 'Charge Jump',
        keys: [{ key: 'Space', minHoldTime: 500 }],
        type: 'hold'
      },
      // Hold with modifiers
      {
        id: 'power-attack',
        name: 'Power Attack',
        keys: [{ 
          key: 'f', 
          minHoldTime: 1000,
          modifiers: { shift: true }
        }],
        type: 'hold'
      }
    ],
    onSequenceMatch: (match) => {
      if (match.type === 'hold') {
        console.log(`Hold activated: ${match.sequenceId}`);
        // This fires DURING the hold, after minHoldTime
      }
    }
  }
});
```

#### Hold Timing Behavior

- **Proactive firing**: Hold events fire exactly when `minHoldTime` is reached
- **During press**: Events fire while the key is still pressed, not on release
- **Single firing**: Each hold fires once per press when the threshold is reached
- **Cancellation**: Releasing the key before `minHoldTime` cancels the hold

### preventDefault API

Selectively block browser default behaviors for specific key combinations or all keyboard events.

```tsx
// Prevent default for all keys
const keys1 = useNormalizedKeys({ preventDefault: true });

// Prevent default for specific keys
const keys2 = useNormalizedKeys({ 
  preventDefault: ['Tab', 'F5', 'F12'] 
});

// Check if default was prevented
if (keys.lastEvent?.preventedDefault) {
  console.log('Default behavior was prevented');
}
```

### Tap vs Hold Detection

Distinguish between quick key taps and longer holds based on configurable duration thresholds.

```tsx
const keys = useNormalizedKeys({ tapHoldThreshold: 200 });

useEffect(() => {
  if (keys.lastEvent?.type === 'keyup') {
    if (keys.lastEvent.isTap) {
      console.log(`${keys.lastEvent.key} was tapped (${keys.lastEvent.duration}ms)`);
    } else if (keys.lastEvent.isHold) {
      console.log(`${keys.lastEvent.key} was held (${keys.lastEvent.duration}ms)`);
    }
  }
}, [keys.lastEvent]);
```

### Game Input Handling

Handle continuous input for game mechanics like WASD movement with automatic focus management and browser shortcut prevention.

```tsx
function GameComponent() {
  const keys = useNormalizedKeys({
    excludeInputFields: true,
    preventDefault: true, // Prevent all browser shortcuts
  });

  useEffect(() => {
    const handleMovement = () => {
      const movement = {
        x: 0,
        y: 0
      };

      if (keys.isKeyPressed('w') || keys.isKeyPressed('ArrowUp')) movement.y -= 1;
      if (keys.isKeyPressed('s') || keys.isKeyPressed('ArrowDown')) movement.y += 1;
      if (keys.isKeyPressed('a') || keys.isKeyPressed('ArrowLeft')) movement.x -= 1;
      if (keys.isKeyPressed('d') || keys.isKeyPressed('ArrowRight')) movement.x += 1;

      // Apply movement
      updatePlayerPosition(movement);
    };

    const gameLoop = setInterval(handleMovement, 16); // 60 FPS
    return () => clearInterval(gameLoop);
  }, [keys]);

  return (
    <div>
      <p>Use WASD or arrow keys to move</p>
      <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
    </div>
  );
}
```

### Disabled Hook

Temporarily disable keyboard event processing while preserving hook state and configuration.

```tsx
const [gameActive, setGameActive] = useState(true);
const keys = useNormalizedKeys({ enabled: gameActive });

// Hook will not respond to keyboard events when gameActive is false
```

## Context Provider API

### NormalizedKeysProvider

The Context Provider simplifies setup and provides automatic state management for the unified hook architecture. **Required when using helper hooks like `useHoldSequence`.**

#### Signature

```typescript
function NormalizedKeysProvider(props: NormalizedKeysProviderProps): JSX.Element
```

#### Props

```typescript
interface NormalizedKeysProviderProps {
  children: React.ReactNode;
  sequences?: SequenceDefinition[];     // Array of sequence definitions
  debug?: boolean;                      // Enable debug logging
  tapHoldThreshold?: number;            // Tap vs hold threshold in ms
  excludeInputFields?: boolean;         // Ignore input field events
  preventDefault?: boolean | string[];  // Prevent default behavior
}
```

#### Example

```tsx
import { NormalizedKeysProvider, holdSequence } from 'use-normalized-keys';

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('power-attack', 'f', 1000),
        holdSequence('shield', 's', 500)
      ]}
      debug={true}
      tapHoldThreshold={200}
      preventDefault={['Tab', 'F5']}
    >
      <GameComponent />
    </NormalizedKeysProvider>
  );
}
```

## Unified Helper Hook

### useHoldSequence

The all-in-one unified hook that combines progress tracking, smooth 60fps animations, and game events into a single optimized hook.

#### Signature

```typescript
function useHoldSequence(sequenceId: string): UseHoldSequenceResult
```

#### Parameters

- `sequenceId`: `string` - The ID of the hold sequence to track

#### Return Type

```typescript
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
```

#### Key Benefits

- **🚀 60fps Animations**: Uses requestAnimationFrame for perfectly smooth visual effects
- **⚡ Single Hook**: Combines progress tracking, animation, and sequence detection
- **🎯 Real-time Properties**: Progress, timing, animation values, and event flags
- **🎮 Game-Optimized**: Built for responsive game mechanics
- **📊 Complete API**: Everything you need in one optimized hook

#### Example

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function PowerAttackButton() {
  const powerAttack = useHoldSequence('power-attack');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (powerAttack.justStarted) {
      showChargingEffect();
    }
    if (powerAttack.justCompleted) {
      executePowerAttack();
    }
    if (powerAttack.justCancelled) {
      hideChargingEffect();
    }
  }, [powerAttack.justStarted, powerAttack.justCompleted, powerAttack.justCancelled]);
  
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
      <div>Progress: {Math.round(powerAttack.progress)}%</div>
      <div>Time: {powerAttack.remainingTime}ms remaining</div>
      {powerAttack.isReady && <div className="ready">READY!</div>}
      {powerAttack.isCharging && <div>Charging Power Attack...</div>}
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

#### Game Character with Multiple Sequences

```tsx
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
    if (shield.justCancelled) {
      hideShield();
    }
  }, [
    chargeJump.justCompleted, 
    powerAttack.justStarted, 
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

## Helper Functions

### holdSequence

Creates a hold sequence definition for keys that must be held for a specific duration.

#### Signature

```typescript
function holdSequence(
  id: string,
  key: string,
  duration: number,
  options?: {
    name?: string;
    modifiers?: {
      shift?: boolean;
      ctrl?: boolean;
      alt?: boolean;
      meta?: boolean;
    };
  }
): SequenceDefinition
```

#### Example

```tsx
import { holdSequence, useNormalizedKeys } from 'use-normalized-keys';

const sequences = [
  holdSequence('charge-jump', 'Space', 750, { name: 'Charge Jump' }),
  holdSequence('power-attack', 'f', 1000, { 
    name: 'Power Attack',
    modifiers: { ctrl: true }
  })
];

const keys = useNormalizedKeys({ sequences: { sequences } });
```

### comboSequence

Creates a sequential combo definition where keys must be pressed in order.

#### Signature

```typescript
function comboSequence(
  id: string,
  keys: string[],
  options?: {
    name?: string;
    timeout?: number;
    allowOtherKeys?: boolean;
    resetOnMismatch?: boolean;
    caseSensitive?: boolean;
  }
): SequenceDefinition
```

#### Example

```tsx
import { comboSequence } from 'use-normalized-keys';

const combos = [
  comboSequence('konami', ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']),
  comboSequence('hadouken', ['↓', '↘', '→', 'p'], { timeout: 500 })
];
```

### chordSequence

Creates a chord definition where keys must be pressed simultaneously.

#### Signature

```typescript
function chordSequence(
  id: string,
  keys: string[],
  options?: {
    name?: string;
    allowOtherKeys?: boolean;
  }
): SequenceDefinition
```

#### Example

```tsx
import { chordSequence } from 'use-normalized-keys';

const shortcuts = [
  chordSequence('save', ['Control', 's']),
  chordSequence('copy', ['Control', 'c'], { name: 'Copy' })
];
```

### fightingCombo

Creates fighting game style combos using numpad notation.

#### Signature

```typescript
function fightingCombo(
  id: string,
  notation: string,
  options?: {
    name?: string;
    timeout?: number;
    chargeTime?: number;
  }
): SequenceDefinition
```

#### Example

```tsx
import { fightingCombo } from 'use-normalized-keys';

const moves = [
  fightingCombo('hadouken', '236P'),           // Quarter circle forward + punch
  fightingCombo('shoryuken', '623P'),          // Dragon punch motion
  fightingCombo('sonic-boom', '[4]6P')         // Charge back, forward + punch
];
```

### rhythmSequence

Creates a sequence that must be completed within rhythm timing windows.

#### Signature

```typescript
function rhythmSequence(
  id: string,
  pattern: string[],
  bpm: number,
  options?: {
    name?: string;
    tolerance?: number;
  }
): SequenceDefinition
```

#### Example

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

Creates multiple hold sequences with a common pattern.

#### Signature

```typescript
function holdSequences(
  configs: Array<{
    id: string;
    key: string;
    duration: number;
    name?: string;
    modifiers?: {
      shift?: boolean;
      ctrl?: boolean;
      alt?: boolean;
      meta?: boolean;
    };
  }>
): SequenceDefinition[]
```

#### Example

```tsx
import { holdSequences } from 'use-normalized-keys';

const chargeMoves = holdSequences([
  { id: 'light-punch', key: 'j', duration: 200, name: 'Light Punch' },
  { id: 'medium-punch', key: 'j', duration: 500, name: 'Medium Punch' },
  { id: 'heavy-punch', key: 'j', duration: 1000, name: 'Heavy Punch' }
]);
```

### fightingCombo

Creates fighting game style directional combos using numpad notation.

#### Signature

```typescript
function fightingCombo(
  id: string,
  notation: string,
  options?: {
    name?: string;
    timeout?: number;
    chargeTime?: number;
  }
): SequenceDefinition
```

#### Parameters

- `id`: `string` - Unique identifier for the sequence
- `notation`: `string` - Fighting game notation (e.g., "236P" for quarter-circle-forward punch)
- `options`: `object` (optional)
  - `name`: `string` - Human-readable name
  - `timeout`: `number` - Timeout between inputs in milliseconds
  - `chargeTime`: `number` - Hold time for charge moves

#### Notation Guide

- **Directions**: Use numpad notation (1-9) where 5 is neutral
  - 1: ↙ (down-back), 2: ↓ (down), 3: ↘ (down-forward)
  - 4: ← (back), 5: neutral, 6: → (forward)
  - 7: ↖ (up-back), 8: ↑ (up), 9: ↗ (up-forward)
- **Buttons**: P (punch), K (kick), LP/MP/HP (light/medium/heavy punch), LK/MK/HK (light/medium/heavy kick)
- **Charge**: Use brackets like [4]6P for charge moves

#### Example

```tsx
import { fightingCombo } from 'use-normalized-keys';

const moves = [
  fightingCombo('hadouken', '236P'),           // Quarter circle forward + punch
  fightingCombo('shoryuken', '623P'),          // Dragon punch motion
  fightingCombo('sonic-boom', '[4]6P'),        // Charge back, forward + punch
  fightingCombo('spinning-bird', '[2]8K')      // Charge down, up + kick
];
```

### rhythmSequence

Creates a sequence that must be completed within rhythm timing windows.

#### Signature

```typescript
function rhythmSequence(
  id: string,
  pattern: string[],
  bpm: number,
  options?: {
    name?: string;
    tolerance?: number;
  }
): SequenceDefinition
```

#### Parameters

- `id`: `string` - Unique identifier for the sequence
- `pattern`: `string[]` - Array of keys in the rhythm pattern
- `bpm`: `number` - Beats per minute for rhythm timing
- `options`: `object` (optional)
  - `name`: `string` - Human-readable name
  - `tolerance`: `number` - Timing tolerance in milliseconds (default: 25% of beat interval)

#### Example

```tsx
import { rhythmSequence } from 'use-normalized-keys';

const rhythmPatterns = [
  rhythmSequence('dance-move', ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], 120),
  rhythmSequence('beat-match', ['Space', 'Space', 'Enter'], 140, {
    tolerance: 50 // 50ms timing tolerance
  }),
  rhythmSequence('drum-pattern', ['k', 's', 'k', 'h'], 160, {
    name: 'Basic Drum Pattern'
  })
];
```

## Exported Types

The library exports the following TypeScript types for use in your applications:

### Core Types

- `NormalizedKeyState` - The main return type of the useNormalizedKeys hook
- `UseNormalizedKeysOptions` - Configuration options for the hook
- `NormalizedKeyEvent` - Detailed information about keyboard events
- `HoldProgress` - Progress information for hold sequences
- `CurrentHolds` - Map type for active hold sequences

### Sequence Types

- `SequenceDefinition` - Structure for defining key sequences
- `SequenceOptions` - Configuration for sequence detection
- `MatchedSequence` - Information about matched sequences
- `SequenceType` - Union type: 'sequence' | 'chord' | 'hold'
- `SequenceKey` - Key definition within sequences

### Example Type Usage

```typescript
import type {
  NormalizedKeyState,
  UseNormalizedKeysOptions,
  NormalizedKeyEvent,
  SequenceDefinition,
  HoldProgress
} from 'use-normalized-keys';

// Using types in your components
function MyComponent() {
  const options: UseNormalizedKeysOptions = {
    enabled: true,
    tapHoldThreshold: 150
  };
  
  const keys: NormalizedKeyState = useNormalizedKeys(options);
  
  const handleKeyEvent = (event: NormalizedKeyEvent) => {
    console.log(`Key ${event.key} ${event.type}`);
  };
  
  const customSequence: SequenceDefinition = {
    id: 'my-combo',
    keys: ['a', 'b', 'c'],
    type: 'sequence'
  };
  
  return <div>...</div>;
}
```