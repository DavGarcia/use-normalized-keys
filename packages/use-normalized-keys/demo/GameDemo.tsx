import React, { useState, useEffect, useRef } from 'react';
import { 
  NormalizedKeysProvider, 
  useNormalizedKeysContext, 
  useHoldSequence, 
  holdSequence, 
  comboSequence,
  Keys 
} from '../src';

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
  _lastUpdate?: number; // Force updates when input is active
}

function GameComponent() {
  // Use useRef for game state that changes every frame (no re-renders)
  const gameStateRef = useRef<GameState>({
    player: { x: 250, y: 250, health: 100, speed: 3 },
    enemies: [{ x: 100, y: 100, id: 1 }, { x: 400, y: 150, id: 2 }],
    bullets: [],
    paused: false,
    cheatsEnabled: false
  });
  
  // Use useState only for UI updates (less frequent)
  const [displayState, setDisplayState] = useState({
    health: 100,
    bulletCount: 0,
    cheatsEnabled: false,
    paused: false
  });
  
  // Use the context to get keyboard state
  const keys = useNormalizedKeysContext();
  
  // Use the proper hooks for different fire rates
  const rapidFire = useHoldSequence('rapid-fire');
  const ultraFire = useHoldSequence('ultra-fire');
  
  // Handle sequence matches
  useEffect(() => {
    if (keys.sequences?.matches.length) {
      const latestMatch = keys.sequences.matches[keys.sequences.matches.length - 1];
      if (latestMatch.sequenceId === 'konami' || latestMatch.sequenceId === 'godmode') {
        gameStateRef.current.cheatsEnabled = true;
        gameStateRef.current.player.health = 999;
        setDisplayState(prev => ({ ...prev, cheatsEnabled: true, health: 999 }));
      }
    }
  }, [keys.sequences?.matches.length]);
  
  // Game loop using requestAnimationFrame for smoother performance
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const nextShotTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (gameStateRef.current.paused) return;
    
    const gameLoop = (timestamp: number) => {
      // Throttle to ~60 FPS
      if (timestamp - lastFrameTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTimeRef.current = timestamp;
      
      // Work with game state directly (no React re-renders)
      const gameState = gameStateRef.current;
      let hasUpdate = false;
      
      // Player movement with different speeds for tap vs hold
      const baseSpeed = gameState.player.speed;
      const isRunning = keys.isKeyPressed(Keys.SHIFT);
      const currentSpeed = isRunning ? baseSpeed * 2 : baseSpeed;
      
      if (keys.isKeyPressed(Keys.w) || keys.isKeyPressed(Keys.ARROW_UP)) {
        gameState.player.y = Math.max(0, gameState.player.y - currentSpeed);
        hasUpdate = true;
      }
      if (keys.isKeyPressed(Keys.s) || keys.isKeyPressed(Keys.ARROW_DOWN)) {
        gameState.player.y = Math.min(480, gameState.player.y + currentSpeed);
        hasUpdate = true;
      }
      if (keys.isKeyPressed(Keys.a) || keys.isKeyPressed(Keys.ARROW_LEFT)) {
        gameState.player.x = Math.max(0, gameState.player.x - currentSpeed);
        hasUpdate = true;
      }
      if (keys.isKeyPressed(Keys.d) || keys.isKeyPressed(Keys.ARROW_RIGHT)) {
        gameState.player.x = Math.min(480, gameState.player.x + currentSpeed);
        hasUpdate = true;
      }
      
      // Shooting with progressively faster fire rates
      if (keys.isKeyPressed(Keys.SPACE)) {
        const now = Date.now();
        
        // Only shoot if enough time has passed since we're allowed to shoot next
        if (now >= nextShotTimeRef.current) {
          // Progressive fire rates based on hold duration (check ultra first since it requires longer hold)
          let fireRate = 200; // Default: single shot mode (200ms between shots)
          if (ultraFire.isComplete) {
            fireRate = 50; // Ultra fast: 50ms (20 bullets/second)
          } else if (rapidFire.isComplete) {
            fireRate = 100; // Rapid: 100ms (10 bullets/second)
          }
          
          // Set when we can shoot next
          nextShotTimeRef.current = now + fireRate;
          
          // Create new bullet
          gameState.bullets.push({
            x: gameState.player.x + 10,
            y: gameState.player.y - 10,
            id: now
          });
          hasUpdate = true;
        }
      }
      
      // Move bullets
      for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        gameState.bullets[i].y -= 8;
        if (gameState.bullets[i].y < 0) {
          gameState.bullets.splice(i, 1);
          hasUpdate = true;
        } else {
          hasUpdate = true;
        }
      }
      
      // Update display state occasionally for UI (not every frame)
      if (hasUpdate && timestamp % 5 === 0) { // Every 5th frame
        setDisplayState({
          health: gameState.player.health,
          bulletCount: gameState.bullets.length,
          cheatsEnabled: gameState.cheatsEnabled,
          paused: gameState.paused
        });
      }
      
      // Render to DOM
      renderGame(gameState);
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [keys.isKeyPressed]); // Only depend on stable key function
  
  // Render game to DOM (called every frame)
  const renderGame = (gameState: GameState) => {
    if (!canvasRef.current) return;
    
    const container = canvasRef.current;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Player
    const player = document.createElement('div');
    player.style.cssText = `
      position: absolute;
      left: ${gameState.player.x}px;
      top: ${gameState.player.y}px;
      width: 20px;
      height: 20px;
      background-color: ${gameState.cheatsEnabled ? '#00ff00' : '#0088ff'};
      border-radius: 50%;
      box-shadow: ${keys.isKeyPressed(Keys.SHIFT) ? '0 0 15px #fff' : '0 2px 4px rgba(0,0,0,0.3)'};
      transition: box-shadow 0.1s ease-out;
    `;
    container.appendChild(player);
    
    // Enemies
    gameState.enemies.forEach(enemy => {
      const enemyEl = document.createElement('div');
      enemyEl.style.cssText = `
        position: absolute;
        left: ${enemy.x}px;
        top: ${enemy.y}px;
        width: 15px;
        height: 15px;
        background-color: #ff4444;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(255,68,68,0.5);
      `;
      container.appendChild(enemyEl);
    });
    
    // Bullets
    gameState.bullets.forEach(bullet => {
      const bulletEl = document.createElement('div');
      bulletEl.style.cssText = `
        position: absolute;
        left: ${bullet.x}px;
        top: ${bullet.y}px;
        width: 3px;
        height: 8px;
        background-color: #ffff00;
        border-radius: 2px;
        box-shadow: 0 0 4px rgba(255,255,0,0.8);
      `;
      container.appendChild(bulletEl);
    });
    
    // Pause overlay
    if (gameState.paused) {
      const pauseEl = document.createElement('div');
      pauseEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 32px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        text-align: center;
      `;
      pauseEl.innerHTML = '⏸️ PAUSED<br/><div style="font-size: 16px; margin-top: 8px">Press P to resume</div>';
      container.appendChild(pauseEl);
    }
  };
  
  // Pause toggle - use keyup to avoid key repeat issues
  useEffect(() => {
    if (keys.lastEvent?.key === Keys.p && keys.lastEvent?.type === 'keyup') {
      gameStateRef.current.paused = !gameStateRef.current.paused;
      setDisplayState(prev => ({ ...prev, paused: gameStateRef.current.paused }));
    }
  }, [keys.lastEvent]);
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: 'white', marginBottom: '10px' }}>🎮 useNormalizedKeys Game Demo</h1>
        <p style={{ color: 'white', margin: '0' }}>
          A complete space shooter showcasing all library features
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div 
          ref={canvasRef}
          tabIndex={0}
          autoFocus
          style={{ 
            position: 'relative', 
            width: 500, 
            height: 500, 
            border: '3px solid #333',
            backgroundColor: displayState.cheatsEnabled ? '#001100' : '#000011',
            outline: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>🎯 Game Status</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            <div><strong>Health:</strong> {displayState.health} {displayState.cheatsEnabled && '(GOD MODE 👾)'}</div>
            <div><strong>Status:</strong> {displayState.paused ? '⏸️ Paused' : '▶️ Running'}</div>
            <div><strong>Bullets:</strong> {displayState.bulletCount}</div>
            <div><strong>Sequences:</strong> {keys.sequences?.matches.length || 0} matched</div>
          </div>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>⌨️ Current Input</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            <div><strong>Active Keys:</strong> {Array.from(keys.pressedKeys).join(', ') || 'None'}</div>
            <div><strong>Running:</strong> {keys.isKeyPressed(Keys.SHIFT) ? '🏃‍♂️ Yes' : '🚶‍♂️ No'}</div>
            <div><strong>Fire Mode:</strong> {
              ultraFire.isComplete ? '💥 ULTRA FIRE!' : 
              rapidFire.isComplete ? '🔥 Rapid Fire' : 
              '🎯 Single Shot'
            }</div>
            <div><strong>Debug:</strong> Rapid={rapidFire.progress}% Ultra={ultraFire.progress}%</div>
            <div><strong>Holding:</strong> Rapid={rapidFire.isHolding ? 'Yes' : 'No'} Ultra={ultraFire.isHolding ? 'Yes' : 'No'}</div>
            <div><strong>Space Key:</strong> {keys.isKeyPressed(Keys.SPACE) ? 'PRESSED' : 'Not pressed'}</div>
            <div><strong>Current Holds:</strong> {Array.from(keys.currentHolds.keys()).join(', ') || 'None'}</div>
            <div><strong>Sequences:</strong> {keys.sequences?.debugState ? keys.sequences.debugState.heldKeys.size : 0} held keys</div>
            {keys.lastEvent && (
              <div>
                <strong>Last:</strong> {keys.lastEvent.key} 
                {keys.lastEvent.isTap && ' (tap)'} 
                {keys.lastEvent.isHold && ' (hold)'} 
                - {keys.lastEvent.duration}ms
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #bbdefb',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1565c0' }}>🎮 Controls</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          fontSize: '14px'
        }}>
          <div><strong>WASD/Arrows:</strong> Move ship</div>
          <div><strong>Shift + Move:</strong> Run (2x speed)</div>
          <div><strong>Space (tap):</strong> Single shot</div>
          <div><strong>Space (hold 200ms):</strong> Rapid fire</div>
          <div><strong>Space (hold 2s):</strong> Ultra fire!</div>
          <div><strong>P:</strong> Pause/Resume</div>
          <div><strong>Konami Code:</strong> ↑↑↓↓←→←→BA</div>
          <div><strong>Type "god":</strong> Enable cheats</div>
        </div>
      </div>
      
      <div style={{ 
        background: '#fff3e0', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #ffcc02',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>💡 Try the Secret Codes!</h4>
        <p style={{ margin: '0', fontSize: '14px', color: '#e65100' }}>
          Enter the <strong>Konami Code</strong> (↑↑↓↓←→←→BA) or type <strong>"god"</strong> to enable cheat mode with unlimited health and special effects!
        </p>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        padding: '16px',
        fontSize: '12px',
        color: '#666',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ margin: '0' }}>
          Built with <strong>useNormalizedKeys</strong> • 
          <a href="/use-normalized-keys/" style={{ color: '#007acc' }}> Documentation</a> • 
          <a href="/use-normalized-keys/demo" style={{ color: '#007acc' }}> Interactive Demo</a>
        </p>
      </div>
    </div>
  );
}

export default function GameDemo() {
  return (
    <NormalizedKeysProvider
      sequences={[
        // Progressive fire rate sequences
        holdSequence('rapid-fire', Keys.SPACE, 200, { name: 'Rapid Fire' }),
        holdSequence('ultra-fire', Keys.SPACE, 2000, { name: 'Ultra Fire' }),
        
        // Cheat sequences
        comboSequence('konami', [
          Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, 
          Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, 
          Keys.b, Keys.a
        ], { name: 'Konami Code', timeout: 2000 }),
        
        comboSequence('godmode', [Keys.g, Keys.o, Keys.d], { 
          name: 'God Mode', 
          timeout: 1000 
        })
      ]}
      preventDefault={true}
      tapHoldThreshold={100}
      debug={false}
    >
      <GameComponent />
    </NormalizedKeysProvider>
  );
}