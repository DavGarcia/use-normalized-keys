# API Reference

## 🚨 Important: Key Naming

Before using any APIs, understand how key names work to avoid common mistakes:

```typescript
// ❌ WRONG - These will NOT work
holdSequence('scroll', ' ', 500)         // Use 'Space' not ' '
comboSequence('navigate', ['↓', '→', 'p'])   // Use 'ArrowDown', 'ArrowRight' not unicode
isKeyPressed('ctrl')                      // Use 'Control' not 'ctrl'

// ✅ CORRECT - These WILL work  
import { Keys } from 'use-normalized-keys';
holdSequence('scroll', Keys.SPACE, 500)    // Type-safe with IntelliSense
comboSequence('navigate', [Keys.ARROW_DOWN, Keys.ARROW_RIGHT, Keys.p])
isKeyPressed(Keys.CONTROL)
```

**📋 [Complete Key Reference →](./key-reference.md)** - See all normalized key names

---

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

### Key Event Processing

Understanding the core event processing model and timing information:

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useEffect } from 'react';

function KeyEventProcessor() {
  const keys = useNormalizedKeys({ tapHoldThreshold: 200 });

  useEffect(() => {
    if (keys.lastEvent?.type === 'keydown') {
      console.log(`Key pressed: ${keys.lastEvent.key}`);
      console.log(`Original: ${keys.lastEvent.originalKey}`);
      console.log(`Code: ${keys.lastEvent.code}`);
      console.log(`Is modifier: ${keys.lastEvent.isModifier}`);
      console.log(`Is numpad: ${keys.lastEvent.isNumpad}`);
    }
    
    if (keys.lastEvent?.type === 'keyup') {
      console.log(`Key released: ${keys.lastEvent.key}`);
      console.log(`Duration: ${keys.lastEvent.duration}ms`);
      console.log(`Was ${keys.lastEvent.isTap ? 'tapped' : 'held'}`);
      console.log(`Default prevented: ${keys.lastEvent.preventedDefault}`);
    }
  }, [keys.lastEvent]);

  return (
    <div>
      <p>Last event type: {keys.lastEvent?.type || 'None'}</p>
      <p>Event timestamp: {keys.lastEvent?.timestamp}</p>
      <p>Was repeat: {keys.lastEvent?.isRepeat ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Modifier Key Detection

Detecting and responding to modifier key combinations for shortcuts and commands:

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function ModifierDetector() {
  const keys = useNormalizedKeys();

  // Standard productivity shortcuts
  const isSave = keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.s);
  const isCopy = keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.c);
  const isPaste = keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.v);
  const isUndo = keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.z);
  
  // Platform-specific shortcuts (Cmd on macOS, Ctrl on Windows/Linux)
  const isNewTab = (keys.activeModifiers.meta || keys.activeModifiers.ctrl) && 
                   keys.isKeyPressed(Keys.t);
  
  // Complex combinations
  const isSelectAll = keys.activeModifiers.ctrl && keys.isKeyPressed(Keys.a);
  const isForceRefresh = keys.activeModifiers.ctrl && keys.activeModifiers.shift && 
                        keys.isKeyPressed(Keys.r);

  return (
    <div>
      <h3>Active Modifiers</h3>
      <p>Ctrl: {keys.activeModifiers.ctrl ? '🟢' : '⚪'}</p>
      <p>Shift: {keys.activeModifiers.shift ? '🟢' : '⚪'}</p>
      <p>Alt: {keys.activeModifiers.alt ? '🟢' : '⚪'}</p>
      <p>Meta: {keys.activeModifiers.meta ? '🟢' : '⚪'}</p>
      <p>Caps Lock: {keys.activeModifiers.caps ? '🟢' : '⚪'}</p>
      
      <h3>Keyboard Shortcuts</h3>
      <p>Save (Ctrl+S): {isSave ? '🟢' : '⚪'}</p>
      <p>Copy (Ctrl+C): {isCopy ? '🟢' : '⚪'}</p>
      <p>Paste (Ctrl+V): {isPaste ? '🟢' : '⚪'}</p>
      <p>New Tab (Ctrl/Cmd+T): {isNewTab ? '🟢' : '⚪'}</p>
      <p>Force Refresh (Ctrl+Shift+R): {isForceRefresh ? '🟢' : '⚪'}</p>
    </div>
  );
}
```

### Real-time Key State

Tracking multiple simultaneous key presses for navigation, drawing tools, and interactive applications:

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useEffect, useState } from 'react';

function NavigationController() {
  const keys = useNormalizedKeys();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    // Calculate movement vector based on pressed keys
    const navigation = { x: 0, y: 0 };
    
    if (keys.isKeyPressed(Keys.ARROW_LEFT) || keys.isKeyPressed(Keys.a)) navigation.x -= 1;
    if (keys.isKeyPressed(Keys.ARROW_RIGHT) || keys.isKeyPressed(Keys.d)) navigation.x += 1;
    if (keys.isKeyPressed(Keys.ARROW_UP) || keys.isKeyPressed(Keys.w)) navigation.y -= 1;
    if (keys.isKeyPressed(Keys.ARROW_DOWN) || keys.isKeyPressed(Keys.s)) navigation.y += 1;
    
    // Speed modifiers
    let currentSpeed = speed;
    if (keys.isKeyPressed(Keys.SHIFT_LEFT) || keys.isKeyPressed(Keys.SHIFT_RIGHT)) {
      currentSpeed *= 2; // Run
    }
    if (keys.isKeyPressed(Keys.CONTROL_LEFT) || keys.isKeyPressed(Keys.CONTROL_RIGHT)) {
      currentSpeed *= 0.5; // Walk slowly
    }
    
    // Apply movement if any keys are pressed
    if (navigation.x !== 0 || navigation.y !== 0) {
      setPosition(prev => ({
        x: prev.x + navigation.x * currentSpeed,
        y: prev.y + navigation.y * currentSpeed
      }));
    }
    
    // Update speed based on space key
    setSpeed(keys.isKeyPressed(Keys.SPACE) ? 3 : 1);
    
  }, [keys.pressedKeys, speed]); // Re-run when any key state changes

  const pressedKeysList = Array.from(keys.pressedKeys);
  const keyCount = pressedKeysList.length;

  return (
    <div>
      <h3>Navigation State</h3>
      <p>Position: ({position.x.toFixed(1)}, {position.y.toFixed(1)})</p>
      <p>Speed: {speed}x</p>
      <p>Keys pressed: {keyCount}</p>
      <p>Active keys: {pressedKeysList.join(', ')}</p>
      
      <h3>Controls</h3>
      <p>Movement: Arrow keys or WASD</p>
      <p>Run: Hold Shift</p>
      <p>Sneak: Hold Ctrl</p>
      <p>Boost: Hold Space</p>
    </div>
  );
}
```

### Sequence Detection

Detect complex key patterns like sequences, chords, and hold patterns for advanced keyboard shortcuts and productivity workflows.

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

const keys = useNormalizedKeys({
  sequences: [
    {
      id: 'vim-escape',
      keys: [Keys.j, Keys.k],
      type: 'sequence'
    },
    {
      id: 'save-document',
      keys: [Keys.CONTROL, Keys.s],
      type: 'chord'
    },
    {
      id: 'scroll-acceleration',
      keys: [{ key: Keys.SPACE, minHoldTime: 500 }],
      type: 'hold'
    },
    {
      id: 'quick-select',
      keys: [Keys.SHIFT, Keys.ARROW_RIGHT],
      type: 'chord'
    }
  ],
  onSequenceMatch: (match) => {
    console.log(`Shortcut ${match.sequenceId} activated!`);
    console.log(`Type: ${match.type}, Duration: ${match.duration}ms`);
  }
});

// Access matched sequences
console.log(keys.sequences?.matches);

// Check current hold progress
if (keys.currentHolds.has('scroll-acceleration')) {
  const holdProgress = keys.currentHolds.get('scroll-acceleration');
  console.log(`Scroll acceleration: ${holdProgress?.progressPercent}%`);
}
```

### Hold Detection

Hold detection fires events when a key is held for a specified duration. Unlike tap/hold detection, hold sequences fire **during** the hold, not on release.

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

const keys = useNormalizedKeys({
  sequences: [
    // Basic hold - fires after 500ms while space is still pressed
    {
      id: 'scroll-boost',
      name: 'Scroll Boost',
      keys: [{ key: Keys.SPACE, minHoldTime: 500 }],
      type: 'hold'
    },
    // Hold with modifiers for text formatting
    {
      id: 'format-text',
      name: 'Format Text',
      keys: [{ 
        key: Keys.f, 
        minHoldTime: 1000,
        modifiers: { shift: true }
      }],
      type: 'hold'
    },
    // Tool activation hold
    {
      id: 'eyedropper-tool',
      name: 'Eyedropper Tool',
      keys: [{ key: Keys.i, minHoldTime: 300 }],
      type: 'hold'
    }
  ],
  onSequenceMatch: (match) => {
    if (match.type === 'hold') {
      console.log(`Hold activated: ${match.sequenceId}`);
      // This fires DURING the hold, after minHoldTime
      
      if (match.sequenceId === 'eyedropper-tool') {
        activateEyedropperMode();
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
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

// Prevent default for all keys
const keys1 = useNormalizedKeys({ preventDefault: true });

// Prevent default for specific keys
const keys2 = useNormalizedKeys({ 
  preventDefault: [Keys.TAB, Keys.F5, Keys.F12, 'Ctrl+S', 'Ctrl+R'] 
});

// Prevent common browser shortcuts for productivity apps
const keys3 = useNormalizedKeys({
  preventDefault: [
    'Ctrl+S',     // Save
    'Ctrl+R',     // Refresh
    'Ctrl+T',     // New tab
    'Ctrl+W',     // Close tab
    Keys.F5,      // Refresh
    Keys.F11,     // Fullscreen
    Keys.F12      // Dev tools
  ]
});

// Check if default was prevented
if (keys.lastEvent?.preventedDefault) {
  console.log('Default behavior was prevented for:', keys.lastEvent.key);
}
```

### Tap vs Hold Detection

Distinguish between quick key taps and longer holds based on configurable duration thresholds.

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useEffect } from 'react';

function TapHoldDetector() {
  const keys = useNormalizedKeys({ tapHoldThreshold: 200 });

  useEffect(() => {
    if (keys.lastEvent?.type === 'keyup') {
      const key = keys.lastEvent.key;
      const duration = keys.lastEvent.duration || 0;
      
      if (keys.lastEvent.isTap) {
        console.log(`${key} was tapped (${duration}ms)`);
        
        // Quick actions on tap
        if (key === Keys.SPACE) {
          jumpAction();
        } else if (key === Keys.ENTER) {
          confirmAction();
        }
      } else if (keys.lastEvent.isHold) {
        console.log(`${key} was held (${duration}ms)`);
        
        // Different actions for held keys
        if (key === Keys.SPACE) {
          chargedJumpAction(duration);
        } else if (key === Keys.ENTER) {
          contextMenuAction();
        }
      }
    }
  }, [keys.lastEvent]);

  return (
    <div>
      <p>Tap threshold: 200ms</p>
      <p>Last action: {keys.lastEvent?.isTap ? 'TAP' : keys.lastEvent?.isHold ? 'HOLD' : 'None'}</p>
      <p>Duration: {keys.lastEvent?.duration || 0}ms</p>
    </div>
  );
}
```

### Continuous Input Handling

Handle continuous keyboard input for smooth navigation and editing with automatic focus management and browser shortcut prevention.

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useEffect } from 'react';

function TextEditorComponent() {
  const keys = useNormalizedKeys({
    excludeInputFields: true,
    preventDefault: [Keys.TAB, Keys.F5], // Prevent specific shortcuts
  });

  useEffect(() => {
    const handleNavigation = () => {
      const navigation = {
        horizontal: 0,
        vertical: 0
      };

      // Cursor navigation using Keys constants
      if (keys.isKeyPressed(Keys.ARROW_UP)) navigation.vertical -= 1;
      if (keys.isKeyPressed(Keys.ARROW_DOWN)) navigation.vertical += 1;
      if (keys.isKeyPressed(Keys.ARROW_LEFT)) navigation.horizontal -= 1;
      if (keys.isKeyPressed(Keys.ARROW_RIGHT)) navigation.horizontal += 1;

      // Alternative WASD navigation
      if (keys.isKeyPressed(Keys.w)) navigation.vertical -= 1;
      if (keys.isKeyPressed(Keys.s)) navigation.vertical += 1;
      if (keys.isKeyPressed(Keys.a)) navigation.horizontal -= 1;
      if (keys.isKeyPressed(Keys.d)) navigation.horizontal += 1;

      // Speed modifiers
      let speed = 1;
      if (keys.isKeyPressed(Keys.SHIFT_LEFT) || keys.isKeyPressed(Keys.SHIFT_RIGHT)) {
        speed = 2; // Fast navigation
      }
      if (keys.isKeyPressed(Keys.CONTROL_LEFT) || keys.isKeyPressed(Keys.CONTROL_RIGHT)) {
        speed = 0.5; // Precise navigation
      }

      // Apply cursor movement
      updateCursorPosition({
        x: navigation.horizontal * speed,
        y: navigation.vertical * speed
      });
    };

    const editorLoop = setInterval(handleNavigation, 16); // 60 FPS
    return () => clearInterval(editorLoop);
  }, [keys]);

  return (
    <div>
      <p>Use arrow keys or WASD to navigate</p>
      <p>Hold Shift to move faster, Ctrl for precision</p>
      <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
    </div>
  );
}
```

### Disabled Hook

Temporarily disable keyboard event processing while preserving hook state and configuration.

```tsx
const [editorActive, setEditorActive] = useState(true);
const keys = useNormalizedKeys({ enabled: editorActive });

// Hook will not respond to keyboard events when editorActive is false
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
import { NormalizedKeysProvider, holdSequence, Keys } from 'use-normalized-keys';

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', Keys.SPACE, 1000),
        holdSequence('pan-mode', Keys.h, 500)
      ]}
      debug={true}
      tapHoldThreshold={200}
      preventDefault={[Keys.TAB, Keys.F5]}
    >
      <DrawingToolsComponent />
    </NormalizedKeysProvider>
  );
}
```

## Unified Helper Hook

### useHoldSequence

The all-in-one unified hook that combines progress tracking, smooth 60fps animations, and interaction events into a single optimized hook.

#### Signature

```typescript
function useHoldSequence(sequenceId: string): UseHoldSequenceResult
```

#### Parameters

- `sequenceId`: `string` - The ID of the hold sequence to track

#### Return Type

```typescript
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
  
  // Event Flags 
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
- **🎨 Interface-Optimized**: Built for responsive drawing tools and professional interfaces
- **📊 Complete API**: Everything you need in one optimized hook

#### Example

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function BrushPressureIndicator() {
  const brushPressure = useHoldSequence('brush-pressure');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (brushPressure.justStarted) {
      showPressureFeedback();
    }
    if (brushPressure.justCompleted) {
      applyMaximumPressure();
    }
    if (brushPressure.justCancelled) {
      resetBrushPressure();
    }
  }, [brushPressure.justStarted, brushPressure.justCompleted, brushPressure.justCancelled]);
  
  return (
    <div 
      className="pressure-indicator"
      style={{
        transform: `scale(${brushPressure.scale})`,
        opacity: brushPressure.opacity,
        boxShadow: brushPressure.glow > 0 ? `0 0 ${brushPressure.glow * 20}px #3b82f6` : 'none',
        marginLeft: `${brushPressure.shake}px`
      }}
    >
      <div 
        className="progress-bar"
        style={{ width: `${brushPressure.progress}%` }}
      />
      <div>Pressure: {Math.round(brushPressure.progress)}%</div>
      <div>Time: {brushPressure.remainingTime}ms remaining</div>
      <div>Brush Size: {Math.round(10 + brushPressure.progress / 10)}px</div>
      {brushPressure.isReady && <div className="ready">MAX PRESSURE!</div>}
      {brushPressure.isCharging && <div>Building pressure...</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', Keys.SPACE, 1000, { name: 'Brush Pressure' })
      ]}
    >
      <BrushPressureIndicator />
    </NormalizedKeysProvider>
  );
}
```

#### Drawing Tools with Multiple Sequences

```tsx
function DrawingToolInterface() {
  const brushPressure = useHoldSequence('brush-pressure');
  const panMode = useHoldSequence('pan-mode');
  const eyedropper = useHoldSequence('eyedropper');
  
  // Trigger actions on sequence events
  useEffect(() => {
    if (brushPressure.justCompleted) {
      applyMaximumBrushPressure();
    }
    if (panMode.justStarted) {
      activatePanMode();
    }
    if (eyedropper.justCancelled) {
      deactivateEyedropper();
    }
  }, [
    brushPressure.justCompleted, 
    panMode.justStarted, 
    eyedropper.justCancelled
  ]);
  
  return (
    <div className="drawing-interface">
      <div className="tools">
        <div className="tool brush-pressure">
          <div>Brush Pressure: {Math.round(brushPressure.progress)}%</div>
          <div>Size: {Math.round(10 + brushPressure.progress / 10)}px</div>
          {brushPressure.isCharging && <div>Hold Space to build pressure...</div>}
        </div>
        
        <div className="tool pan-mode">
          <div>Pan Mode: {Math.round(panMode.progress)}%</div>
          {panMode.isReady && <div className="ready">PANNING ACTIVE!</div>}
        </div>
        
        <div className="tool eyedropper">
          <div>Eyedropper: {eyedropper.isHolding ? 'SAMPLING' : 'Ready'}</div>
          <div>Precision: {eyedropper.elapsedTime}ms</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', Keys.SPACE, 750, { name: 'Brush Pressure' }),
        holdSequence('pan-mode', Keys.h, 1000, { name: 'Pan Mode' }),
        holdSequence('eyedropper', Keys.i, 500, { name: 'Eyedropper' })
      ]}
    >
      <DrawingToolInterface />
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
import { holdSequence, useNormalizedKeys, Keys } from 'use-normalized-keys';

const sequences = [
  holdSequence('scroll-boost', Keys.SPACE, 750, { name: 'Scroll Boost' }),
  holdSequence('format-text', Keys.f, 1000, { 
    name: 'Format Text',
    modifiers: { ctrl: true }
  })
];

const keys = useNormalizedKeys({ sequences });
```

### comboSequence

Creates a sequential key sequence definition where keys must be pressed in order.

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
import { comboSequence, Keys, CommonSequences } from 'use-normalized-keys';

const sequences = [
  comboSequence('vim-escape', [Keys.j, Keys.k], { timeout: 300, name: 'Vim Escape' }),
  // ✅ Use proper normalized key names, not unicode arrows
  comboSequence('emoji-shortcut', [Keys.COLON, Keys.p, Keys.a, Keys.r, Keys.t, Keys.y, Keys.COLON], { timeout: 1000 }),
  // 💡 Or use pre-defined sequences for common shortcuts
  comboSequence('quick-format', [...CommonSequences.FORMAT_SHORTCUT, Keys.f], { timeout: 500 })
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
import { chordSequence, Keys } from 'use-normalized-keys';

const shortcuts = [
  chordSequence('save', [Keys.CONTROL, Keys.s]),
  chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy' })
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
import { holdSequences, Keys } from 'use-normalized-keys';

const chargeMoves = holdSequences([
  { id: 'light-punch', key: Keys.j, duration: 200, name: 'Light Punch' },
  { id: 'medium-punch', key: Keys.j, duration: 500, name: 'Medium Punch' },
  { id: 'heavy-punch', key: Keys.j, duration: 1000, name: 'Heavy Punch' }
]);
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