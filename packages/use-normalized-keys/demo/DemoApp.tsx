import React, { useState, useCallback } from 'react';
import { 
  NormalizedKeysProvider, 
  SequenceDefinition,
  holdSequence,
  comboSequence,
  chordSequence,
  MatchedSequence
} from '../src';
import InteractiveDemo from './InteractiveDemo';

// Predefined sequences for demo
const getBaseSequences = (): SequenceDefinition[] => [
  // Combo sequences
  comboSequence('konami', ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], {
    name: 'Konami Code',
    timeout: 2000
  }),
  
  // Chord sequences
  chordSequence('save', ['Control', 's'], { name: 'Save (Ctrl+S)' }),
  chordSequence('copy', ['Control', 'c'], { name: 'Copy (Ctrl+C)' }),
  chordSequence('paste', ['Control', 'v'], { name: 'Paste (Ctrl+V)' }),
  chordSequence('undo', ['Control', 'z'], { name: 'Undo (Ctrl+Z)' }),
  chordSequence('select-all', ['Control', 'a'], { name: 'Select All (Ctrl+A)' }),
  
  // Hold sequences
  holdSequence('charge-jump', ' ', 750, { name: 'Charge Jump (Hold Space)' }),
  holdSequence('power-attack', 'f', 1000, { name: 'Power Attack (Hold F)' }),
  holdSequence('heavy-punch', 'h', 2000, { name: 'Heavy Punch (Hold H)' }),
  holdSequence('special-move', 'q', 600, { 
    name: 'Special Move (Hold Ctrl+Q)',
    modifiers: { ctrl: true }
  }),
  
  // Regular sequences
  comboSequence('vim-escape', ['j', 'k'], {
    name: 'Vim Escape (jk)',
    timeout: 300
  }),
  comboSequence('hello', ['h', 'e', 'l', 'l', 'o'], {
    name: 'Type "hello"',
    timeout: 1000
  }),
];

/**
 * Main demo application that manages all state and provides it through Context
 */
export default function DemoApp() {
  // Demo configuration state
  const [excludeInputs, setExcludeInputs] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [showSequences, setShowSequences] = useState(true);
  const [customHoldTime, setCustomHoldTime] = useState(500);
  const [customSequences, setCustomSequences] = useState<SequenceDefinition[]>([]);
  const [matchedSequences, setMatchedSequences] = useState<MatchedSequence[]>([]);
  
  // Build sequences array including custom hold
  const sequences = React.useMemo(() => {
    const base = getBaseSequences();
    const customHold = holdSequence('custom-hold', 'x', customHoldTime, {
      name: `Custom Hold (${customHoldTime}ms)`
    });
    return [...base, customHold, ...customSequences];
  }, [customHoldTime, customSequences]);

  // Handle sequence matches
  const handleSequenceMatch = useCallback((match: MatchedSequence) => {
    console.log('Sequence matched:', match);
    setMatchedSequences(prev => [...prev, match]);
  }, []);

  // Props to pass down to InteractiveDemo
  const demoProps = {
    excludeInputs,
    setExcludeInputs,
    debugMode,
    setDebugMode,
    showSequences,
    setShowSequences,
    customHoldTime,
    setCustomHoldTime,
    customSequences,
    setCustomSequences,
    matchedSequences,
    sequences,
  };

  return (
    <NormalizedKeysProvider
      excludeInputFields={excludeInputs}
      debug={debugMode}
      tapHoldThreshold={200}
      preventDefault={true}
      sequences={showSequences ? {
        sequences,
        onSequenceMatch: handleSequenceMatch,
        debug: debugMode
      } : undefined}
    >
      <InteractiveDemo {...demoProps} />
    </NormalizedKeysProvider>
  );
}