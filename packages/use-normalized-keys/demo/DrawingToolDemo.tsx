import React, { useState, useEffect, useCallback } from 'react';
import { 
  NormalizedKeysProvider, 
  useNormalizedKeysContext, 
  useHoldSequence, 
  holdSequence, 
  chordSequence,
  Keys 
} from '../src';

// Type definitions for drawing tools
interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  color: string;
  shortcut: string;
  description: string;
}

interface ToolState {
  selectedTool: string;
  brushSize: number;
  opacity: number;
  lastUpdate: number;
}

const DRAWING_TOOLS: DrawingTool[] = [
  { id: 'brush', name: 'Brush', icon: '🖌️', color: '#3b82f6', shortcut: 'B', description: 'Paint with brush strokes' },
  { id: 'pen', name: 'Pen', icon: '✏️', color: '#10b981', shortcut: 'P', description: 'Precise pen tool' },
  { id: 'eraser', name: 'Eraser', icon: '🧽', color: '#ef4444', shortcut: 'E', description: 'Erase content' },
  { id: 'pencil', name: 'Pencil', icon: '✏️', color: '#6b7280', shortcut: 'N', description: 'Sketch with pencil' },
  { id: 'marker', name: 'Marker', icon: '🖊️', color: '#8b5cf6', shortcut: 'M', description: 'Bold marker strokes' },
  { id: 'text', name: 'Text', icon: 'T', color: '#f59e0b', shortcut: 'T', description: 'Add text' },
  { id: 'select', name: 'Select', icon: '👆', color: '#1f2937', shortcut: 'V', description: 'Selection tool' },
  { id: 'move', name: 'Move', icon: '✋', color: '#059669', shortcut: 'H', description: 'Move elements' }
];

function DrawingCanvas() {
  const keys = useNormalizedKeysContext();
  const [toolState, setToolState] = useState<ToolState>({
    selectedTool: 'brush',
    brushSize: 10,
    opacity: 100,
    lastUpdate: Date.now()
  });

  // Hold sequence for brush pressure sensitivity
  const brushPressure = useHoldSequence('brush-pressure');

  // Handle tool selection
  useEffect(() => {
    // Check for tool shortcut keys
    DRAWING_TOOLS.forEach(tool => {
      const key = tool.shortcut.toLowerCase();
      if (keys.current[key] && !keys.previous[key]) {
        setToolState(prev => ({
          ...prev,
          selectedTool: tool.id,
          lastUpdate: Date.now()
        }));
      }
    });

    // Handle brush size with number keys
    for (let i = 1; i <= 9; i++) {
      const key = i.toString();
      if (keys.current[key] && !keys.previous[key]) {
        setToolState(prev => ({
          ...prev,
          brushSize: i * 5,
          lastUpdate: Date.now()
        }));
      }
    }

    // Handle opacity with Shift + number keys
    if (keys.current.shift) {
      for (let i = 1; i <= 9; i++) {
        const key = i.toString();
        if (keys.current[key] && !keys.previous[key]) {
          setToolState(prev => ({
            ...prev,
            opacity: i * 10,
            lastUpdate: Date.now()
          }));
        }
      }
    }
  }, [keys]);

  const selectedTool = DRAWING_TOOLS.find(tool => tool.id === toolState.selectedTool)!;

  return (
    <div className="drawing-canvas">
      {/* Canvas Area */}
      <div className="canvas-container">
        <div className="canvas-grid">
          <div className="canvas-overlay">
            <div className="canvas-info">
              <h3>Drawing Canvas</h3>
              <p>Use keyboard shortcuts to select tools and adjust settings</p>
              <div className="active-tool-display">
                <span className="tool-icon">{selectedTool.icon}</span>
                <span className="tool-name">{selectedTool.name}</span>
                {brushPressure.isHolding && (
                  <div className="pressure-indicator">
                    <div 
                      className="pressure-bar"
                      style={{
                        width: `${brushPressure.progress}%`,
                        backgroundColor: selectedTool.color,
                        boxShadow: `0 0 ${brushPressure.glow * 10}px ${selectedTool.color}40`
                      }}
                    />
                    <span className="pressure-text">Pressure: {Math.round(brushPressure.progress)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Settings */}
      <div className="tool-settings">
        <div className="setting-group">
          <label>Brush Size: {toolState.brushSize}px</label>
          <div className="brush-preview" style={{ 
            width: `${Math.min(toolState.brushSize, 40)}px`, 
            height: `${Math.min(toolState.brushSize, 40)}px`,
            backgroundColor: selectedTool.color 
          }} />
          <small>Keys 1-9 to change size</small>
        </div>
        <div className="setting-group">
          <label>Opacity: {toolState.opacity}%</label>
          <div className="opacity-preview" style={{ 
            backgroundColor: selectedTool.color,
            opacity: toolState.opacity / 100 
          }} />
          <small>Shift + 1-9 to change opacity</small>
        </div>
      </div>
    </div>
  );
}

function ToolPalette() {
  const keys = useNormalizedKeysContext();
  const [selectedTool, setSelectedTool] = useState('brush');
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');

  // Update selected tool based on keyboard input
  useEffect(() => {
    DRAWING_TOOLS.forEach(tool => {
      const key = tool.shortcut.toLowerCase();
      if (keys.current[key] && !keys.previous[key]) {
        setSelectedTool(tool.id);
        setLastKeyPressed(tool.shortcut);
      }
    });
  }, [keys]);

  return (
    <div className="tool-palette">
      <h3>Tool Palette</h3>
      <div className="tools-grid">
        {DRAWING_TOOLS.map(tool => (
          <div
            key={tool.id}
            className={`tool-item ${selectedTool === tool.id ? 'selected' : ''}`}
            style={{ '--tool-color': tool.color } as React.CSSProperties}
            onClick={() => setSelectedTool(tool.id)}
          >
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-info">
              <div className="tool-name">{tool.name}</div>
              <div className="tool-shortcut">Key: {tool.shortcut}</div>
            </div>
            <div className="tool-description">{tool.description}</div>
            {selectedTool === tool.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
      
      {lastKeyPressed && (
        <div className="last-key-indicator">
          Last pressed: <strong>{lastKeyPressed}</strong>
        </div>
      )}

      <div className="shortcuts-help">
        <h4>🎯 Quick Shortcuts</h4>
        <div className="shortcut-list">
          <div className="shortcut-item">
            <kbd>Space</kbd> + Hold → Pressure sensitivity
          </div>
          <div className="shortcut-item">
            <kbd>1-9</kbd> → Brush size
          </div>
          <div className="shortcut-item">
            <kbd>Shift</kbd> + <kbd>1-9</kbd> → Opacity
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>S</kbd> → Save project
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawingComponent() {
  return (
    <div className="drawing-tool-demo">
      <header className="demo-header">
        <h1>🎨 Drawing Tool Selection Demo</h1>
        <p>Professional keyboard shortcuts for creative applications</p>
      </header>
      
      <div className="demo-content">
        <div className="left-panel">
          <ToolPalette />
        </div>
        <div className="main-panel">
          <DrawingCanvas />
        </div>
      </div>
      
      <div className="demo-footer">
        <p>This demo showcases keyboard-driven tool selection similar to professional drawing applications like Photoshop, Figma, or Sketch.</p>
      </div>
    </div>
  );
}

// Demo sequences for drawing tools
const drawingSequences = [
  // Tool selection shortcuts
  chordSequence('save', [Keys.CONTROL, Keys.s], { name: 'Save Project (Ctrl+S)' }),
  chordSequence('undo', [Keys.CONTROL, Keys.z], { name: 'Undo (Ctrl+Z)' }),
  chordSequence('redo', [Keys.CONTROL, Keys.SHIFT, Keys.z], { name: 'Redo (Ctrl+Shift+Z)' }),
  chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy (Ctrl+C)' }),
  chordSequence('paste', [Keys.CONTROL, Keys.v], { name: 'Paste (Ctrl+V)' }),
  
  // Pressure sensitivity for brush tools
  holdSequence('brush-pressure', Keys.SPACE, 100, { 
    name: 'Brush Pressure (Hold Space)',
    continuous: true 
  }),
  
  // Quick tool access
  chordSequence('zoom-in', [Keys.CONTROL, Keys.EQUALS], { name: 'Zoom In (Ctrl++)' }),
  chordSequence('zoom-out', [Keys.CONTROL, Keys.MINUS], { name: 'Zoom Out (Ctrl+-)' }),
  chordSequence('fit-screen', [Keys.CONTROL, Keys['0']], { name: 'Fit to Screen (Ctrl+0)' }),
];

export default function DrawingToolDemo() {
  return (
    <NormalizedKeysProvider
      sequences={drawingSequences}
      preventDefault={true}
      debug={false}
      excludeInputFields={true}
    >
      <div className="drawing-tool-app">
        <DrawingComponent />
        <style jsx>{`
          .drawing-tool-app {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          .drawing-tool-demo {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .demo-header {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .demo-header h1 {
            color: #1e293b;
            margin: 0 0 10px 0;
            font-size: 2.5rem;
          }
          
          .demo-header p {
            color: #64748b;
            font-size: 1.1rem;
            margin: 0;
          }
          
          .demo-content {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          @media (max-width: 768px) {
            .demo-content {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
          
          .tool-palette {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            height: fit-content;
          }
          
          .tool-palette h3 {
            margin: 0 0 15px 0;
            color: #1e293b;
            font-size: 1.2rem;
          }
          
          .tools-grid {
            display: grid;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .tool-item {
            display: grid;
            grid-template-columns: 40px 1fr 20px;
            align-items: center;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }
          
          .tool-item:hover {
            background-color: #f8fafc;
            border-color: var(--tool-color);
          }
          
          .tool-item.selected {
            background-color: var(--tool-color);
            border-color: var(--tool-color);
            color: white;
          }
          
          .tool-icon {
            font-size: 24px;
            text-align: center;
          }
          
          .tool-info {
            padding-left: 10px;
          }
          
          .tool-name {
            font-weight: 600;
            font-size: 14px;
          }
          
          .tool-shortcut {
            font-size: 12px;
            opacity: 0.8;
          }
          
          .tool-description {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            z-index: 10;
          }
          
          .tool-item:hover .tool-description {
            opacity: 1;
          }
          
          .selected-indicator {
            color: white;
            font-weight: bold;
          }
          
          .last-key-indicator {
            text-align: center;
            padding: 10px;
            background: #f1f5f9;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 14px;
          }
          
          .shortcuts-help {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          
          .shortcuts-help h4 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 14px;
          }
          
          .shortcut-list {
            display: grid;
            gap: 6px;
          }
          
          .shortcut-item {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #64748b;
          }
          
          .shortcut-item kbd {
            background: #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 8px;
            color: #475569;
          }
          
          .drawing-canvas {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .canvas-container {
            position: relative;
            height: 400px;
          }
          
          .canvas-grid {
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            position: relative;
          }
          
          .canvas-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.8);
          }
          
          .canvas-info {
            text-align: center;
            padding: 20px;
          }
          
          .canvas-info h3 {
            margin: 0 0 10px 0;
            color: #1e293b;
          }
          
          .canvas-info p {
            color: #64748b;
            margin: 0 0 20px 0;
          }
          
          .active-tool-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .active-tool-display .tool-icon {
            font-size: 24px;
          }
          
          .active-tool-display .tool-name {
            font-weight: 600;
            color: #1e293b;
          }
          
          .pressure-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            margin-left: 15px;
          }
          
          .pressure-bar {
            height: 8px;
            border-radius: 4px;
            transition: all 0.1s ease;
            min-width: 80px;
          }
          
          .pressure-text {
            font-size: 12px;
            color: #64748b;
          }
          
          .tool-settings {
            padding: 20px;
            background: #f8fafc;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          
          @media (max-width: 600px) {
            .tool-settings {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
          
          .setting-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          
          .setting-group label {
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
          }
          
          .brush-preview {
            border-radius: 50%;
            border: 2px solid #e2e8f0;
            transition: all 0.2s ease;
          }
          
          .opacity-preview {
            width: 40px;
            height: 20px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }
          
          .setting-group small {
            color: #64748b;
            font-size: 12px;
            text-align: center;
          }
          
          .demo-footer {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .demo-footer p {
            margin: 0;
            color: #64748b;
            line-height: 1.6;
          }
        `}</style>
      </div>
    </NormalizedKeysProvider>
  );
}