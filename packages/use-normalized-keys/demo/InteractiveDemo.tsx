import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  useNormalizedKeysContext,
  useHoldSequence,
  SequenceDefinition, 
  MatchedSequence,
  CurrentHolds,
  Keys
} from '../src';
import './InteractiveDemo.css';

// This custom hook has been replaced by the unified useHoldSequence hook

// Charge Jump Indicator using unified hook
function ChargeJumpIndicator() {
  const chargeJumpHook = useHoldSequence('charge-jump');
  
  return (
    <div className="hold-indicator">
      <div className="charge-meter">
        <div 
          className="charge-fill"
          style={{
            width: `${chargeJumpHook.progress}%`,
            backgroundColor: chargeJumpHook.isReady ? '#10b981' : '#3eaf7c',
            boxShadow: `0 0 ${chargeJumpHook.glow * 20}px rgba(62, 175, 124, 0.6)`,
            transform: `scaleY(${chargeJumpHook.scale}) translateX(${chargeJumpHook.shake}px)`,
            opacity: chargeJumpHook.opacity,
            transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out, background-color 0.1s ease-out, opacity 0.1s ease-out'
          }}
        />
      </div>
      <div className="hold-info">
        <span className="hold-key">Hold SPACE</span>
        {chargeJumpHook.isCharging && !chargeJumpHook.isReady && <span className="charging-text">⚡ Charging...</span>}
        {chargeJumpHook.isReady && <span className="ready-text">✨ Ready!</span>}
      </div>
      {chargeJumpHook.isHolding && (
        <div className="hold-stats">
          <span>{Math.round(chargeJumpHook.progress)}%</span>
        </div>
      )}
    </div>
  );
}

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

interface InteractiveDemoProps {
  excludeInputs: boolean;
  setExcludeInputs: (value: boolean) => void;
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
  showSequences: boolean;
  setShowSequences: (value: boolean) => void;
  preventDefault: boolean;
  setPreventDefault: (value: boolean) => void;
  customHoldTime: number;
  setCustomHoldTime: (value: number) => void;
  customSequences: SequenceDefinition[];
  setCustomSequences: (value: SequenceDefinition[]) => void;
  matchedSequences: MatchedSequence[];
  sequences: SequenceDefinition[];
}

export default function InteractiveDemo({
  excludeInputs,
  setExcludeInputs,
  debugMode,
  setDebugMode,
  showSequences,
  setShowSequences,
  preventDefault,
  setPreventDefault,
  customHoldTime,
  setCustomHoldTime,
  customSequences,
  setCustomSequences,
  matchedSequences,
  sequences,
}: InteractiveDemoProps) {
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [recordingSequence, setRecordingSequence] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [customSequence, setCustomSequence] = useState('');
  const [pressedKeyCodes, setPressedKeyCodes] = useState<Set<string>>(new Set());
  const eventIdRef = useRef(0);
  const sequenceIdRef = useRef(0);
  
  // Performance metrics
  const [metrics, setMetrics] = useState({
    eventCount: 0,
    avgProcessTime: 0,
    lastProcessTime: 0
  });
  const processTimesRef = useRef<number[]>([]);

  const handleSequenceMatch = useCallback((match: MatchedSequence) => {
    // This function is handled by DemoApp component now
    // but we keep the interface for potential local handling
  }, []);

  // Get state from Context - this will throw if not in Provider (which is what we want)
  const contextState = useNormalizedKeysContext();
  
  if (!contextState) {
    throw new Error(
      'InteractiveDemo must be used within a NormalizedKeysProvider. ' +
      'The demo requires the Context Provider to function properly.'
    );
  }
  
  const { 
    lastEvent, 
    pressedKeys, 
    isKeyPressed, 
    activeModifiers,
    sequences: sequenceApi,
    currentHolds
  } = contextState;

  // Use the unified hook for all hold detection examples
  const powerAttackHook = useHoldSequence('power-attack');
  const heavyPunchHook = useHoldSequence('heavy-punch');
  const specialMoveHook = useHoldSequence('special-move');
  const customHoldHook = useHoldSequence('custom-hold');

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
        type: 'combo',
        timeout: 1000
      };
      // Add to parent component sequences
      setCustomSequences(prev => [...prev, sequenceDef]);
      setCustomSequence(recordedKeys.join(' → '));
      showSnackbar(`✅ Created sequence: ${recordedKeys.join(' → ')}`);
    }
  };

  const clearCustomSequences = () => {
    setCustomSequences([]);
    setCustomSequence('');
    showSnackbar('🗑️ Custom sequences cleared');
  };

  // Key display helper
  const getKeyDisplay = (key: string) => {
    if (key === ' ') return 'Space';
    if (key === 'Control') return 'Ctrl';
    if (key === 'Meta') return platform === 'macOS' ? '⌘' : '⊞';
    if (key === 'Alt') return platform === 'macOS' ? '⌥' : 'Alt';
    if (key === 'Shift') return '⇧';
    if (key === 'CapsLock') return '⇪';
    if (key === 'Enter') return '⏎';
    if (key === 'Backspace') return '⌫';
    if (key === 'Tab') return '⇥';
    if (key === 'Escape') return 'Esc';
    return key;
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
            checked={preventDefault}
            onChange={(e) => setPreventDefault(e.target.checked)}
          />
          Prevent Default (Browser shortcuts like F5, Ctrl+S, etc.)
        </label>
      </div>

      <div className="demo-grid">
        {/* Virtual Keyboard */}
        <section className="demo-section keyboard-section">
          <h2>Virtual Keyboard</h2>
          <div className="keyboard-container">
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
                {lastEvent.isRepeat && <div className="event-tag">Repeat</div>}
                {lastEvent.isNumpad && <div className="event-tag">Numpad</div>}
                <div>
                  <strong>Duration:</strong> {lastEvent.duration ? `${lastEvent.duration}ms` : 'N/A'}
                  {lastEvent.duration && lastEvent.isTap && ' (tap)'}
                  {lastEvent.duration && lastEvent.isHold && ' (hold)'}
                </div>
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
                <ChargeJumpIndicator />
              </div>
              
              <div className="hold-example">
                <h3>⚔️ Power Attack</h3>
                <p>Hold F to charge a powerful attack</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <div 
                      className="charge-fill"
                      style={{
                        width: `${powerAttackHook.progress}%`,
                        backgroundColor: powerAttackHook.isReady ? '#dc2626' : '#ef4444',
                        boxShadow: `0 0 ${powerAttackHook.glow * 25}px rgba(239, 68, 68, 0.8)`,
                        transform: `scaleY(${powerAttackHook.scale}) translateX(${powerAttackHook.shake}px)`,
                        opacity: powerAttackHook.opacity,
                        transition: 'all 0.1s ease-out'
                      }}
                    />
                  </div>
                  <div className="hold-info">
                    <span className="hold-key">Hold F</span>
                    {powerAttackHook.isCharging && !powerAttackHook.isReady && <span className="charging-text">🔥 Charging...</span>}
                    {powerAttackHook.isReady && <span className="ready-text shake">💥 READY!</span>}
                  </div>
                  {powerAttackHook.isHolding && (
                    <div className="hold-stats">
                      <span>{Math.round(powerAttackHook.progress)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="hold-example">
                <h3>🥊 Heavy Punch</h3>
                <p>Fighting game style heavy attack</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <div 
                      className="charge-fill"
                      style={{
                        width: `${heavyPunchHook.progress}%`,
                        backgroundColor: heavyPunchHook.isReady ? '#ea580c' : '#f59e0b',
                        boxShadow: `0 0 ${heavyPunchHook.glow * 15}px rgba(245, 158, 11, 0.7)`,
                        transform: `scaleY(${heavyPunchHook.scale}) translateX(${heavyPunchHook.shake}px)`,
                        opacity: heavyPunchHook.opacity,
                        transition: 'transform 0.05s ease-out'
                      }}
                    />
                  </div>
                  <div className="hold-info">
                    <span className="hold-key">Hold H</span>
                    {heavyPunchHook.isAnimating && !heavyPunchHook.isReady && <span className="charging-text">👊 Winding up...</span>}
                    {heavyPunchHook.isReady && <span className="ready-text">🥊 PUNCH!</span>}
                  </div>
                </div>
              </div>

              <div className="hold-example">
                <h3>✨ Special Move</h3>
                <p>Complex fighting game combo</p>
                <div className="hold-indicator">
                  <div className="charge-meter">
                    <div 
                      className="charge-fill"
                      style={{
                        width: `${specialMoveHook.progress}%`,
                        backgroundColor: specialMoveHook.isReady ? '#7c3aed' : '#a855f7',
                        boxShadow: `0 0 ${specialMoveHook.glow * 30}px rgba(168, 85, 247, 0.9)`,
                        transform: `scaleY(${specialMoveHook.scale}) translateX(${specialMoveHook.shake}px)`,
                        opacity: specialMoveHook.opacity,
                        transition: 'all 0.1s ease-out'
                      }}
                    />
                  </div>
                  <div className="hold-info">
                    <span className="hold-key">Hold CTRL+Q</span>
                    {specialMoveHook.isCharging && !specialMoveHook.isReady && <span className="charging-text">⚡ Channeling...</span>}
                    {specialMoveHook.isReady && <span className="ready-text rainbow">🌟 SPECIAL!</span>}
                  </div>
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
                    <div 
                      className="charge-fill"
                      style={{
                        width: `${customHoldHook.progress}%`,
                        backgroundColor: customHoldHook.isReady ? '#0891b2' : '#3b82f6',
                        boxShadow: `0 0 ${customHoldHook.glow * 20}px rgba(59, 130, 246, 0.7)`,
                        transform: `scaleY(${customHoldHook.scale}) translateX(${customHoldHook.shake}px)`,
                        opacity: customHoldHook.opacity,
                        transition: 'all 0.1s ease-out'
                      }}
                    />
                  </div>
                  <div className="hold-info">
                    <span className="hold-key">Hold X to test custom duration</span>
                    {customHoldHook.isHolding && (
                      <span className="timing-info">{customHoldHook.elapsedTime}ms / {customHoldHook.minHoldTime}ms</span>
                    )}
                  </div>
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

            <div className="sequences-grid">
              <div className="sequence-list">
                <h3>Available Sequences</h3>
                {sequences.map(seq => {
                  const holdInfo = currentHolds.get(seq.id);
                  const isHolding = !!holdInfo;
                  const progress = isHolding ? holdInfo.progressPercent : 0;
                  
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
                            background: `linear-gradient(to right, rgba(59, 130, 246, 0.1) ${progress}%, transparent ${progress}%)`,
                            borderRadius: '6px',
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                      <div className="sequence-content">
                        <div className="sequence-main">
                          <span className="sequence-name">{seq.name || seq.id}</span>
                          <span className="sequence-type-badge">
                            {seq.type === 'hold' && <span className="sequence-type">Hold</span>}
                            {seq.type === 'chord' && <span className="sequence-type">Chord</span>}
                            {seq.type === 'combo' && <span className="sequence-type">Combo</span>}
                          </span>
                        </div>
                        <div className="sequence-keys-row">
                          <span className="sequence-keys">{seq.keys.map(key => {
                            const formatKey = (keyStr: string) => {
                              // Replace arrow key names with actual arrows
                              const arrowMap: { [key: string]: string } = {
                                [Keys.ARROW_UP]: '↑',
                                [Keys.ARROW_DOWN]: '↓', 
                                [Keys.ARROW_LEFT]: '←',
                                [Keys.ARROW_RIGHT]: '→',
                                [Keys.SPACE]: 'Space'
                              };
                              return arrowMap[keyStr] || keyStr;
                            };
                            
                            if (typeof key === 'string') return formatKey(key);
                            
                            // Handle SequenceKey objects with modifiers
                            const modifiers = [];
                            if (key.modifiers?.ctrl) modifiers.push('Ctrl');
                            if (key.modifiers?.shift) modifiers.push('Shift');
                            if (key.modifiers?.alt) modifiers.push('Alt');
                            if (key.modifiers?.meta) modifiers.push('Meta');
                            
                            const formattedKey = formatKey(key.key);
                            return modifiers.length > 0 ? `${modifiers.join('+')}+${formattedKey}` : formattedKey;
                          }).join(' ')}</span>
                          {isHolding && <span className="sequence-progress">{Math.round(progress)}%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="matched-sequences">
                <h3>Matched Sequences</h3>
                {matchedSequences.slice().reverse().map((match, index) => (
                  <div key={`${match.sequenceId}-${match.matchedAt}`} className="match-item">
                    <span className="match-name">{match.sequenceName || match.sequenceId}</span>
                    <span className="match-time">{new Date(match.matchedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
                {matchedSequences.length === 0 && (
                  <div className="no-data">No sequences matched yet</div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Test Input */}
        <section className="demo-section input-section">
          <h2>Test Input Field</h2>
          <p>Type here to test the "Exclude Input Fields" option:</p>
          <input 
            type="text" 
            className="test-input"
            placeholder={excludeInputs ? "Keys won't be captured while typing here" : "Keys will still be captured"}
          />
          <textarea 
            className="test-textarea"
            placeholder={excludeInputs ? "Keyboard events excluded in textareas too" : "Keyboard events still captured"}
            rows={3}
          />
        </section>


        {/* Platform Info */}
        <section className="demo-section platform-section">
          <h2>Platform-Specific Features</h2>
          <div className="quirks-info">
            <div className="quirk-item">
              <h3>Platform Info</h3>
              <div className="info-item">
                <strong>Platform:</strong> {platform}
              </div>
              <div className="info-item">
                <strong>Events:</strong> {metrics.eventCount}
              </div>
              <div className="info-item">
                <strong>Avg Processing:</strong> {metrics.avgProcessTime?.toFixed(2) || '0.00'}ms
              </div>
            </div>
            {platform === 'Windows' && (
              <div className="quirk-item">
                <h3>Windows Shift Phantom Events</h3>
                <p>Phantom Shift events from Windows key combinations are automatically suppressed.</p>
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

      </div>

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