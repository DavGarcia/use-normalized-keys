# Examples

Collection of practical examples showing how to use useNormalizedKeys in various scenarios with all the latest features.

## Basic Key Detection with Rich Event Data

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';

function BasicExample() {
  const keys = useNormalizedKeys();
  
  return (
    <div>
      <h2>Basic Key Detection</h2>
      <p>Last key: {keys.lastEvent?.key || 'None'}</p>
      <p>Duration: {keys.lastEvent?.duration ?? 'N/A'}ms</p>
      <p>Tap/Hold: {keys.lastEvent?.isTap ? 'Tap' : keys.lastEvent?.isHold ? 'Hold' : 'N/A'}</p>
      <p>Pressed keys: {Array.from(keys.pressedKeys).join(', ') || 'None'}</p>
      <p>Modifiers: Shift={keys.activeModifiers.shift ? '🟢' : '⚪'} Ctrl={keys.activeModifiers.ctrl ? '🟢' : '⚪'}</p>
      <p>Space pressed: {keys.isKeyPressed('Space') ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Sequence Detection (Konami Code & Shortcuts)

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useState } from 'react';

function SequenceExample() {
  const [achievements, setAchievements] = useState<string[]>([]);
  
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
          id: 'hello',
          keys: ['h', 'e', 'l', 'l', 'o'],
          type: 'sequence'
        }
      ],
      onSequenceMatch: (match) => {
        setAchievements(prev => [...prev, `${match.sequenceId} at ${new Date().toLocaleTimeString()}`]);
      }
    }
  });
  
  return (
    <div>
      <h2>Sequence Detection</h2>
      <div>
        <h3>Try these sequences:</h3>
        <ul>
          <li>Konami Code: ↑↑↓↓←→←→BA</li>
          <li>Save: Ctrl+S</li>
          <li>Hello: Type "hello"</li>
        </ul>
      </div>
      
      <div>
        <h3>Recent Matches:</h3>
        {keys.sequences?.matches.map((match, i) => (
          <p key={i}>✨ {match.sequenceId} - {match.duration}ms</p>
        ))}
      </div>
      
      <div>
        <h3>Achievement Log:</h3>
        {achievements.map((achievement, i) => (
          <p key={i}>🏆 {achievement}</p>
        ))}
      </div>
    </div>
  );
}
```

## preventDefault API & Browser Shortcut Blocking

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useState } from 'react';

function PreventDefaultExample() {
  const [mode, setMode] = useState<'none' | 'specific' | 'all'>('none');
  
  const keys = useNormalizedKeys({
    preventDefault: mode === 'all' ? true : 
                   mode === 'specific' ? ['F5', 'F12', 'Tab'] : 
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
import { useNormalizedKeys } from 'use-normalized-keys';
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
import { useNormalizedKeys } from 'use-normalized-keys';

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

## Complete Game with All Features

```tsx
import { useNormalizedKeys } from 'use-normalized-keys';
import { useState, useEffect, useRef } from 'react';

// Type definitions for better TypeScript support
interface Bullet { x: number; y: number; id: number; }
interface Enemy { x: number; y: number; id: number; }
interface Player { x: number; y: number; health: number; speed: number; }
interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  paused: boolean;
  cheatsEnabled: boolean;
}

export default function AdvancedGame() {
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 250, y: 250, health: 100, speed: 3 },
    enemies: [{ x: 100, y: 100, id: 1 }, { x: 400, y: 150, id: 2 }],
    bullets: [],
    paused: false,
    cheatsEnabled: false
  });
  
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        {
          id: 'konami',
          keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
          type: 'sequence'
        },
        {
          id: 'godmode',
          keys: ['g', 'o', 'd'],
          type: 'sequence'
        }
      ],
      onSequenceMatch: (match) => {
        if (match.sequenceId === 'konami' || match.sequenceId === 'godmode') {
          setGameState(prev => ({ 
            ...prev, 
            cheatsEnabled: true, 
            player: { ...prev.player, health: 999 } 
          }));
        }
      }
    },
    preventDefault: true, // Block browser shortcuts
    tapHoldThreshold: 100,
    debug: false
  });
  
  // Game loop using requestAnimationFrame for smoother performance
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (gameState.paused) return;
    
    const gameLoop = (timestamp: number) => {
      // Throttle to ~60 FPS
      if (timestamp - lastFrameTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTimeRef.current = timestamp;
      
      setGameState(prev => {
        // Deep clone player to avoid mutations
        const player = { ...prev.player };
        let bullets = prev.bullets.slice(); // Clone bullets array
        
        // Player movement with different speeds for tap vs hold
        const baseSpeed = player.speed;
        const isRunning = keys.isKeyPressed('Shift');
        const currentSpeed = isRunning ? baseSpeed * 2 : baseSpeed;
        
        if (keys.isKeyPressed('w') || keys.isKeyPressed('ArrowUp')) {
          player.y = Math.max(0, player.y - currentSpeed);
        }
        if (keys.isKeyPressed('s') || keys.isKeyPressed('ArrowDown')) {
          player.y = Math.min(480, player.y + currentSpeed);
        }
        if (keys.isKeyPressed('a') || keys.isKeyPressed('ArrowLeft')) {
          player.x = Math.max(0, player.x - currentSpeed);
        }
        if (keys.isKeyPressed('d') || keys.isKeyPressed('ArrowRight')) {
          player.x = Math.min(480, player.x + currentSpeed);
        }
        
        // Shooting with tap vs hold
        if (keys.isKeyPressed('Space')) {
          const now = Date.now();
          const lastBullet = bullets[bullets.length - 1];
          const timeSinceLastBullet = lastBullet ? now - lastBullet.id : 1000;
          
          // Rapid fire if holding space, slower if tapping
          const fireRate = keys.lastEvent?.isHold ? 50 : 200;
          
          if (timeSinceLastBullet > fireRate) {
            // Create new array with new bullet
            bullets = bullets.concat({
              x: player.x + 10,
              y: player.y - 10,
              id: now
            });
          }
        }
        
        // Move bullets (immutably)
        bullets = bullets
          .map(bullet => ({ ...bullet, y: bullet.y - 8 }))
          .filter(bullet => bullet.y > 0);
        
        return { ...prev, player, bullets };
      });
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [keys.isKeyPressed, gameState.paused]); // Note: keys.isKeyPressed is stable
  
  // Pause toggle - use keyup to avoid key repeat issues
  useEffect(() => {
    if (keys.lastEvent?.key === 'p' && keys.lastEvent?.type === 'keyup') {
      setGameState(prev => ({ ...prev, paused: !prev.paused }));
    }
  }, [keys.lastEvent]);
  
  return (
    <div>
      <h2>Advanced Game Demo</h2>
      
      <div 
        tabIndex={0}
        autoFocus
        style={{ 
          position: 'relative', 
          width: 500, 
          height: 500, 
          border: '2px solid #333',
          backgroundColor: gameState.cheatsEnabled ? '#001100' : '#000011',
          outline: 'none'
        }}
      >
        {/* Player */}
        <div
          style={{
            position: 'absolute',
            left: gameState.player.x,
            top: gameState.player.y,
            width: 20,
            height: 20,
            backgroundColor: gameState.cheatsEnabled ? '#00ff00' : '#0088ff',
            borderRadius: '50%',
            boxShadow: keys.isKeyPressed('Shift') ? '0 0 10px #fff' : 'none'
          }}
        />
        
        {/* Enemies */}
        {gameState.enemies.map(enemy => (
          <div
            key={enemy.id}
            style={{
              position: 'absolute',
              left: enemy.x,
              top: enemy.y,
              width: 15,
              height: 15,
              backgroundColor: '#ff4444',
              borderRadius: '50%'
            }}
          />
        ))}
        
        {/* Bullets */}
        {gameState.bullets.map(bullet => (
          <div
            key={bullet.id}
            style={{
              position: 'absolute',
              left: bullet.x,
              top: bullet.y,
              width: 3,
              height: 8,
              backgroundColor: '#ffff00'
            }}
          />
        ))}
        
        {gameState.paused && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            PAUSED
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <p>Health: {gameState.player.health} {gameState.cheatsEnabled && '(GOD MODE)'}</p>
        <p>Status: {gameState.paused ? 'Paused' : 'Running'}</p>
        <p>Controls:</p>
        <ul>
          <li>WASD/Arrows: Move (Hold Shift to run)</li>
          <li>Space: Shoot (Hold for rapid fire)</li>
          <li>P: Pause/Resume</li>
          <li>Secret: Try the Konami code or type "god"</li>
        </ul>
        <p>Active keys: {Array.from(keys.pressedKeys).join(', ')}</p>
        <p>Sequences matched: {keys.sequences?.matches.length || 0}</p>
        {keys.lastEvent && (
          <p>
            Last: {keys.lastEvent.key} 
            {keys.lastEvent.isTap && ' (tap)'} 
            {keys.lastEvent.isHold && ' (hold)'} 
            - {keys.lastEvent.duration}ms
          </p>
        )}
      </div>
    </div>
  );
}
```