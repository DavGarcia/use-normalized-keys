# Examples

Collection of practical examples showing how to use useNormalizedKeys in various scenarios with all the latest features.

## Unified Hook API with 60fps Animations

The following examples showcase the unified `useHoldSequence` hook with Context Provider to provide key info through a common context and smooth 60fps animations.

### Brush Pressure with Smooth Visual Effects

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function BrushPressureExample() {
  const brushPressure = useHoldSequence('brush-pressure');
  
  // Trigger drawing actions
  useEffect(() => {
    if (brushPressure.justStarted) {
      console.log('Start applying brush pressure!');
    }
    if (brushPressure.justCompleted) {
      console.log('Maximum brush pressure applied!');
    }
    if (brushPressure.justCancelled) {
      console.log('Brush pressure cancelled');
    }
  }, [brushPressure.justStarted, brushPressure.justCompleted, brushPressure.justCancelled]);
  
  return (
    <div 
      className="brush-pressure-indicator"
      style={{
        transform: `scale(${brushPressure.scale})`,
        opacity: brushPressure.opacity,
        boxShadow: brushPressure.glow > 0 ? `0 0 ${brushPressure.glow * 30}px #3b82f6` : 'none',
        marginLeft: `${brushPressure.shake}px`,
        padding: '20px',
        borderRadius: '10px',
        background: brushPressure.isReady ? '#3b82f6' : '#f8fafc',
        color: brushPressure.isReady ? 'white' : '#1e293b',
        transition: 'background-color 0.3s'
      }}
    >
      <h3>Brush Pressure (Hold Space)</h3>
      <div 
        className="progress-bar"
        style={{
          width: '200px',
          height: '20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: `${brushPressure.progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, #4CAF50 0%, #3b82f6 100%)`,
          transition: 'none' // RAF handles animations!
        }} />
      </div>
      <div>Pressure: {Math.round(brushPressure.progress)}%</div>
      <div>Remaining: {brushPressure.remainingTime}ms</div>
      <div>Brush Size: {Math.round(10 + brushPressure.progress / 10)}px</div>
      {brushPressure.isReady && <div className="ready-indicator">🎨 MAXIMUM PRESSURE!</div>}
      {brushPressure.isCharging && <div>🎨 Building pressure...</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('brush-pressure', Keys.SPACE, 1000, { name: 'Brush Pressure' })
      ]}
      preventDefault={[Keys.F5, Keys.TAB]} // Prevent specific browser shortcuts
    >
      <BrushPressureExample />
    </NormalizedKeysProvider>
  );
}
```

### Multi-Tool Drawing Interface

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect, useState } from 'react';

function DrawingTools() {
  const [toolActions, setToolActions] = useState<string[]>([]);
  
  const brushPressure = useHoldSequence('brush-pressure');
  const eraseStrength = useHoldSequence('erase-strength');
  const panMode = useHoldSequence('pan-mode');
  const eyedropper = useHoldSequence('eyedropper');
  
  // Trigger tool actions when completed
  useEffect(() => {
    if (brushPressure.justCompleted) {
      setToolActions(prev => [...prev, `🎨 Brush at maximum pressure applied!`]);
    }
    if (eraseStrength.justCompleted) {
      setToolActions(prev => [...prev, `🧽 Strong eraser activated!`]);
    }
    if (panMode.justCompleted) {
      setToolActions(prev => [...prev, `✋ Pan mode activated for ${panMode.elapsedTime}ms`]);
    }
    if (eyedropper.justCompleted) {
      setToolActions(prev => [...prev, `💧 Color sampled with precision!`]);
    }
  }, [
    brushPressure.justCompleted, 
    eraseStrength.justCompleted, 
    panMode.justCompleted, 
    eyedropper.justCompleted
  ]);
  
  return (
    <div className="tools-panel">
      <h2>🎨 Drawing Tools Interface</h2>
      
      <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>        
        <div className="tool" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${brushPressure.scale})`,
          opacity: brushPressure.opacity 
        }}>
          <h3>🎨 Brush Pressure (Space)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${brushPressure.progress}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '7px'
            }} />
          </div>
          <div>Size: {Math.round(5 + brushPressure.progress / 10)}px</div>
          <div>Pressure: {Math.round(brushPressure.progress)}%</div>
          {brushPressure.isReady && <div>🎨 MAX PRESSURE!</div>}
        </div>
        
        <div className="tool" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${eraseStrength.scale})`,
          opacity: eraseStrength.opacity,
          marginLeft: `${eraseStrength.shake}px`
        }}>
          <h3>🧽 Eraser (E)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${eraseStrength.progress}%`,
              height: '100%',
              backgroundColor: '#ef4444',
              borderRadius: '7px'
            }} />
          </div>
          <div>Strength: {Math.round(eraseStrength.progress)}%</div>
          <div>Remaining: {eraseStrength.remainingTime}ms</div>
          {eraseStrength.isReady && <div>🧽 STRONG ERASE!</div>}
        </div>
        
        <div className="tool" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${panMode.scale})`,
          opacity: panMode.opacity 
        }}>
          <h3>✋ Pan Mode (H)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${panMode.progress}%`,
              height: '100%',
              backgroundColor: '#10b981',
              borderRadius: '7px'
            }} />
          </div>
          <div>{panMode.isHolding ? 'PANNING' : 'Ready'} - {panMode.elapsedTime}ms</div>
        </div>
        
        <div className="tool" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${eyedropper.scale})`,
          opacity: eyedropper.opacity 
        }}>
          <h3>💧 Eyedropper (I)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${eyedropper.progress}%`,
              height: '100%',
              backgroundColor: '#8b5cf6',
              borderRadius: '7px'
            }} />
          </div>
          <div>Precision: {Math.round(eyedropper.progress)}%</div>
          <div>Remaining: {eyedropper.remainingTime}ms</div>
          {eyedropper.isReady && <div>💧 PRECISE SAMPLE!</div>}
        </div>
      </div>
      
      <div className="action-log" style={{ marginTop: '20px' }}>
        <h3>Tool Actions:</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '10px', backgroundColor: '#f5f5f5' }}>
          {toolActions.slice(-5).map((action, i) => (
            <div key={i}>{action}</div>
          ))}
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
        holdSequence('erase-strength', Keys.e, 1200, { name: 'Eraser Strength' }),
        holdSequence('pan-mode', Keys.h, 500, { name: 'Pan Mode' }),
        holdSequence('eyedropper', Keys.i, 800, { name: 'Eyedropper Precision' })
      ]}
      debug={false}
      tapHoldThreshold={150}
    >
      <DrawingTools />
    </NormalizedKeysProvider>
  );
}
```

---

## Direct Hook Usage

For advanced use cases that need direct control over the keyboard state, you can use `useNormalizedKeys` directly.

### Basic Key Detection

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useEffect } from 'react';

function BasicKeyDetection() {
  const keys = useNormalizedKeys();
  
  // React to keyboard events
  useEffect(() => {
    if (keys.lastEvent?.type === 'keyup') {
      console.log(`Released: ${keys.lastEvent.key} (${keys.lastEvent.duration}ms)`);
    }
  }, [keys.lastEvent]);
  
  return (
    <div>
      <h2>Basic Key Detection</h2>
      <p>Last key: {keys.lastEvent?.key || 'None'}</p>
      <p>Pressed keys: {Array.from(keys.pressedKeys).join(', ') || 'None'}</p>
      <p>Space pressed: {keys.isKeyPressed(Keys.SPACE) ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Productivity Shortcuts Detection

```tsx
import { useNormalizedKeys, comboSequence, chordSequence, Keys } from 'use-normalized-keys';

function ProductivityShortcuts() {
  const keys = useNormalizedKeys({
    sequences: [
      comboSequence('vim-escape', [Keys.j, Keys.k], { timeout: 300 }),
      chordSequence('save', [Keys.CONTROL, Keys.s]),
      chordSequence('copy', [Keys.CONTROL, Keys.c]),
      chordSequence('paste', [Keys.CONTROL, Keys.v]),
      chordSequence('undo', [Keys.CONTROL, Keys.z])
    ]
  });
  
  return (
    <div>
      <h2>Productivity Shortcuts</h2>
      <p>Try: Vim escape (jk), Ctrl+S, Ctrl+C, Ctrl+V, or Ctrl+Z</p>
      <p>Detected shortcuts: {keys.sequences?.matches.length || 0}</p>
      <div>
        <h3>Available Shortcuts:</h3>
        <ul>
          <li>jk - Vim-style escape sequence</li>
          <li>Ctrl+S - Save document</li>
          <li>Ctrl+C - Copy selection</li>
          <li>Ctrl+V - Paste content</li>
          <li>Ctrl+Z - Undo action</li>
        </ul>
      </div>
    </div>
  );
}
```

## Hold Detection for Progressive Actions

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useState, useEffect } from 'react';

function TextEditorHoldExample() {
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [editorActions, setEditorActions] = useState<string[]>([]);
  
  const keys = useNormalizedKeys({
    sequences: [
      {
        id: 'slow-scroll',
        name: 'Slow Scroll',
        keys: [{ key: Keys.SPACE, minHoldTime: 300 }],
        type: 'hold'
      },
      {
        id: 'medium-scroll',
        name: 'Medium Scroll',
        keys: [{ key: Keys.SPACE, minHoldTime: 700 }],
        type: 'hold'
      },
      {
        id: 'fast-scroll',
        name: 'Fast Scroll',
        keys: [{ key: Keys.SPACE, minHoldTime: 1200 }],
        type: 'hold'
      },
      {
        id: 'format-selection',
        name: 'Format Selection',
        keys: [{ 
          key: Keys.f, 
          minHoldTime: 800,
          modifiers: { shift: true }
        }],
        type: 'hold'
      }
    ],
    onSequenceMatch: (match) => {
      if (match.type === 'hold') {
        switch(match.sequenceId) {
          case 'slow-scroll':
            setScrollSpeed(1);
            break;
          case 'medium-scroll':
            setScrollSpeed(2);
            break;
          case 'fast-scroll':
            setScrollSpeed(3);
            break;
          case 'format-selection':
            setEditorActions(prev => [...prev, `✨ Text formatted! ${new Date().toLocaleTimeString()}`]);
            break;
        }
      }
    }
    }
  });
  
  // Reset scroll speed on space release
  useEffect(() => {
    if (keys.lastEvent?.type === 'keyup' && keys.lastEvent.key === Keys.SPACE) {
      if (scrollSpeed > 0) {
        setEditorActions(prev => [...prev, `📜 Scrolled at speed level ${scrollSpeed}!`]);
        setScrollSpeed(0);
      }
    }
  }, [keys.lastEvent, scrollSpeed]);
  
  return (
    <div>
      <h2>Text Editor Hold Detection</h2>
      
      <div>
        <h3>Controls:</h3>
        <ul>
          <li>Hold SPACE to scroll faster (300ms / 700ms / 1200ms)</li>
          <li>Hold SHIFT+F to format selection (800ms)</li>
        </ul>
      </div>
      
      <div>
        <h3>Scroll Speed: {scrollSpeed}/3</h3>
        <div style={{width: '200px', height: '20px', backgroundColor: '#ddd', borderRadius: '10px'}}>
          <div style={{
            width: `${(scrollSpeed / 3) * 100}%`,
            height: '100%',
            backgroundColor: scrollSpeed === 3 ? '#3b82f6' : scrollSpeed === 2 ? '#10b981' : '#84cc16',
            borderRadius: '10px',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
          {scrollSpeed === 0 && 'Normal speed'}
          {scrollSpeed === 1 && 'Slow scroll active'}
          {scrollSpeed === 2 && 'Medium scroll active'}
          {scrollSpeed === 3 && 'Fast scroll active'}
        </div>
      </div>
      
      <div>
        <h3>Editor Action Log:</h3>
        {editorActions.slice(-5).map((action, i) => (
          <p key={i} style={{ fontFamily: 'monospace' }}>📝 {action}</p>
        ))}
      </div>
    </div>
  );
}
```

## preventDefault API & Browser Shortcut Blocking

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useState } from 'react';

function PreventDefaultExample() {
  const [mode, setMode] = useState<'none' | 'specific' | 'all'>('none');
  
  const keys = useNormalizedKeys({
    preventDefault: mode === 'all' ? true : 
                   mode === 'specific' ? [Keys.F5, Keys.F12, Keys.TAB] : 
                   false
  });
  
  return (
    <div>
      <h2>preventDefault API</h2>
      
      <div>
        <h3>Prevention Mode:</h3>
        <button onClick={() => setMode('none')} style={{backgroundColor: mode === 'none' ? '#4CAF50' : ''}}>
          None
        </button>
        <button onClick={() => setMode('specific')} style={{backgroundColor: mode === 'specific' ? '#4CAF50' : ''}}>
          Specific Keys (F5, F12, Tab)
        </button>
        <button onClick={() => setMode('all')} style={{backgroundColor: mode === 'all' ? '#4CAF50' : ''}}>
          All Keys
        </button>
      </div>
      
      <div>
        <h3>Test these shortcuts:</h3>
        <ul>
          <li>F5 - Refresh page (try with different modes)</li>
          <li>F12 - Developer tools</li>
          <li>Tab - Tab navigation</li>
          <li>Ctrl+S - Save page</li>
        </ul>
      </div>
      
      <p>Last prevented: {keys.lastEvent?.preventedDefault ? `${keys.lastEvent.key} ✓` : 'None'}</p>
      <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
    </div>
  );
}
```

## Tap vs Hold Detection

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useState, useEffect } from 'react';

function TapHoldExample() {
  const [threshold, setThreshold] = useState(200);
  const [events, setEvents] = useState<string[]>([]);
  
  const keys = useNormalizedKeys({
    tapHoldThreshold: threshold,
    debug: false
  });
  
  // Track tap/hold events
  useEffect(() => {
    if (keys.lastEvent?.type === 'keyup' && (keys.lastEvent.isTap || keys.lastEvent.isHold)) {
      const eventType = keys.lastEvent.isTap ? 'TAP' : 'HOLD';
      const newEvent = `${eventType}: ${keys.lastEvent.key} (${keys.lastEvent.duration}ms)`;
      setEvents(prev => [...prev.slice(-4), newEvent]); // Keep last 5 events
    }
  }, [keys.lastEvent]);
  
  return (
    <div>
      <h2>Tap vs Hold Detection</h2>
      
      <div>
        <label>
          Threshold: {threshold}ms
          <input 
            type="range" 
            min="50" 
            max="1000" 
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </label>
      </div>
      
      <div>
        <h3>Try tapping or holding keys:</h3>
        <p>Press and release keys quickly for taps, hold them for holds</p>
        <p>Current: {keys.lastEvent?.key} - {keys.lastEvent?.duration}ms</p>
      </div>
      
      <div>
        <h3>Recent Events:</h3>
        {events.map((event, i) => (
          <p key={i} style={{fontFamily: 'monospace'}}>{event}</p>
        ))}
      </div>
    </div>
  );
}
```

## Cross-Platform Compatibility Demo

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function PlatformDemo() {
  const keys = useNormalizedKeys({ debug: true });
  
  const platform = navigator.platform;
  const isWindows = platform.startsWith('Win');
  const isMac = platform.startsWith('Mac');
  
  return (
    <div>
      <h2>Cross-Platform Compatibility</h2>
      
      <div>
        <h3>Detected Platform: {platform}</h3>
        <p>Windows: {isWindows ? '✓' : '✗'}</p>
        <p>macOS: {isMac ? '✓' : '✗'}</p>
      </div>
      
      <div>
        <h3>Platform-Specific Features:</h3>
        {isWindows && (
          <div>
            <h4>Windows Features:</h4>
            <p>✓ Shift+Numpad phantom event suppression</p>
            <p>Try: Hold Shift and press numpad keys (1,2,3)</p>
          </div>
        )}
        
        {isMac && (
          <div>
            <h4>macOS Features:</h4>
            <p>✓ Meta key timeout handling</p>
            <p>Try: Hold Cmd key for extended periods</p>
          </div>
        )}
        
        <h4>Numpad Detection:</h4>
        <p>NumLock: {keys.activeModifiers.numLock ? '🟢 On' : '🔴 Off'}</p>
        {keys.lastEvent?.numpadInfo && (
          <div>
            <p>Last numpad key: {keys.lastEvent.key}</p>
            <p>Mode: {keys.lastEvent.numpadInfo.activeMode}</p>
            <p>Digit: {keys.lastEvent.numpadInfo.digit}</p>
            <p>Navigation: {keys.lastEvent.numpadInfo.navigation}</p>
          </div>
        )}
      </div>
      
      <div>
        <h3>Current State:</h3>
        <p>Keys: {Array.from(keys.pressedKeys).join(', ')}</p>
        <p>Last event: {keys.lastEvent?.key} ({keys.lastEvent?.type})</p>
      </div>
    </div>
  );
}
```

## Complete Text Editor with All Features

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useState, useEffect, useRef } from 'react';

// Type definitions for better TypeScript support
interface CursorPosition { line: number; column: number; }
interface TextSelection { start: CursorPosition; end: CursorPosition; }
interface EditorAction { type: string; timestamp: number; id: number; }
interface EditorState {
  content: string[];
  cursor: CursorPosition;
  selection: TextSelection | null;
  actions: EditorAction[];
  mode: 'normal' | 'insert' | 'select';
  vimMode: boolean;
}

export default function AdvancedTextEditor() {
  const [editorState, setEditorState] = useState<EditorState>({
    content: ['Welcome to the advanced text editor!', 'Try keyboard shortcuts:', '- Ctrl+S to save', '- Ctrl+A to select all', '- Hold Space for scroll mode'],
    cursor: { line: 0, column: 0 },
    selection: null,
    actions: [],
    mode: 'normal',
    vimMode: false
  });
  
  const keys = useNormalizedKeys({
    sequences: [
      {
        id: 'vim-escape',
        keys: [Keys.j, Keys.k],
        type: 'sequence'
      },
      {
        id: 'vim-mode',
        keys: [Keys.v, Keys.i, Keys.m],
        type: 'sequence'
      }
    ],
    onSequenceMatch: (match) => {
      if (match.sequenceId === 'vim-escape' && editorState.mode === 'insert') {
        setEditorState(prev => ({ 
          ...prev, 
          mode: 'normal' 
        }));
      }
      if (match.sequenceId === 'vim-mode') {
        setEditorState(prev => ({ 
          ...prev, 
          vimMode: !prev.vimMode,
          actions: [...prev.actions, { type: `VIM mode ${!prev.vimMode ? 'enabled' : 'disabled'}`, timestamp: Date.now(), id: Date.now() }]
        }));
      }
    },
    preventDefault: [Keys.F5, Keys.TAB], // Block specific browser shortcuts
    tapHoldThreshold: 150,
    debug: false
  });
  
  // Editor update loop using requestAnimationFrame for smooth cursor movement
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const editorLoop = (timestamp: number) => {
      // Throttle to ~60 FPS
      if (timestamp - lastFrameTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(editorLoop);
        return;
      }
      lastFrameTimeRef.current = timestamp;
      
      setEditorState(prev => {
        let newState = { ...prev };
        const cursor = { ...prev.cursor };
        let actions = prev.actions.slice();
        
        // Cursor movement with different speeds
        const baseSpeed = 1;
        const isAccelerated = keys.isKeyPressed(Keys.SHIFT);
        const moveSpeed = isAccelerated ? baseSpeed * 3 : baseSpeed;
        
        // Only process movement if not in insert mode or vim mode allows it
        if (prev.mode === 'normal' || !prev.vimMode) {
          // Vertical movement
          if (keys.isKeyPressed(Keys.ARROW_UP) && cursor.line > 0) {
            cursor.line = Math.max(0, cursor.line - moveSpeed);
            cursor.column = Math.min(cursor.column, newState.content[cursor.line]?.length || 0);
          }
          if (keys.isKeyPressed(Keys.ARROW_DOWN) && cursor.line < newState.content.length - 1) {
            cursor.line = Math.min(newState.content.length - 1, cursor.line + moveSpeed);
            cursor.column = Math.min(cursor.column, newState.content[cursor.line]?.length || 0);
          }
          
          // Horizontal movement
          if (keys.isKeyPressed(Keys.ARROW_LEFT) && cursor.column > 0) {
            cursor.column = Math.max(0, cursor.column - moveSpeed);
          }
          if (keys.isKeyPressed(Keys.ARROW_RIGHT)) {
            const lineLength = newState.content[cursor.line]?.length || 0;
            cursor.column = Math.min(lineLength, cursor.column + moveSpeed);
          }
        }
        
        // Scroll mode with space (tap vs hold for different behaviors)
        if (keys.isKeyPressed(Keys.SPACE)) {
          const scrollAction = keys.lastEvent?.isHold ? 'Fast scroll' : 'Page scroll';
          const scrollSpeed = keys.lastEvent?.isHold ? 3 : 1;
          
          // Add scroll indicator to actions if space just pressed
          if (keys.lastEvent?.type === 'keydown' && keys.lastEvent.key === Keys.SPACE) {
            actions = actions.concat({
              type: `${scrollAction} activated`,
              timestamp: Date.now(),
              id: Date.now()
            });
          }
        }
        
        return { ...newState, cursor, actions };
      });
      
      animationFrameRef.current = requestAnimationFrame(editorLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(editorLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [keys.isKeyPressed, keys.lastEvent]); // Note: keys.isKeyPressed is stable
  
  // Handle text editing shortcuts
  useEffect(() => {
    if (keys.lastEvent?.type === 'keydown') {
      const isCtrl = keys.activeModifiers.ctrl;
      const key = keys.lastEvent.key;
      
      if (isCtrl && key === Keys.s) {
        setEditorState(prev => ({
          ...prev,
          actions: [...prev.actions, { type: 'Document saved', timestamp: Date.now(), id: Date.now() }]
        }));
      }
      
      if (isCtrl && key === Keys.a) {
        setEditorState(prev => ({
          ...prev,
          selection: {
            start: { line: 0, column: 0 },
            end: { line: prev.content.length - 1, column: prev.content[prev.content.length - 1]?.length || 0 }
          },
          actions: [...prev.actions, { type: 'Select all', timestamp: Date.now(), id: Date.now() }]
        }));
      }
      
      if (key === Keys.ESCAPE) {
        setEditorState(prev => ({
          ...prev,
          mode: prev.vimMode ? 'normal' : prev.mode,
          selection: null,
          actions: [...prev.actions, { type: 'Escape pressed', timestamp: Date.now(), id: Date.now() }]
        }));
      }
    }
  }, [keys.lastEvent, keys.activeModifiers]);
  
  return (
    <div>
      <h2>Advanced Text Editor</h2>
      
      <div 
        tabIndex={0}
        autoFocus
        style={{ 
          position: 'relative', 
          width: 600, 
          height: 400, 
          border: '2px solid #333',
          backgroundColor: editorState.vimMode ? '#1a1a1a' : '#ffffff',
          color: editorState.vimMode ? '#00ff00' : '#000000',
          fontFamily: 'monospace',
          fontSize: '14px',
          outline: 'none',
          overflow: 'hidden'
        }}
      >
        {/* Text content */}
        <div style={{ padding: '10px', lineHeight: '1.4' }}>
          {editorState.content.map((line, lineIndex) => (
            <div key={lineIndex} style={{ position: 'relative', minHeight: '1.4em' }}>
              <span style={{ color: '#666', marginRight: '10px', fontSize: '12px' }}>
                {(lineIndex + 1).toString().padStart(2, '0')}
              </span>
              {line}
              {/* Cursor */}
              {editorState.cursor.line === lineIndex && (
                <span
                  style={{
                    position: 'absolute',
                    left: `${80 + editorState.cursor.column * 8.5}px`,
                    width: '2px',
                    height: '1.4em',
                    backgroundColor: editorState.vimMode ? '#00ff00' : '#000000',
                    animation: 'blink 1s infinite'
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Selection overlay */}
        {editorState.selection && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            right: '10px',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            pointerEvents: 'none'
          }}>
            Selection active
          </div>
        )}
        
        {/* Status line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30px',
          backgroundColor: editorState.vimMode ? '#333' : '#f0f0f0',
          color: editorState.vimMode ? '#00ff00' : '#333',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          fontSize: '12px',
          borderTop: '1px solid #ccc'
        }}>
          <span>Line: {editorState.cursor.line + 1}, Col: {editorState.cursor.column}</span>
          <span style={{ marginLeft: '20px' }}>Mode: {editorState.mode.toUpperCase()}</span>
          {editorState.vimMode && <span style={{ marginLeft: '20px' }}>VIM MODE</span>}
          <span style={{ marginLeft: 'auto' }}>
            {keys.isKeyPressed(Keys.SHIFT) && 'SHIFT '}
            {keys.isKeyPressed(Keys.SPACE) && (keys.lastEvent?.isHold ? 'FAST SCROLL ' : 'SCROLL ')}
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <p>Mode: {editorState.mode} {editorState.vimMode && '(VIM enabled)'}</p>
        <p>Cursor: Line {editorState.cursor.line + 1}, Column {editorState.cursor.column + 1}</p>
        <p>Keyboard Shortcuts:</p>
        <ul style={{ fontSize: '14px' }}>
          <li>Arrow keys: Navigate (Hold Shift for fast movement)</li>
          <li>Space: Scroll mode (Hold for fast scroll)</li>
          <li>Ctrl+S: Save document</li>
          <li>Ctrl+A: Select all</li>
          <li>Escape: Exit modes/clear selection</li>
          <li>Type "jk" quickly in insert mode to escape (VIM)</li>
          <li>Type "vim" to toggle VIM mode</li>
        </ul>
        <p>Active keys: {Array.from(keys.pressedKeys).join(', ') || 'None'}</p>
        <p>Sequences detected: {keys.sequences?.matches.length || 0}</p>
        {keys.lastEvent && (
          <p style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            Last event: {keys.lastEvent.key} 
            {keys.lastEvent.isTap && ' (tap)'} 
            {keys.lastEvent.isHold && ' (hold)'} 
            - {keys.lastEvent.duration}ms
          </p>
        )}
        
        <div>
          <h3>Recent Actions:</h3>
          <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
            {editorState.actions.slice(-5).map((action, i) => (
              <p key={action.id}>📝 {action.type} - {new Date(action.timestamp).toLocaleTimeString()}</p>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
```

