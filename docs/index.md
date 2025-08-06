# useNormalizedKeys

A React hook for normalized keyboard input handling, designed for productivity applications, drawing tools, and professional interfaces with advanced features like sequence detection, tap/hold recognition, and cross-platform compatibility.

## What is useNormalizedKeys?

useNormalizedKeys is a comprehensive React hook that provides consistent, feature-rich keyboard input handling across different browsers and platforms. It's designed for applications that require precise, real-time keyboard interaction like text editors, drawing applications, design tools, code editors, and professional productivity applications.

## Key Features

- **⚡ Professional Shortcuts** - Build keyboard-driven interfaces like Photoshop, Figma, VS Code
- **🚀 Smooth Animations** - RequestAnimationFrame for perfectly fluid visual feedback
- **🔄 Context Provider** - Simplified setup with automatic state management
- **🌐 Cross-platform compatibility** - Handles Windows, macOS, and Linux keyboard differences seamlessly
- **🎨 Drawing Tools Ready** - Optimized for creative applications with pressure sensitivity and tool switching  
- **🎹 Advanced Sequences** - Detect complex shortcuts (Ctrl+S), key sequences (jk), and chord combinations
- **⏱️ Tap vs Hold detection** - Distinguish between quick taps and long holds for different actions
- **🚫 Smart Prevention** - Block browser shortcuts selectively while respecting input fields
- **🔤 Key normalization** - Consistent key names across different browsers and layouts
- **📊 Rich event data** - Detailed information about timing, modifiers, accessibility state, and more
- **📝 TypeScript First** - Complete type definitions with excellent IntelliSense support
- **🔧 Zero configuration** - Works out of the box with sensible defaults for professional use

## Quick Example

```tsx
import { useNormalizedKeys, Keys } from 'use-normalized-keys';

function TextEditor() {
  const keys = useNormalizedKeys({
    sequences: [
      { id: 'vim-escape', keys: [Keys.j, Keys.k], type: 'sequence' },
      { id: 'save', keys: [Keys.CONTROL, Keys.s], type: 'chord' }
    ],
    onSequenceMatch: (match) => {
      if (match.sequenceId === 'save') console.log('Document saved!');
      if (match.sequenceId === 'vim-escape') console.log('Exit insert mode');
    },
    preventDefault: true, // Prevent browser shortcuts like Ctrl+S
    tapHoldThreshold: 150 // 150ms for tap vs hold
  });
  
  return (
    <div>
      <textarea placeholder="Start typing..." />
      <p>Last key: {keys.lastEvent?.key} 
         {keys.lastEvent?.isTap && ' (tap)'} 
         {keys.lastEvent?.isHold && ' (hold)'}
      </p>
      
      <div>
        <h3>Productivity Shortcuts</h3>
        <ul>
          <li>Save (Ctrl+S): {keys.isKeyPressed([Keys.CONTROL, Keys.s]) ? '🟢' : '⚪'}</li>
          <li>Undo (Ctrl+Z): {keys.isKeyPressed([Keys.CONTROL, Keys.z]) ? '🟢' : '⚪'}</li>
          <li>Copy (Ctrl+C): {keys.isKeyPressed([Keys.CONTROL, Keys.c]) ? '🟢' : '⚪'}</li>
          <li>Paste (Ctrl+V): {keys.isKeyPressed([Keys.CONTROL, Keys.v]) ? '🟢' : '⚪'}</li>
        </ul>
      </div>
      
      <div>
        <h3>Modifiers</h3>
        <p>Shift: {keys.activeModifiers.shift ? '🟢' : '⚪'}</p>
        <p>Ctrl: {keys.activeModifiers.ctrl ? '🟢' : '⚪'}</p>
      </div>
      
      {keys.sequences?.matches.length > 0 && (
        <div>
          <h3>Shortcuts Detected</h3>
          {keys.sequences.matches.map(match => (
            <p key={match.sequenceId}>✨ {match.sequenceId}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Normalized Provider

The Context Provider approach provides key info through a common context:

```tsx
import { 
  NormalizedKeysProvider, 
  useHoldSequence, 
  holdSequence,
  chordSequence,
  Keys 
} from 'use-normalized-keys';

function BrushTool() {
  // Single unified hook for brush pressure sensitivity
  const brushPressure = useHoldSequence('brush-pressure');
  
  return (
    <div className="brush-tool">
      <div 
        className="brush-preview"
        style={{
          transform: `scale(${1 + brushPressure.progress / 200})`,
          opacity: 0.5 + brushPressure.progress / 200,
          boxShadow: brushPressure.glow > 0 ? `0 0 ${brushPressure.glow * 10}px #3b82f6` : 'none'
        }}
      >
        <div>Brush Size: {Math.round(10 + brushPressure.progress / 10)}px</div>
        <div>Pressure: {Math.round(brushPressure.progress)}%</div>
        {brushPressure.isCharging && <div className="charging">Hold Space for pressure</div>}
      </div>
    </div>
  );
}

function App() {
  return (
    <NormalizedKeysProvider 
      sequences={[
        // Pressure sensitivity for brush
        holdSequence('brush-pressure', Keys.SPACE, 100, { 
          name: 'Brush Pressure', 
          continuous: true 
        }),
        // Standard shortcuts
        chordSequence('save', [Keys.CONTROL, Keys.s], { name: 'Save Project' }),
        chordSequence('undo', [Keys.CONTROL, Keys.z], { name: 'Undo' })
      ]}
    >
      <BrushTool />
    </NormalizedKeysProvider>
  );
}
```

## Getting Started

Ready to get started? Check out our [installation guide](/installation) and [quick start tutorial](/quick-start).

Or jump right into the [live demo](/demo) to see it in action!