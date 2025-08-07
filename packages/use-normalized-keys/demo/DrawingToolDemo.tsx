import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface Toast {
  id: number;
  message: string;
  visible: boolean;
}

const DRAWING_TOOLS: DrawingTool[] = [
  { id: 'brush', name: 'Brush', icon: '🖌️', color: '#3b82f6', shortcut: 'B', description: 'Paint with brush strokes' },
  { id: 'pen', name: 'Pen', icon: '🖊️', color: '#10b981', shortcut: 'P', description: 'Precise pen tool' },
  { id: 'eraser', name: 'Eraser', icon: '🧽', color: '#ef4444', shortcut: 'E', description: 'Erase content' },
  { id: 'pencil', name: 'Pencil', icon: '✏️', color: '#6b7280', shortcut: 'N', description: 'Sketch with pencil' },
  { id: 'bucket', name: 'Bucket', icon: '🪣', color: '#8b5cf6', shortcut: 'F', description: 'Fill with color' },
  { id: 'text', name: 'Text', icon: 'T', color: '#f59e0b', shortcut: 'T', description: 'Add text' },
  { id: 'select', name: 'Select', icon: '👆', color: '#1f2937', shortcut: 'V', description: 'Selection tool' },
  { id: 'move', name: 'Move', icon: '✋', color: '#059669', shortcut: 'H', description: 'Move elements' }
];

interface DrawingCanvasProps {
  selectedTool: string;
  onToolChange: (toolId: string) => void;
  toolState: {
    brushSize: number;
    opacity: number;
    lastUpdate: number;
  };
  setToolState: React.Dispatch<React.SetStateAction<{
    brushSize: number;
    opacity: number;
    lastUpdate: number;
  }>>;
  toasts: Toast[];
}

function DrawingCanvas({ selectedTool, onToolChange, toolState, setToolState, toasts }: DrawingCanvasProps) {

  const selectedToolData = DRAWING_TOOLS.find(tool => tool.id === selectedTool)!;

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
                <span className="tool-icon">{selectedToolData.icon}</span>
                <span className="tool-name">{selectedToolData.name}</span>
                <div className="tool-settings-preview">
                  <div className="setting-display">
                    <span className="setting-label">Brush: {toolState.brushSize}px</span>
                    <span className="setting-label">Opacity: {toolState.opacity}%</span>
                  </div>
                </div>
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
            backgroundColor: selectedToolData.color 
          }} />
          <small>Keys 1-9, 0 to change size</small>
        </div>
        <div className="setting-group">
          <label>Opacity: {toolState.opacity}%</label>
          <div className="opacity-preview" style={{ 
            backgroundColor: selectedToolData.color,
            opacity: toolState.opacity / 100 
          }} />
          <small>Shift + 1-9, 0 to change opacity</small>
        </div>
      </div>
      
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolPalette({ selectedTool, onToolChange }: { selectedTool: string, onToolChange: (toolId: string) => void }) {
  const keys = useNormalizedKeysContext();
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');

  // Update last key pressed for UI feedback
  useEffect(() => {
    if (!keys.lastEvent || keys.lastEvent.type !== 'keydown') return;

    DRAWING_TOOLS.forEach(tool => {
      const key = tool.shortcut.toLowerCase();
      if (keys.lastEvent.key === key) {
        setLastKeyPressed(tool.shortcut);
      }
    });
  }, [keys.lastEvent]);

  return (
    <div className="tool-palette">
      <h3>Tool Palette</h3>
      <div className="tools-grid">
        {DRAWING_TOOLS.map(tool => (
          <div
            key={tool.id}
            className={`tool-item ${selectedTool === tool.id ? 'selected' : ''}`}
            style={{ '--tool-color': tool.color } as React.CSSProperties}
            onClick={() => onToolChange(tool.id)}
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
            <kbd>1-9, 0</kbd> → Brush size (0 = 50px)
          </div>
          <div className="shortcut-item">
            <kbd>Shift</kbd> + <kbd>1-9, 0</kbd> → Opacity (0 = 100%)
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>S</kbd> → Save project
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>Z</kbd> → Undo action
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawingComponent() {
  const [selectedTool, setSelectedTool] = useState('brush');
  const [toolState, setToolState] = useState({
    brushSize: 10,
    opacity: 100,
    lastUpdate: Date.now()
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Show toast notification
  const showToast = useCallback((message: string) => {
    const id = ++toastId.current;
    const newToast = { id, message, visible: true };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // Handle sequence matches
  const handleSequenceMatch = useCallback((match: any) => {
    const { sequenceId } = match;
    console.log("Sequence: " + sequenceId);

    // Handle tool selection shortcuts
    if (sequenceId.startsWith('tool-')) {
      const toolId = sequenceId.split('-')[1];
      console.log('🔧 Tool Selection:', sequenceId, '→', toolId);
      setSelectedTool(toolId);
      setToolState(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
    }

    // Handle brush size shortcuts
    if (sequenceId.startsWith('brush-size-')) {
      const digit = sequenceId.split('-')[2];
      const size = digit === '0' ? 50 : parseInt(digit) * 5;
      console.log('🖌️ Brush Size:', sequenceId, '→', size + 'px');
      setToolState(prev => ({
        ...prev,
        brushSize: size,
        lastUpdate: Date.now()
      }));
    }

    // Handle opacity shortcuts
    if (sequenceId.startsWith('opacity-')) {
      const digit = sequenceId.split('-')[1];
      const opacity = digit === '0' ? 100 : parseInt(digit) * 10;
      console.log('💧 Opacity:', sequenceId, '→', opacity + '%');
      setToolState(prev => ({
        ...prev,
        opacity,
        lastUpdate: Date.now()
      }));
    }

    // Handle save/undo shortcuts
    if (sequenceId === 'save') {
      console.log('💾 Save triggered');
      showToast('💾 Project saved successfully!');
    } else if (sequenceId === 'undo') {
      console.log('↶ Undo triggered');
      showToast('↶ Undo action performed!');
    }
  }, [showToast]);

  return (
    <NormalizedKeysProvider
      sequences={drawingSequences}
      preventDefault={true}
      debug={true}
      excludeInputFields={true}
      onSequenceMatch={handleSequenceMatch}
    >
      <div className="drawing-tool-demo">
        <header className="demo-header">
          <h1>🎨 Drawing Tool Selection Demo</h1>
          <p>Professional keyboard shortcuts for creative applications</p>
          <div className="demo-header-buttons">
            <a href="https://davgarcia.github.io/use-normalized-keys/demo/" className="demo-link" target="_blank">🚀 Try Main Demo</a>
            <a href="https://davgarcia.github.io/use-normalized-keys/" className="demo-link secondary">📖 Documentation</a>
          </div>
        </header>
        
        <div className="demo-content">
          <div className="left-panel">
            <ToolPalette selectedTool={selectedTool} onToolChange={setSelectedTool} />
          </div>
          <div className="main-panel">
            <DrawingCanvas 
              selectedTool={selectedTool} 
              onToolChange={setSelectedTool}
              toolState={toolState}
              setToolState={setToolState}
              toasts={toasts}
            />
          </div>
        </div>
        
        <div className="demo-footer">
          <p>This demo showcases keyboard-driven tool selection similar to professional drawing applications like Photoshop, Figma, or Sketch.</p>
        </div>
      </div>
    </NormalizedKeysProvider>
  );
}

// Demo sequences for drawing tools
const drawingSequences = [
  // Save/Undo shortcuts
  chordSequence('save', [Keys.CONTROL, Keys.s], { name: 'Save Project (Ctrl+S)' }),
  chordSequence('undo', [Keys.CONTROL, Keys.z], { name: 'Undo (Ctrl+Z)' }),
  chordSequence('redo', [Keys.CONTROL, Keys.SHIFT, Keys.z], { name: 'Redo (Ctrl+Shift+Z)' }),
  chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy (Ctrl+C)' }),
  chordSequence('paste', [Keys.CONTROL, Keys.v], { name: 'Paste (Ctrl+V)' }),
  
  // Tool shortcuts
  chordSequence('tool-brush', [Keys.b], { name: 'Select Brush (B)' }),
  chordSequence('tool-pen', [Keys.p], { name: 'Select Pen (P)' }),
  chordSequence('tool-eraser', [Keys.e], { name: 'Select Eraser (E)' }),
  chordSequence('tool-pencil', [Keys.n], { name: 'Select Pencil (N)' }),
  chordSequence('tool-bucket', [Keys.f], { name: 'Select Bucket (F)' }),
  chordSequence('tool-text', [Keys.t], { name: 'Select Text (T)' }),
  chordSequence('tool-select', [Keys.v], { name: 'Select Tool (V)' }),
  chordSequence('tool-move', [Keys.h], { name: 'Select Move (H)' }),
  
  // Brush size shortcuts (1-9, 0)
  ...Array.from({ length: 9 }, (_, i) => {
    const digit = (i + 1).toString();
    return chordSequence(`brush-size-${digit}`, [Keys[`DIGIT_${digit}` as keyof typeof Keys]], { name: `Brush Size ${(i + 1) * 5}px` });
  }),
  chordSequence('brush-size-0', [Keys.DIGIT_0], { name: 'Brush Size 50px' }),
  
  // Opacity shortcuts (Shift + 1-9, 0)
  ...Array.from({ length: 9 }, (_, i) => {
    const digit = (i + 1).toString();
    return chordSequence(`opacity-${digit}`, [Keys.SHIFT, Keys[`DIGIT_${digit}` as keyof typeof Keys]], { name: `Opacity ${(i + 1) * 10}%` });
  }),
  chordSequence('opacity-0', [Keys.SHIFT, Keys.DIGIT_0], { name: 'Opacity 100%' }),
  
  // Quick tool access
  chordSequence('zoom-in', [Keys.CONTROL, Keys.EQUALS], { name: 'Zoom In (Ctrl++)' }),
  chordSequence('zoom-out', [Keys.CONTROL, Keys.MINUS], { name: 'Zoom Out (Ctrl+-)' }),
  chordSequence('fit-screen', [Keys.CONTROL, Keys.DIGIT_0], { name: 'Fit to Screen (Ctrl+0)' }),
];

export default function DrawingToolDemo() {
  return (
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
            margin: 0 0 20px 0;
          }
          
          .demo-header-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
          }
          
          .demo-link {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s ease;
            font-size: 0.95rem;
          }
          
          .demo-link:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .demo-link.secondary {
            background: #f1f5f9;
            color: #475569;
          }
          
          .demo-link.secondary:hover {
            background: #e2e8f0;
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
            gap: 4px;
            margin-bottom: 15px;
          }
          
          .tool-item {
            display: grid;
            grid-template-columns: 32px 1fr 16px;
            align-items: center;
            padding: 8px 10px;
            border-radius: 6px;
            border: 1px solid transparent;
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
            font-size: 18px;
            text-align: center;
          }
          
          .tool-info {
            padding-left: 8px;
          }
          
          .tool-name {
            font-weight: 600;
            font-size: 13px;
            line-height: 1.2;
          }
          
          .tool-shortcut {
            font-size: 11px;
            opacity: 0.8;
            margin-top: 1px;
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
            font-size: 11px;
            color: #64748b;
            margin-bottom: 3px;
          }
          
          .shortcut-item:last-child {
            margin-bottom: 0;
          }
          
          .shortcut-item kbd {
            background: #e2e8f0;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 10px;
            margin-right: 6px;
            color: #475569;
            font-family: inherit;
            min-width: 16px;
            text-align: center;
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
          
          .tool-settings-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            margin-left: 15px;
          }
          
          .setting-display {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .setting-label {
            font-size: 11px;
            color: #64748b;
            white-space: nowrap;
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
          
          .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .toast {
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
          }
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }