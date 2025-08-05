import React from 'react';
import { useHoldProgress, useHoldAnimation, useSequence } from '../src/hooks';
import type { CurrentHolds, MatchedSequence } from '../src';

// Simple progress bar using useHoldProgress
export function SimpleHoldProgress({ sequenceId, label }: { sequenceId: string; label: string }) {
  const { progress, isHolding, isComplete, remainingTime } = useHoldProgress(sequenceId);
  
  return (
    <div className="hold-example">
      <p>{label}</p>
      <div className="hold-indicator">
        <div className="charge-meter">
          <div 
            className="charge-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: isComplete ? '#27ae60' : '#3498db',
              transition: 'none'
            }}
          />
        </div>
        <span className="hold-status">
          {isHolding ? `${Math.ceil(remainingTime)}ms` : 'Ready'}
        </span>
      </div>
    </div>
  );
}

// Animated hold indicator using useHoldAnimation
export function AnimatedHoldIndicator({ sequenceId, label }: { sequenceId: string; label: string }) {
  const { progress, scale, opacity, glow, shake, isCharging, isReady } = useHoldAnimation(sequenceId);
  
  return (
    <div className="hold-example">
      <p>{label}</p>
      <div 
        className="animated-hold-indicator"
        style={{
          transform: `scale(${scale}) translateX(${shake}px)`,
          opacity,
          boxShadow: glow > 0 ? `0 0 ${20 * glow}px rgba(52, 152, 219, ${glow})` : 'none',
          border: '2px solid #3498db',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isReady ? '#27ae60' : isCharging ? '#3498db' : '#ecf0f1',
          transition: 'background-color 0.2s'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// Game-style sequence indicator using useSequence
export function GameSequenceIndicator({ sequenceId, label }: { sequenceId: string; label: string }) {
  const { 
    isHolding, 
    progress, 
    justStarted, 
    justCompleted, 
    justCancelled,
    matchCount 
  } = useSequence(sequenceId);
  
  return (
    <div className="hold-example">
      <p>{label}</p>
      <div className="game-sequence-indicator">
        {/* Progress bar */}
        <div className="charge-meter">
          <div 
            className="charge-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: '#9b59b6',
              transition: 'none'
            }}
          />
        </div>
        
        {/* Status messages */}
        <div className="sequence-status">
          {justStarted && <span className="status-flash">CHARGING!</span>}
          {justCompleted && <span className="status-flash success">READY!</span>}
          {justCancelled && <span className="status-flash cancelled">CANCELLED</span>}
          {!isHolding && !justCompleted && !justCancelled && (
            <span>Matches: {matchCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Combo sequence visualizer
export function ComboSequenceVisualizer({ 
  sequenceId, 
  keys, 
  label 
}: { 
  sequenceId: string; 
  keys: string[]; 
  label: string;
}) {
  const { lastMatch, matchCount } = useSequence(sequenceId);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  React.useEffect(() => {
    if (lastMatch && matchCount > 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastMatch, matchCount]);
  
  return (
    <div className="combo-example">
      <p>{label}</p>
      <div className="combo-keys">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <span className={`combo-key ${showSuccess ? 'success' : ''}`}>
              {key}
            </span>
            {index < keys.length - 1 && <span className="combo-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>
      {showSuccess && <div className="combo-success">✓ COMBO!</div>}
    </div>
  );
}