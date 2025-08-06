# Game Demo

Experience a complete game built with useNormalizedKeys! This advanced demo showcases all the powerful features of the library in an interactive space shooter game.

## Play the Game

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://davgarcia.github.io/use-normalized-keys/game/" 
     target="_blank" 
     rel="noopener noreferrer"
     style="display: inline-block; padding: 12px 24px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
    🎮 Play Game Demo
  </a>
</div>

## Game Features

This complete game demonstrates:

### 🎮 **Smooth Controls**
- **WASD/Arrow Keys**: Move your ship
- **Shift**: Hold to run (2x speed)
- **Space**: Shoot (tap for single shots, hold for rapid fire)
- **P**: Pause/Resume

### 🧩 **Advanced Sequence Detection**
- **Konami Code**: ↑↑↓↓←→←→BA - Enable god mode
- **Secret Command**: Type "god" - Alternative cheat activation

### ⚡ **Real-time Performance**
- 60fps game loop using `requestAnimationFrame`
- Optimized state management with immutable updates
- Efficient key state tracking across the game loop

### 🎯 **Tap vs Hold Detection**
- **Tap Space**: Single shot mode
- **Hold Space**: Automatic rapid fire
- **Threshold**: 100ms for responsive gaming

### 🚫 **preventDefault Integration**
- All browser shortcuts blocked during gameplay
- F5 won't refresh, Ctrl+S won't save dialog
- Full keyboard capture for immersive gaming

## Game Controls

| Key | Action | Notes |
|-----|--------|-------|
| `W` / `↑` | Move Up | Smooth movement |
| `A` / `←` | Move Left | WASD or arrows |
| `S` / `↓` | Move Down | Your choice! |
| `D` / `→` | Move Right | Both work |
| `Shift` + Movement | Run | 2x speed boost |
| `Space` (tap) | Single Shot | Precise shooting |
| `Space` (hold) | Rapid Fire | 50ms fire rate |
| `P` | Pause/Resume | Game state preserved |
| Konami Code | God Mode | ↑↑↓↓←→←→BA |
| Type "god" | God Mode | Alternative cheat |

## Technical Implementation

The game showcases these useNormalizedKeys features:

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

// Game with full feature integration
const keys = useNormalizedKeys({
  sequences: {
    sequences: [
      {
        id: 'konami',
        keys: [Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, 
               Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, 
               Keys.b, Keys.a],
        type: 'sequence'
      },
      {
        id: 'godmode',
        keys: [Keys.g, Keys.o, Keys.d],
        type: 'sequence'
      }
    ],
    onSequenceMatch: (match) => {
      // Enable cheats when sequences match
      if (match.sequenceId === 'konami' || match.sequenceId === 'godmode') {
        enableGodMode();
      }
    }
  },
  preventDefault: true,    // Block all browser shortcuts
  tapHoldThreshold: 100,  // Fast response for gaming
  debug: false
});

// Game loop integration
useEffect(() => {
  const gameLoop = (timestamp) => {
    // Smooth movement with modifier detection
    const isRunning = keys.isKeyPressed(Keys.SHIFT);
    const speed = isRunning ? baseSpeed * 2 : baseSpeed;
    
    if (keys.isKeyPressed(Keys.w) || keys.isKeyPressed(Keys.ARROW_UP)) {
      player.y -= speed;
    }
    // ... more movement logic
    
    // Shooting with tap vs hold
    if (keys.isKeyPressed(Keys.SPACE)) {
      const fireRate = keys.lastEvent?.isHold ? 50 : 200; // Rapid vs single
      // ... shooting logic
    }
  };
  
  requestAnimationFrame(gameLoop);
}, [keys.isKeyPressed, gameState]);
```

## Why This Demo Matters

This game demonstrates that useNormalizedKeys is production-ready for:

### 🎮 **Gaming Applications**
- Real-time input handling
- Complex key combinations
- Smooth 60fps performance
- Platform compatibility

### 🚀 **Interactive Web Apps**
- Rich keyboard interactions
- Sequence detection (shortcuts, commands)
- Immersive user experiences
- Browser integration control

### ⚡ **Performance-Critical UIs**
- Minimal overhead
- Efficient event handling
- Stable function references
- Memory leak prevention

## Run Locally

You can run the game locally:

```bash
# Clone the repository
git clone https://github.com/DavGarcia/use-normalized-keys.git
cd use-normalized-keys

# Install dependencies
npm install

# Start the game demo
npm run game
```

The game will be available at `http://localhost:5173/game/`

## Source Code

The complete game source code is available in our [examples documentation](./examples.md#complete-game-with-all-features) and demonstrates:

- Complex state management with keyboard input
- Real-time game loop integration
- Advanced sequence detection
- Performance optimization techniques
- Cross-platform compatibility testing

**Ready to build your own keyboard-driven application?** Check out our [Quick Start Guide](./quick-start.md) or explore more [Examples](./examples.md)!