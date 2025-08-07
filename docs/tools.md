# 🎨 Drawing Tools Demo

Professional keyboard shortcuts for creative applications using useNormalizedKeys

<div style="text-align: center; margin: 2rem 0;">
  <a href="https://davgarcia.github.io/use-normalized-keys/tools/" target="_blank"
     style="display: inline-block; padding: 12px 24px; background-color: #3eaf7c; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
    🚀 Try the Drawing Tools Demo
  </a>
</div>

## Overview

This demo showcases how useNormalizedKeys can power professional creative applications with keyboard shortcuts similar to Photoshop, Figma, or Sketch. Experience instant tool switching, brush sizing, and opacity control—all through intuitive keyboard commands.

### Key Features

- **🛠️ Tool Selection**: Switch between 8 drawing tools instantly using single key presses
- **📏 Brush Sizing**: Adjust brush size from 5px to 45px using number keys 1-9, with 0 for 50px
- **🎨 Opacity Control**: Fast opacity adjustments with Shift+number keys
- **⚡ Professional Speed**: Optimized for professional workflows with instant response

## Keyboard Shortcuts

### Tools
| Shortcut | Action |
|----------|--------|
| `B` | Select Brush |
| `P` | Select Pen |
| `E` | Select Eraser |
| `N` | Select Pencil |
| `F` | Select Bucket Fill |
| `T` | Select Text |
| `V` | Select Selection Tool |
| `H` | Select Move Tool |

### Brush Size
| Shortcut | Action |
|----------|--------|
| `1-9` | Set brush size (5px-45px) |
| `0` | Set brush size to 50px |

### Opacity
| Shortcut | Action |
|----------|--------|
| `Shift + 1-9` | Set opacity (10%-90%) |
| `Shift + 0` | Set opacity to 100% |

### File Operations
| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save Project |
| `Ctrl + Z` | Undo Action |

## Implementation

### Core Setup

```typescript
import { 
  NormalizedKeysProvider, 
  chordSequence, 
  Keys 
} from 'use-normalized-keys';

// Define sequences for drawing tools
const drawingSequences = [
  // Tool shortcuts
  chordSequence('tool-brush', [Keys.b], { name: 'Select Brush (B)' }),
  chordSequence('tool-pen', [Keys.p], { name: 'Select Pen (P)' }),
  chordSequence('tool-eraser', [Keys.e], { name: 'Select Eraser (E)' }),
  
  // Brush size shortcuts (1-9, 0)
  ...Array.from({ length: 9 }, (_, i) => {
    const digit = (i + 1).toString();
    return chordSequence(
      `brush-size-${digit}`, 
      [Keys[`DIGIT_${digit}`]], 
      { name: `Brush Size ${(i + 1) * 5}px` }
    );
  }),
  
  // Opacity shortcuts (Shift + 1-9, 0)
  ...Array.from({ length: 9 }, (_, i) => {
    const digit = (i + 1).toString();
    return chordSequence(
      `opacity-${digit}`, 
      [Keys.SHIFT, Keys[`DIGIT_${digit}`]], 
      { name: `Opacity ${(i + 1) * 10}%` }
    );
  }),
];
```

### Provider Configuration

```typescript
// Set up the provider with sequences and event handling
function DrawingApp() {
  const handleSequenceMatch = useCallback((match) => {
    const { sequenceId } = match;

    // Handle tool selection
    if (sequenceId.startsWith('tool-')) {
      const toolId = sequenceId.split('-')[1];
      setSelectedTool(toolId);
    }

    // Handle brush size
    if (sequenceId.startsWith('brush-size-')) {
      const digit = sequenceId.split('-')[2];
      const size = digit === '0' ? 50 : parseInt(digit) * 5;
      setBrushSize(size);
    }

    // Handle opacity
    if (sequenceId.startsWith('opacity-')) {
      const digit = sequenceId.split('-')[1];
      const opacity = digit === '0' ? 100 : parseInt(digit) * 10;
      setOpacity(opacity);
    }
  }, []);

  return (
    <NormalizedKeysProvider
      sequences={drawingSequences}
      preventDefault={true}
      excludeInputFields={true}
      onSequenceMatch={handleSequenceMatch}
    >
      <DrawingCanvas />
    </NormalizedKeysProvider>
  );
}
```

## Key Features Demonstrated

### 🔥 Fast Chord Detection
Optimized 10ms detection for rapid typing. Handles Shift+1,2,3 sequences perfectly for quick opacity adjustments.

### 🖥️ Cross-Platform
Works seamlessly on Windows, macOS, and Linux. Handles numpad vs top-row numbers automatically.

### 🛡️ Phantom Event Handling
Correctly handles Windows Shift+Numpad phantom events that can break other keyboard libraries.

### 🎯 Professional UX
Instant visual feedback, toast notifications, and professional-grade keyboard shortcuts.

## Running Locally

### Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/use-normalized-keys.git
cd use-normalized-keys/packages/use-normalized-keys
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the tools demo:**
```bash
npm run dev:tools
```

4. **Open your browser:**
Navigate to the demo at `localhost:5174/tools.html` to try the drawing tools demo.

### Build for Production

```bash
# Build the demo
npm run build:demo

# Preview the built demo
npm run preview:demo
```

## Technical Highlights

- **Sub-10ms Response Times**: Optimized chord detection for professional workflows
- **Memory Efficient**: Smart state management prevents memory leaks during extended use
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Framework Agnostic**: While this demo uses React, the core library works anywhere
- **Accessible**: Proper focus management and keyboard navigation support
- **Production Ready**: Extensive test coverage and battle-tested in real applications

---

**useNormalizedKeys** - Professional keyboard input handling for React applications