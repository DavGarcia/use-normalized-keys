import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNormalizedKeys, SequenceDefinition, MatchedSequence } from '../src';
import './InteractiveDemo.css';

// Virtual keyboard layout
const KEYBOARD_LAYOUT = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Control', 'Meta', 'Alt', ' ', 'Alt', 'Meta', 'Control']
];

const NUMPAD_LAYOUT = [
  ['NumLock', '/', '*', '-'],
  ['7', '8', '9', '+'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', 'Enter'],
  ['0', '0', '.', 'Enter']
];

// Map display keys to actual key codes for numpad
const NUMPAD_KEY_CODE_MAP: Record<string, string> = {
  'NumLock': 'NumLock',
  '/': 'NumpadDivide',
  '*': 'NumpadMultiply',
  '-': 'NumpadSubtract',
  '+': 'NumpadAdd',
  'Enter': 'NumpadEnter',
  '.': 'NumpadDecimal',
  '0': 'Numpad0',
  '1': 'Numpad1',
  '2': 'Numpad2',
  '3': 'Numpad3',
  '4': 'Numpad4',
  '5': 'Numpad5',
  '6': 'Numpad6',
  '7': 'Numpad7',
  '8': 'Numpad8',
  '9': 'Numpad9'
};

// Predefined sequences for demo
const getSequences = (customHoldTime: number): SequenceDefinition[] => [
  {
    id: 'konami',
    name: 'Konami Code',
    keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    type: 'sequence',
    timeout: 2000
  },
  {
    id: 'save',
    name: 'Save (Ctrl+S)',
    keys: ['Control', 's'],
    type: 'chord'
  },
  {
    id: 'copy',
    name: 'Copy (Ctrl+C)',
    keys: ['Control', 'c'],
    type: 'chord'
  },
  {
    id: 'paste',
    name: 'Paste (Ctrl+V)',
    keys: ['Control', 'v'],
    type: 'chord'
  },
  {
    id: 'undo',
    name: 'Undo (Ctrl+Z)',
    keys: ['Control', 'z'],
    type: 'chord'
  },
  // Hold detection examples
  {
    id: 'charge-jump',
    name: 'Charge Jump (Hold Space)',
    keys: [{ key: 'Space', minHoldTime: 750 }],
    type: 'hold'
  },
  {
    id: 'power-attack',
    name: 'Power Attack (Hold F)',
    keys: [{ key: 'f', minHoldTime: 1000 }],
    type: 'hold'
  },
  {
    id: 'heavy-punch',
    name: 'Heavy Punch (Hold H)',
    keys: [{ key: 'h', minHoldTime: 400 }],
    type: 'hold'
  },
  {
    id: 'special-move',
    name: 'Special Move (Hold Ctrl+S)',
    keys: [{ 
      key: 's', 
      minHoldTime: 600,
      modifiers: { ctrl: true }
    }],
    type: 'hold'
  },
  {
    id: 'select-all',
    name: 'Select All (Ctrl+A)',
    keys: ['Control', 'a'],
    type: 'chord'
  },
  {
    id: 'vim-escape',
    name: 'Vim Escape (jk)',
    keys: ['j', 'k'],
    type: 'sequence',
    timeout: 300
  },
  {
    id: 'hello',
    name: 'Type "hello"',
    keys: ['h', 'e', 'l', 'l', 'o'],
    type: 'sequence',
    timeout: 1000
  },
  // Custom hold sequence
  {
    id: 'custom-hold',
    name: `Custom Hold (${customHoldTime}ms)`,
    keys: [{ key: 'x', minHoldTime: customHoldTime }],
    type: 'hold'
  }
];

// Memoized progress bar component to prevent unnecessary re-renders
const HoldProgressBar = memo(({ 
  sequenceId, 
  activeHolds, 
  animationTick 
}: { 
  sequenceId: string; 
  activeHolds: Map<string, { startTime: number; minHoldTime: number }>;
  animationTick: number;
}) => {
  const holdInfo = activeHolds.get(sequenceId);
  const progress = holdInfo 
    ? Math.min(100, Math.max(0, ((Date.now() - holdInfo.startTime) / holdInfo.minHoldTime) * 100))
    : 0;
  
  return (
    <div 
      className="charge-fill"
      style={{
        width: `${progress}%`,
        backgroundColor: sequenceId.includes('charge') ? '#3eaf7c' : 
                        sequenceId.includes('power') ? '#e74c3c' :
                        sequenceId.includes('heavy') ? '#f39c12' :
                        sequenceId.includes('special') ? '#9b59b6' :
                        sequenceId.includes('custom') ? '#3498db' : '#3eaf7c',
        transition: 'none'
      }}
    />
  );
});

export default function InteractiveDemo() {
  const [excludeInputs, setExcludeInputs] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [showSequences, setShowSequences] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(true);
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [matchedSequences, setMatchedSequences] = useState<MatchedSequence[]>([]);
  const [customSequence, setCustomSequence] = useState('');
  const [recordingSequence, setRecordingSequence] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [customSequences, setCustomSequences] = useState<SequenceDefinition[]>([]);
  const [snackbar, setSnackbar] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [activeHolds, setActiveHolds] = useState<Map<string, { startTime: number; minHoldTime: number }>>(new Map());
  const [customHoldTime, setCustomHoldTime] = useState(500);
  const [showCustomHold, setShowCustomHold] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const eventIdRef = useRef(0);
  const sequenceIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const activeHoldsRef = useRef<Map<string, { startTime: number; minHoldTime: number }>>(new Map());
  
  // Prevent default behavior for certain keys
  useEffect(() => {
    const preventDefaultKeys = ['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent navigation keys
      if (preventDefaultKeys.includes(e.key)) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Tab (browser tab switching)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+S (browser save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+O (browser open file)
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+P (browser print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+A (select all) - optional, remove if you want to allow it
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+R/F5 (refresh) - optional
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep activeHoldsRef in sync
  useEffect(() => {
    activeHoldsRef.current = activeHolds;
  }, [activeHolds]);

  // Smooth animation for hold progress
  useEffect(() => {
    let lastTime = 0;
    const animate = (currentTime: number) => {
      // Throttle to 60fps
      if (currentTime - lastTime >= 16) {
        if (activeHoldsRef.current.size > 0) {
          setAnimationTick(prev => prev + 1);
          lastTime = currentTime;
        }
      }
      
      if (activeHoldsRef.current.size > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };
    
    if (activeHolds.size > 0 && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (activeHolds.size === 0 && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [activeHolds.size]);

  // Performance metrics
  const [metrics, setMetrics] = useState({
    eventCount: 0,
    avgProcessTime: 0,
    lastProcessTime: 0
  });
  const processTimesRef = useRef<number[]>([]);

  const handleSequenceMatch = useCallback((match: MatchedSequence) => {
    setMatchedSequences(prev => [{
      ...match,
      id: ++sequenceIdRef.current
    }, ...prev].slice(0, 10));
    
    // If this is a hold match, remove it from activeHolds
    if (match.type === 'hold') {
      setActiveHolds(prev => {
        const newMap = new Map(prev);
        newMap.delete(match.sequenceId);
        return newMap;
      });
    }
  }, []);

  const [pressedKeyCodes, setPressedKeyCodes] = useState<Set<string>>(new Set());
  
  const { 
    lastEvent, 
    pressedKeys, 
    isKeyPressed, 
    activeModifiers,
    sequences
  } = useNormalizedKeys({ 
    excludeInputFields: excludeInputs,
    debug: debugMode,
    tapHoldThreshold: 200,
    preventDefault: true, // Prevent default browser shortcuts
    sequences: showSequences ? {
      sequences: [...getSequences(customHoldTime), ...customSequences],
      onSequenceMatch: handleSequenceMatch,
      debug: debugMode
    } : undefined
  });

  // Track event history and key codes
  useEffect(() => {
    if (lastEvent) {
      const startTime = performance.now();
      const id = ++eventIdRef.current;
      
      const now = new Date();
      setEventHistory(prev => [{
        id,
        ...lastEvent,
        time: now.toLocaleTimeString(),
        timestamp: now.getTime(),
        timeMs: now.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        })
      }, ...prev].slice(0, 100));

      // Record sequence if in recording mode
      if (recordingSequence && lastEvent.type === 'keydown') {
        setRecordedKeys(prev => [...prev, lastEvent.key]);
      }

      // Track hold progress
      if (lastEvent.type === 'keydown') {
        // Check if any hold sequences match this key
        [...getSequences(customHoldTime), ...customSequences].forEach(seq => {
          if (seq.type === 'hold') {
            const keyDef = seq.keys[0];
            const targetKey = typeof keyDef === 'string' ? keyDef : keyDef.key;
            const minHoldTime = typeof keyDef === 'object' ? keyDef.minHoldTime : 1000;
            
            if (targetKey === lastEvent.key) {
              // Check modifiers if specified
              if (typeof keyDef === 'object' && keyDef.modifiers) {
                const modsMatch = Object.entries(keyDef.modifiers).every(([mod, value]) => 
                  lastEvent.activeModifiers[mod as keyof typeof lastEvent.activeModifiers] === value
                );
                if (!modsMatch) return;
              }
              
              if (debugMode) {
                console.log(`[Demo] Starting hold tracking for ${seq.id}, key: ${targetKey}, minHoldTime: ${minHoldTime}`);
              }
              
              setActiveHolds(prev => {
                const newMap = new Map(prev);
                newMap.set(seq.id, { startTime: Date.now(), minHoldTime: minHoldTime || 1000 });
                return newMap;
              });
              
              // Don't set a timer to auto-remove - let the sequence match or keyup handle it
            }
          }
        });
      } else if (lastEvent.type === 'keyup') {
        // Clear holds for this key
        [...getSequences(customHoldTime), ...customSequences].forEach(seq => {
          if (seq.type === 'hold') {
            const keyDef = seq.keys[0];
            const targetKey = typeof keyDef === 'string' ? keyDef : keyDef.key;
            
            if (targetKey === lastEvent.key) {
              // Check modifiers if specified
              if (typeof keyDef === 'object' && keyDef.modifiers) {
                const modsMatch = Object.entries(keyDef.modifiers).every(([mod, value]) => 
                  lastEvent.activeModifiers[mod as keyof typeof lastEvent.activeModifiers] === value
                );
                if (!modsMatch) return;
              }
              
              setActiveHolds(prev => {
                const newMap = new Map(prev);
                newMap.delete(seq.id);
                return newMap;
              });
            }
          }
        });
      }

      // Update metrics
      const processTime = performance.now() - startTime;
      processTimesRef.current.push(processTime);
      if (processTimesRef.current.length > 100) {
        processTimesRef.current.shift();
      }

      setMetrics(prev => ({
        eventCount: prev.eventCount + 1,
        avgProcessTime: processTimesRef.current.reduce((a, b) => a + b, 0) / processTimesRef.current.length,
        lastProcessTime: processTime
      }));
      
      // Track key codes for virtual keyboard
      if (lastEvent.type === 'keydown') {
        setPressedKeyCodes(prev => new Set([...prev, lastEvent.code]));
      } else if (lastEvent.type === 'keyup') {
        setPressedKeyCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(lastEvent.code);
          return newSet;
        });
      }
    }
  }, [lastEvent, recordingSequence]);

  // Platform detection
  const platform = React.useMemo(() => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbar({ message, visible: true });
    setTimeout(() => setSnackbar({ message: '', visible: false }), 3000);
  };

  const startRecording = () => {
    setRecordingSequence(true);
    setRecordedKeys([]);
  };

  const stopRecording = () => {
    setRecordingSequence(false);
    if (recordedKeys.length > 0) {
      const sequenceDef: SequenceDefinition = {
        id: `custom-${Date.now()}`,
        name: 'Custom Sequence',
        keys: recordedKeys,
        type: 'sequence',
        timeout: 1000
      };
      sequences?.addSequence(sequenceDef);
      setCustomSequences(prev => [...prev, sequenceDef]);
      setCustomSequence(recordedKeys.join(' → '));
    }
  };

  const clearCustomSequences = () => {
    sequences?.clearSequences();
    getSequences(customHoldTime).forEach(seq => sequences?.addSequence(seq));
    setCustomSequences([]);
    setCustomSequence('');
  };

  return (
    <div className="demo-container">
      <header className="demo-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>useNormalizedKeys Interactive Demo</h1>
            <p className="demo-subtitle">
              A professional React hook for normalized keyboard input handling
            </p>
          </div>
          <a 
            href="../" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#3eaf7c',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Documentation
          </a>
        </div>
      </header>

      <div className="demo-info-bar">
        <span className="info-item">
          <strong>Platform:</strong> {platform}
        </span>
        <span className="info-item">
          <strong>Events:</strong> {metrics.eventCount}
        </span>
        <span className="info-item">
          <strong>Avg Process:</strong> {metrics.avgProcessTime.toFixed(2)}ms
        </span>
        <span className="info-item">
          <strong>Pressed Keys:</strong> {pressedKeys.size}
        </span>
      </div>

      <div className="demo-controls">
        <label className="control-item">
          <input 
            type="checkbox" 
            checked={excludeInputs}
            onChange={(e) => setExcludeInputs(e.target.checked)}
          />
          Exclude Input Fields
        </label>
        <label className="control-item">
          <input 
            type="checkbox" 
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
          />
          Debug Mode
        </label>
        <label className="control-item">
          <input 
            type="checkbox" 
            checked={showSequences}
            onChange={(e) => setShowSequences(e.target.checked)}
          />
          Enable Sequences
        </label>
        <label className="control-item">
          <input 
            type="checkbox" 
            checked={showDebugPanel}
            onChange={(e) => setShowDebugPanel(e.target.checked)}
          />
          Show Debug Panel
        </label>
        <div className="control-item status-indicator">
          <span className="status-label">preventDefault: </span>
          <span className="status-value enabled">✓ Enabled</span>
          <span className="status-description">
            (Browser shortcuts like F5, Ctrl+S, etc. are prevented)
          </span>
        </div>
      </div>

      <div className="demo-grid">
        {/* Virtual Keyboard */}
        <section className="demo-section keyboard-section">
          <h2>Virtual Keyboard</h2>
          <div className="keyboard">
            {KEYBOARD_LAYOUT.map((row, rowIdx) => (
              <div key={rowIdx} className="keyboard-row">
                {row.map((key, keyIdx) => (
                  <button
                    key={`${rowIdx}-${keyIdx}`}
                    className={`key key-${key.toLowerCase().replace(' ', 'space')} ${
                      isKeyPressed(key) ? 'active' : ''
                    } ${key.length > 1 ? 'special' : ''}`}
                    disabled
                  >
                    {key === ' ' ? 'Space' : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="numpad">
            <h3>Numpad</h3>
            <div className="numpad-grid">
              {/* Row 1 */}
              <button className={`key numpad-key ${pressedKeyCodes.has('NumLock') ? 'active' : ''}`} disabled>NumLock</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('NumpadDivide') ? 'active' : ''}`} disabled>/</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('NumpadMultiply') ? 'active' : ''}`} disabled>*</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('NumpadSubtract') ? 'active' : ''}`} disabled>-</button>
              
              {/* Row 2 */}
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad7') ? 'active' : ''}`} disabled>7</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad8') ? 'active' : ''}`} disabled>8</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad9') ? 'active' : ''}`} disabled>9</button>
              <button className={`key numpad-key numpad-tall ${pressedKeyCodes.has('NumpadAdd') ? 'active' : ''}`} disabled>+</button>
              
              {/* Row 3 */}
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad4') ? 'active' : ''}`} disabled>4</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad5') ? 'active' : ''}`} disabled>5</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad6') ? 'active' : ''}`} disabled>6</button>
              
              {/* Row 4 */}
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad1') ? 'active' : ''}`} disabled>1</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad2') ? 'active' : ''}`} disabled>2</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('Numpad3') ? 'active' : ''}`} disabled>3</button>
              <button className={`key numpad-key numpad-tall ${pressedKeyCodes.has('NumpadEnter') ? 'active' : ''}`} disabled>Enter</button>
              
              {/* Row 5 */}
              <button className={`key numpad-key numpad-wide ${pressedKeyCodes.has('Numpad0') ? 'active' : ''}`} disabled>0</button>
              <button className={`key numpad-key ${pressedKeyCodes.has('NumpadDecimal') ? 'active' : ''}`} disabled>.</button>
            </div>
          </div>
        </section>

        {/* Current State */}
        <section className="demo-section state-section">
          <h2>Current State</h2>
          
          <div className="state-box">
            <h3>Active Modifiers</h3>
            <div className="modifier-grid">
              {Object.entries(activeModifiers).map(([mod, active]) => (
                <div key={mod} className={`modifier ${active ? 'active' : ''}`}>
                  {mod}
                </div>
              ))}
            </div>
          </div>

          <div className="state-box">
            <h3>Last Event</h3>
            {lastEvent ? (
              <div className="event-details">
                <div><strong>Type:</strong> <span className={`event-type-${lastEvent.type}`}>{lastEvent.type}</span></div>
                <div><strong>Key:</strong> {lastEvent.key} {lastEvent.originalKey !== lastEvent.key && `(original: ${lastEvent.originalKey})`}</div>
                <div><strong>Code:</strong> {lastEvent.code}</div>
                {Object.entries(lastEvent.activeModifiers).some(([_, active]) => active) && (
                  <div>
                    <strong>Active Modifiers:</strong> {Object.entries(lastEvent.activeModifiers)
                      .filter(([_, active]) => active)
                      .map(([mod]) => mod.charAt(0).toUpperCase() + mod.slice(1))
                      .join(', ')}
                  </div>
                )}
                {lastEvent.isModifier && <div className="event-tag">Modifier</div>}
                {lastEvent.isRepeat && <div className="event-tag">Repeat</div>}
                {lastEvent.isNumpad && <div className="event-tag">Numpad</div>}
                {lastEvent.duration && (
                  <div>
                    <strong>Duration:</strong> {lastEvent.duration}ms
                    {lastEvent.isTap && ' (tap)'}
                    {lastEvent.isHold && ' (hold)'}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data">Press any key to start</div>
            )}
          </div>

          <div className="state-box">
            <h3>Pressed Keys ({pressedKeys.size})</h3>
            <div className="pressed-keys">
              {pressedKeys.size === 0 ? (
                <div className="no-data">No keys pressed</div>
              ) : (
                Array.from(pressedKeys).map(key => (
                  <span key={key} className="pressed-key">{key}</span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Event History */}
        <section className="demo-section history-section">
          <h2>Event History</h2>
          <div className="history-container">
            <div className="history-content">
              <div className="event-history">
                {eventHistory.length === 0 ? (
                  <div className="no-data">No events yet</div>
                ) : (
                  eventHistory.slice(0, 20).map(event => (
                    <div key={event.id} className={`history-item event-${event.type}`}>
                      <span className="event-time">{event.timeMs || event.time}</span>
                      <span className={`event-type event-type-${event.type}`}>{event.type}</span>
                      <span className="event-key">{event.key}</span>
                      <span className="event-code">{event.code}</span>
                      <span className="event-duration">
                        {event.duration !== undefined ? `${event.duration}ms` : ''}
                      </span>
                      <span className="event-badges">
                        {event.isTap && <span className="event-badge tap">TAP</span>}
                        {event.isHold && <span className="event-badge hold">HOLD</span>}
                        {event.isModifier && <span className="event-badge">MOD</span>}
                        {event.isRepeat && <span className="event-badge">REP</span>}
                        {event.isNumpad && <span className="event-badge">NUM</span>}
                        {event.preventedDefault && <span className="event-badge prevented">PREV</span>}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="history-controls">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const historyText = eventHistory.slice(0, 20).map(event => 
                    `${event.timeMs || event.time} ${event.type} ${event.key} ${event.code}${event.duration && event.type === 'keyup' ? ` ${event.duration}ms` : ''}${event.isTap ? ' [TAP]' : ''}${event.isHold ? ' [HOLD]' : ''}${event.isModifier ? ' [MOD]' : ''}${event.isRepeat ? ' [REP]' : ''}${event.isNumpad ? ' [NUM]' : ''}${event.preventedDefault ? ' [PREV]' : ''}`
                  ).join('\n');
                  
                  navigator.clipboard.writeText(historyText).then(() => {
                    showSnackbar('📋 Copied to clipboard!');
                  }).catch(err => {
                    console.error('Failed to copy:', err);
                    showSnackbar('❌ Failed to copy to clipboard');
                  });
                }}
              >
                <span className="btn-icon">📋</span>
                Copy
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEventHistory([]);
                  showSnackbar('🗑️ History cleared!');
                }}
              >
                <span className="btn-icon">🗑️</span>
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* Hold Detection Examples */}
        {showSequences && (
          <section className="demo-section hold-examples-section">
            <h2>Hold Detection Examples</h2>
            <div className="hold-examples-grid">
              <div className="hold-example">
                <h3>🎮 Charge Jump</h3>
                <p>Hold Space to charge your jump</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <HoldProgressBar 
                      sequenceId="charge-jump" 
                      activeHolds={activeHolds} 
                      animationTick={animationTick}
                    />
                  </div>
                  <span className="hold-key">Hold SPACE</span>
                </div>
              </div>
              
              <div className="hold-example">
                <h3>⚔️ Power Attack</h3>
                <p>Hold F to charge a powerful attack</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <HoldProgressBar 
                      sequenceId="power-attack" 
                      activeHolds={activeHolds} 
                      animationTick={animationTick}
                    />
                  </div>
                  <span className="hold-key">Hold F</span>
                </div>
              </div>

              <div className="hold-example">
                <h3>🥊 Heavy Punch</h3>
                <p>Fighting game style heavy attack</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <HoldProgressBar 
                      sequenceId="heavy-punch" 
                      activeHolds={activeHolds} 
                      animationTick={animationTick}
                    />
                  </div>
                  <span className="hold-key">Hold H</span>
                </div>
              </div>

              <div className="hold-example">
                <h3>✨ Special Move</h3>
                <p>Complex fighting game combo</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <HoldProgressBar 
                      sequenceId="special-move" 
                      activeHolds={activeHolds} 
                      animationTick={animationTick}
                    />
                  </div>
                  <span className="hold-key">Hold CTRL+S</span>
                </div>
              </div>
            </div>
            
            {/* Custom Hold Configuration */}
            <div className="custom-hold-config">
              <h3>🔧 Custom Hold Configuration</h3>
              <div className="config-controls">
                <label>
                  Hold Duration (ms):
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="50"
                    value={customHoldTime} 
                    onChange={(e) => setCustomHoldTime(Number(e.target.value))}
                  />
                  <span className="config-value">{customHoldTime}ms</span>
                </label>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <HoldProgressBar 
                      sequenceId="custom-hold" 
                      activeHolds={activeHolds} 
                      animationTick={animationTick}
                    />
                  </div>
                  <span className="hold-key">Hold X to test custom duration</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sequence Detection */}
        {showSequences && (
          <section className="demo-section sequence-section">
            <h2>Sequence Detection</h2>
            
            <div className="sequence-controls">
              {!recordingSequence ? (
                <button onClick={startRecording} className="btn btn-primary">
                  Record Custom Sequence
                </button>
              ) : (
                <button onClick={stopRecording} className="btn btn-danger">
                  Stop Recording ({recordedKeys.length} keys)
                </button>
              )}
              <button onClick={clearCustomSequences} className="btn btn-secondary">
                Reset Custom Sequences
              </button>
            </div>

            {customSequence && (
              <div className="custom-sequence">
                <strong>Custom:</strong> {customSequence}
              </div>
            )}

            <div className="sequence-list">
              <h3>Available Sequences</h3>
              {[...getSequences(customHoldTime), ...customSequences].map(seq => {
                const holdInfo = activeHolds.get(seq.id);
                const isHolding = !!holdInfo;
                const progress = isHolding ? 
                  Math.min(100, Math.max(0, ((Date.now() - holdInfo.startTime) / holdInfo.minHoldTime) * 100)) : 0;
                
                return (
                  <div key={seq.id} className="sequence-item" style={{ position: 'relative' }}>
                    {isHolding && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(to right, rgba(62, 175, 124, 0.2) ${progress}%, transparent ${progress}%)`,
                          borderRadius: '4px',
                          transition: 'none'
                        }}
                      />
                    )}
                    <strong>{seq.name}:</strong> {
                      (() => {
                        if (seq.type === 'hold') {
                          const keyDef = seq.keys[0];
                          const key = typeof keyDef === 'string' ? keyDef : keyDef.key;
                          const displayKey = key === ' ' ? 'SPACE' : key.toUpperCase();
                          const holdTime = typeof keyDef === 'object' ? keyDef.minHoldTime : 1000;
                          const modifiers = typeof keyDef === 'object' && keyDef.modifiers ? 
                            Object.entries(keyDef.modifiers)
                              .filter(([_, v]) => v)
                              .map(([k]) => k === 'ctrl' ? 'CTRL' : k.toUpperCase())
                              .join('+') + '+' : '';
                          return `Hold ${modifiers}${displayKey} (${holdTime}ms)`;
                        } else if (seq.type === 'chord') {
                          return seq.keys.map(k => {
                            const key = typeof k === 'string' ? k : k.key;
                            return key === 'Control' ? 'Ctrl' : key;
                          }).join(' + ');
                        } else {
                          return seq.keys.map(k => {
                            const key = typeof k === 'string' ? k : k.key;
                            return key;
                          }).join(' → ');
                        }
                      })()
                    }
                    <span className="sequence-type">{seq.type}</span>
                    {isHolding && (
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: '#3eaf7c' }}>
                        {Math.round(progress)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="matched-sequences">
              <h3>Matched Sequences</h3>
              {matchedSequences.length === 0 ? (
                <div className="no-data">Try typing one of the sequences above!</div>
              ) : (
                matchedSequences.map(match => (
                  <div key={match.id} className="match-item">
                    <strong>{match.sequenceName || match.sequenceId}</strong>
                    <span className="match-time">{match.duration}ms</span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Debug Panel */}
        {showDebugPanel && showSequences && sequences?.debugState && (
          <section className="demo-section debug-section">
            <h2>Sequence Detection Debug Panel</h2>
            
            <div className="debug-grid">
              {/* Current Sequence */}
              <div className="debug-box">
                <h3>Current Sequence</h3>
                {sequences.debugState.currentSequence.length === 0 ? (
                  <div className="no-data">No active sequence</div>
                ) : (
                  <div className="sequence-debug">
                    <div className="debug-item">
                      <strong>Keys:</strong> {sequences.debugState.currentSequence.map(e => e.key).join(' → ')}
                    </div>
                    <div className="debug-item">
                      <strong>Started:</strong> {
                        sequences.debugState.sequenceStartTime 
                          ? `${Date.now() - sequences.debugState.sequenceStartTime}ms ago`
                          : 'N/A'
                      }
                    </div>
                    <div className="debug-item">
                      <strong>Last Key:</strong> {Date.now() - sequences.debugState.lastKeyTime}ms ago
                    </div>
                    <div className="debug-item">
                      <strong>Length:</strong> {sequences.debugState.currentSequence.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Chord Detection */}
              <div className="debug-box">
                <h3>Chord Detection</h3>
                <div className="debug-item">
                  <strong>Active Keys:</strong> {
                    sequences.debugState.activeChordKeys.size === 0 
                      ? 'None'
                      : Array.from(sequences.debugState.activeChordKeys).join(' + ')
                  }
                </div>
                <div className="debug-item">
                  <strong>Potential Chord:</strong> {
                    sequences.debugState.potentialChord.length === 0
                      ? 'None'
                      : sequences.debugState.potentialChord.map(e => e.key).join(' + ')
                  }
                </div>
                <div className="debug-item">
                  <strong>Chord Started:</strong> {
                    sequences.debugState.chordStartTime 
                      ? `${Date.now() - sequences.debugState.chordStartTime}ms ago`
                      : 'N/A'
                  }
                </div>
                <div className="debug-item">
                  <strong>Already Matched:</strong> {sequences.debugState.chordMatched ? 'Yes' : 'No'}
                </div>
              </div>

              {/* Hold Detection */}
              <div className="debug-box">
                <h3>Hold Detection</h3>
                {sequences.debugState.heldKeys.size === 0 ? (
                  <div className="no-data">No keys being held</div>
                ) : (
                  <div className="held-keys">
                    {Array.from(sequences.debugState.heldKeys.entries()).map(([key, data]) => (
                      <div key={key} className="debug-item">
                        <strong>{key}:</strong> {Date.now() - data.startTime}ms
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Matches */}
              <div className="debug-box">
                <h3>Recent Matches ({sequences.debugState.recentMatches.length})</h3>
                {sequences.debugState.recentMatches.length === 0 ? (
                  <div className="no-data">No recent matches</div>
                ) : (
                  <div className="recent-matches">
                    {sequences.debugState.recentMatches.slice(0, 5).map((match, index) => (
                      <div key={index} className="debug-item">
                        <strong>{match.sequenceName || match.sequenceId}:</strong> {match.duration}ms ago
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="debug-note">
              <em>Debug panel shows real-time internal state of sequence detection engine. 
              Enable debug mode and sequence detection to see data.</em>
            </div>
          </section>
        )}

        {/* Test Input */}
        <section className="demo-section input-section">
          <h2>Test Input Field</h2>
          <input 
            type="text" 
            className="test-input"
            placeholder={excludeInputs ? "Keys typed here are NOT tracked" : "Keys typed here ARE tracked"}
          />
          <textarea 
            className="test-textarea"
            placeholder={excludeInputs ? "Text area input is NOT tracked" : "Text area input IS tracked"}
            rows={3}
          />
        </section>
      </div>

      {/* Platform Quirks */}
      <section className="demo-section quirks-section">
        <h2>Platform-Specific Features</h2>
        <div className="quirks-info">
          {platform === 'Windows' && (
            <div className="quirk-item">
              <h3>Windows Shift+Numpad Suppression</h3>
              <p>Try pressing Shift + Numpad keys. Phantom Shift events are automatically suppressed.</p>
            </div>
          )}
          {platform === 'macOS' && (
            <div className="quirk-item">
              <h3>macOS Meta Key Timeout</h3>
              <p>The Meta (Cmd) key is handled with special timeout logic for consistent behavior.</p>
            </div>
          )}
          <div className="quirk-item">
            <h3>Modifier Tap vs Hold</h3>
            <p>Tap or hold modifier keys to see duration detection (threshold: 200ms)</p>
          </div>
          <div className="quirk-item">
            <h3>NumLock State Detection</h3>
            <p>Numpad keys show different behavior based on NumLock state</p>
          </div>
        </div>
      </section>

      <footer className="demo-footer">
        <p>
          Built with React {React.version} • 
          {' '}Check console for debug output when debug mode is enabled
        </p>
      </footer>

      {/* Snackbar */}
      {snackbar.visible && (
        <div className="snackbar">
          {snackbar.message}
        </div>
      )}
    </div>
  );
}