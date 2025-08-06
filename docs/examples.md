# Examples

Collection of practical examples showing how to use useNormalizedKeys in various scenarios with all the latest features.

## Unified Hook API with 60fps Animations

The following examples showcase the unified `useHoldSequence` hook with Context Provider for maximum simplicity and smooth 60fps animations.

### Power Attack with Smooth Visual Effects

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect } from 'react';

function PowerAttackExample() {
  const powerAttack = useHoldSequence('power-attack');
  
  // Trigger game actions
  useEffect(() => {
    if (powerAttack.justStarted) {
      console.log('Start charging power attack!');
    }
    if (powerAttack.justCompleted) {
      console.log('Execute devastating power attack!');
    }
    if (powerAttack.justCancelled) {
      console.log('Power attack cancelled');
    }
  }, [powerAttack.justStarted, powerAttack.justCompleted, powerAttack.justCancelled]);
  
  return (
    <div 
      className="power-attack-button"
      style={{
        transform: `scale(${powerAttack.scale})`,
        opacity: powerAttack.opacity,
        boxShadow: powerAttack.glow > 0 ? `0 0 ${powerAttack.glow * 30}px #ff6b35` : 'none',
        marginLeft: `${powerAttack.shake}px`,
        padding: '20px',
        borderRadius: '10px',
        background: powerAttack.isReady ? '#ff6b35' : '#333',
        color: 'white',
        transition: 'background-color 0.3s'
      }}
    >
      <h3>Power Attack (Hold F)</h3>
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
          width: `${powerAttack.progress}%`,
          height: '100%',
          background: `linear-gradient(90deg, #4CAF50 0%, #ff6b35 100%)`,
          transition: 'none' // RAF handles animations!
        }} />
      </div>
      <div>Progress: {Math.round(powerAttack.progress)}%</div>
      <div>Remaining: {powerAttack.remainingTime}ms</div>
      {powerAttack.isReady && <div className="ready-indicator">⚡ READY TO UNLEASH!</div>}
      {powerAttack.isCharging && <div>⚡ Building power...</div>}
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        holdSequence('power-attack', Keys.f, 1000, { name: 'Power Attack' })
      ]}
      preventDefault={[Keys.F5, Keys.TAB]} // Prevent specific browser shortcuts
    >
      <PowerAttackExample />
    </NormalizedKeysProvider>
  );
}
```

### Multi-Ability Game Character

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  Keys 
} from 'use-normalized-keys';
import { useEffect, useState } from 'react';

function GameCharacter() {
  const [abilities, setAbilities] = useState<string[]>([]);
  
  const chargeJump = useHoldSequence('charge-jump');
  const powerAttack = useHoldSequence('power-attack');
  const shield = useHoldSequence('shield');
  const heal = useHoldSequence('heal');
  
  // Trigger abilities when completed
  useEffect(() => {
    if (chargeJump.justCompleted) {
      setAbilities(prev => [...prev, `🦘 Super Jump executed!`]);
    }
    if (powerAttack.justCompleted) {
      setAbilities(prev => [...prev, `⚔️ Power Attack unleashed!`]);
    }
    if (shield.justCompleted) {
      setAbilities(prev => [...prev, `🛡️ Shield activated for ${shield.elapsedTime}ms`]);
    }
    if (heal.justCompleted) {
      setAbilities(prev => [...prev, `❤️ Healing spell cast!`]);
    }
  }, [
    chargeJump.justCompleted, 
    powerAttack.justCompleted, 
    shield.justCompleted, 
    heal.justCompleted
  ]);
  
  return (
    <div className="character-panel">
      <h2>🧙‍♂️ Game Character Abilities</h2>
      
      <div className="abilities-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>        
        <div className="ability" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${chargeJump.scale})`,
          opacity: chargeJump.opacity 
        }}>
          <h3>🦘 Charge Jump (Space)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${chargeJump.progress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '7px'
            }} />
          </div>
          <div>{Math.round(chargeJump.progress)}% - {chargeJump.remainingTime}ms</div>
          {chargeJump.isReady && <div>READY!</div>}
        </div>
        
        <div className="ability" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${powerAttack.scale})`,
          opacity: powerAttack.opacity,
          marginLeft: `${powerAttack.shake}px`
        }}>
          <h3>⚔️ Power Attack (F)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${powerAttack.progress}%`,
              height: '100%',
              backgroundColor: '#ff6b35',
              borderRadius: '7px'
            }} />
          </div>
          <div>{Math.round(powerAttack.progress)}% - {powerAttack.remainingTime}ms</div>
          {powerAttack.isReady && <div>⚡ READY!</div>}
        </div>
        
        <div className="ability" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${shield.scale})`,
          opacity: shield.opacity 
        }}>
          <h3>🛡️ Shield (S)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${shield.progress}%`,
              height: '100%',
              backgroundColor: '#2196F3',
              borderRadius: '7px'
            }} />
          </div>
          <div>{shield.isHolding ? 'ACTIVE' : 'Ready'} - {shield.elapsedTime}ms</div>
        </div>
        
        <div className="ability" style={{ 
          padding: '15px', 
          border: '2px solid #ddd', 
          borderRadius: '10px',
          transform: `scale(${heal.scale})`,
          opacity: heal.opacity 
        }}>
          <h3>❤️ Heal (H)</h3>
          <div className="progress-bar" style={{ 
            width: '100%', 
            height: '15px', 
            backgroundColor: '#eee', 
            borderRadius: '7px' 
          }}>
            <div style={{
              width: `${heal.progress}%`,
              height: '100%',
              backgroundColor: '#E91E63',
              borderRadius: '7px'
            }} />
          </div>
          <div>{Math.round(heal.progress)}% - {heal.remainingTime}ms</div>
          {heal.isReady && <div>✨ READY!</div>}
        </div>
      </div>
      
      <div className="ability-log" style={{ marginTop: '20px' }}>
        <h3>Ability Log:</h3>
        <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '10px', backgroundColor: '#f5f5f5' }}>
          {abilities.slice(-5).map((ability, i) => (
            <div key={i}>{ability}</div>
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
        holdSequence('charge-jump', Keys.SPACE, 750, { name: 'Charge Jump' }),
        holdSequence('power-attack', Keys.f, 1200, { name: 'Power Attack' }),
        holdSequence('shield', Keys.s, 500, { name: 'Shield' }),
        holdSequence('heal', Keys.h, 2000, { name: 'Heal' })
      ]}
      debug={false}
      tapHoldThreshold={150}
    >
      <GameCharacter />
    </NormalizedKeysProvider>
  );
}
```

---

## Direct Hook Usage (Advanced)

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

### Sequence Detection

```tsx
import { useNormalizedKeys, comboSequence, chordSequence, Keys } from 'use-normalized-keys';

function SequenceDemo() {
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        comboSequence('konami', [Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.b, Keys.a]),
        chordSequence('save', [Keys.CONTROL, Keys.s])
      ]
    }
  });
  
  return (
    <div>
      <h2>Sequence Detection</h2>
      <p>Try: Konami code or Ctrl+S</p>
      <p>Matches: {keys.sequences?.matches.length || 0}</p>
    </div>
  );
}
```

## Hold Detection for Charged Actions

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
import { useState, useEffect } from 'react';

function HoldDetectionExample() {
  const [chargeLevel, setChargeLevel] = useState(0);
  const [powerAttacks, setPowerAttacks] = useState<string[]>([]);
  
  const keys = useNormalizedKeys({
    sequences: {
      sequences: [
        {
          id: 'light-charge',
          name: 'Light Charge',
          keys: [{ key: Keys.SPACE, minHoldTime: 300 }],
          type: 'hold'
        },
        {
          id: 'medium-charge',
          name: 'Medium Charge',
          keys: [{ key: Keys.SPACE, minHoldTime: 700 }],
          type: 'hold'
        },
        {
          id: 'full-charge',
          name: 'Full Charge',
          keys: [{ key: Keys.SPACE, minHoldTime: 1200 }],
          type: 'hold'
        },
        {
          id: 'power-attack',
          name: 'Power Attack',
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
            case 'light-charge':
              setChargeLevel(1);
              break;
            case 'medium-charge':
              setChargeLevel(2);
              break;
            case 'full-charge':
              setChargeLevel(3);
              break;
            case 'power-attack':
              setPowerAttacks(prev => [...prev, `Power Attack! ${new Date().toLocaleTimeString()}`]);
              break;
          }
        }
      }
    }
  });
  
  // Reset charge on space release
  useEffect(() => {
    if (keys.lastEvent?.type === 'keyup' && keys.lastEvent.key === Keys.SPACE) {
      if (chargeLevel > 0) {
        setPowerAttacks(prev => [...prev, `Jump with charge level ${chargeLevel}!`]);
        setChargeLevel(0);
      }
    }
  }, [keys.lastEvent, chargeLevel]);
  
  return (
    <div>
      <h2>Hold Detection Example</h2>
      
      <div>
        <h3>Controls:</h3>
        <ul>
          <li>Hold SPACE to charge jump (300ms / 700ms / 1200ms)</li>
          <li>Hold SHIFT+F for power attack (800ms)</li>
        </ul>
      </div>
      
      <div>
        <h3>Charge Level: {chargeLevel}/3</h3>
        <div style={{width: '200px', height: '20px', backgroundColor: '#ddd', borderRadius: '10px'}}>
          <div style={{
            width: `${(chargeLevel / 3) * 100}%`,
            height: '100%',
            backgroundColor: chargeLevel === 3 ? '#ff0000' : chargeLevel === 2 ? '#ffa500' : '#00ff00',
            borderRadius: '10px',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>
      
      <div>
        <h3>Action Log:</h3>
        {powerAttacks.slice(-5).map((action, i) => (
          <p key={i}>⚡ {action}</p>
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

## Complete Game with All Features

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';
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
          keys: [Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.b, Keys.a],
          type: 'sequence'
        },
        {
          id: 'godmode',
          keys: [Keys.g, Keys.o, Keys.d],
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
        const isRunning = keys.isKeyPressed(Keys.SHIFT);
        const currentSpeed = isRunning ? baseSpeed * 2 : baseSpeed;
        
        if (keys.isKeyPressed(Keys.w) || keys.isKeyPressed(Keys.ARROW_UP)) {
          player.y = Math.max(0, player.y - currentSpeed);
        }
        if (keys.isKeyPressed(Keys.s) || keys.isKeyPressed(Keys.ARROW_DOWN)) {
          player.y = Math.min(480, player.y + currentSpeed);
        }
        if (keys.isKeyPressed(Keys.a) || keys.isKeyPressed(Keys.ARROW_LEFT)) {
          player.x = Math.max(0, player.x - currentSpeed);
        }
        if (keys.isKeyPressed(Keys.d) || keys.isKeyPressed(Keys.ARROW_RIGHT)) {
          player.x = Math.min(480, player.x + currentSpeed);
        }
        
        // Shooting with tap vs hold
        if (keys.isKeyPressed(Keys.SPACE)) {
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
    if (keys.lastEvent?.key === Keys.p && keys.lastEvent?.type === 'keyup') {
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
            boxShadow: keys.isKeyPressed(Keys.SHIFT) ? '0 0 10px #fff' : 'none'
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

