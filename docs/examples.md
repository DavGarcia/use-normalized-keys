# Examples

Here are some practical examples of using useNormalizedKeys in different scenarios.

## Game Controls

A simple game controller that responds to WASD keys:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function GameController() {
  const keys = useNormalizedKeys();
  
  const movePlayer = () => {
    let dx = 0, dy = 0;
    
    if (keys.isKeyPressed('w')) dy -= 1; // Up
    if (keys.isKeyPressed('s')) dy += 1; // Down  
    if (keys.isKeyPressed('a')) dx -= 1; // Left
    if (keys.isKeyPressed('d')) dx += 1; // Right
    
    return { dx, dy };
  };
  
  const { dx, dy } = movePlayer();
  
  return (
    <div>
      <h3>Game Controller</h3>
      <p>Use WASD to move</p>
      <p>Movement: dx={dx}, dy={dy}</p>
      <div>
        <div>W: {keys.isKeyPressed('w') ? '🔼' : '⬜'}</div>
        <div>
          A: {keys.isKeyPressed('a') ? '◀️' : '⬜'}
          S: {keys.isKeyPressed('s') ? '🔽' : '⬜'}
          D: {keys.isKeyPressed('d') ? '▶️' : '⬜'}
        </div>
      </div>
    </div>
  );
}
```

## Drawing Application

Track modifier keys for drawing tools:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function DrawingCanvas() {
  const keys = useNormalizedKeys();
  
  const getDrawingMode = () => {
    if (keys.isKeyPressed('Shift')) return 'line';
    if (keys.isKeyPressed('Control')) return 'erase';
    if (keys.isKeyPressed('Alt')) return 'eyedropper';
    return 'brush';
  };
  
  const getBrushSize = () => {
    let size = 10;
    if (keys.isKeyPressed('[')) size = Math.max(1, size - 5);
    if (keys.isKeyPressed(']')) size = Math.min(50, size + 5);
    return size;
  };
  
  return (
    <div>
      <h3>Drawing Tools</h3>
      <p>Mode: {getDrawingMode()}</p>
      <p>Brush Size: {getBrushSize()}px</p>
      <ul>
        <li>Shift: Line mode {keys.isKeyPressed('Shift') ? '✓' : ''}</li>
        <li>Ctrl: Erase mode {keys.isKeyPressed('Control') ? '✓' : ''}</li>
        <li>Alt: Eyedropper {keys.isKeyPressed('Alt') ? '✓' : ''}</li>
        <li>[/]: Adjust brush size</li>
      </ul>
    </div>
  );
}
```

## Keyboard Shortcuts

Handle complex keyboard shortcuts:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useEffect } from 'react';

function ShortcutHandler() {
  const keys = useNormalizedKeys();
  
  useEffect(() => {
    // Ctrl+S to save
    if (keys.isKeyPressed('Control') && keys.lastKey === 's') {
      console.log('Save shortcut pressed');
    }
    
    // Ctrl+Z to undo
    if (keys.isKeyPressed('Control') && keys.lastKey === 'z') {
      console.log('Undo shortcut pressed');
    }
    
    // Ctrl+Shift+Z to redo
    if (keys.isKeyPressed('Control') && 
        keys.isKeyPressed('Shift') && 
        keys.lastKey === 'z') {
      console.log('Redo shortcut pressed');
    }
  }, [keys.lastKey, keys.isKeyPressed]);
  
  return (
    <div>
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li>Ctrl+S: Save</li>
        <li>Ctrl+Z: Undo</li>
        <li>Ctrl+Shift+Z: Redo</li>
      </ul>
      <p>Last key: {keys.lastKey}</p>
    </div>
  );
}
```

## Pause/Resume Functionality

Conditionally enable keyboard handling:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useState } from 'react';

function PausableGame() {
  const [isPaused, setIsPaused] = useState(false);
  const keys = useNormalizedKeys({ enabled: !isPaused });
  
  return (
    <div>
      <h3>Pausable Game</h3>
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'Resume (Press R)' : 'Pause (Press P)'}
      </button>
      
      {isPaused ? (
        <p>Game is paused - keyboard input disabled</p>
      ) : (
        <div>
          <p>Game is active</p>
          <p>Last key: {keys.lastKey}</p>
          <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

## Key Logger

Simple key logging for debugging:

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useState, useEffect } from 'react';

function KeyLogger() {
  const keys = useNormalizedKeys();
  const [keyLog, setKeyLog] = useState<string[]>([]);
  
  useEffect(() => {
    if (keys.lastKey) {
      setKeyLog(prev => [
        `${new Date().toLocaleTimeString()}: ${keys.lastKey}`,
        ...prev.slice(0, 9) // Keep last 10 entries
      ]);
    }
  }, [keys.lastKey]);
  
  return (
    <div>
      <h3>Key Logger</h3>
      <p>Currently pressed: {Array.from(keys.pressedKeys).join(', ') || 'None'}</p>
      <h4>Recent Keys:</h4>
      <ul>
        {keyLog.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
```