import React, { useState, useCallback } from 'react';
import { 
  NormalizedKeysProvider, 
  SequenceDefinition,
  holdSequence,
  comboSequence,
  chordSequence,
  MatchedSequence,
  Keys
} from '../src';
import InteractiveDemo from './InteractiveDemo';

// Predefined sequences for demo
const getBaseSequences = (): SequenceDefinition[] => [
  // Combo sequences
  comboSequence('konami', [Keys.ARROW_UP, Keys.ARROW_UP, Keys.ARROW_DOWN, Keys.ARROW_DOWN, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.ARROW_LEFT, Keys.ARROW_RIGHT, Keys.b, Keys.a], {
    name: 'Konami Code',
    timeout: 2000
  }),
  
  // Chord sequences
  chordSequence('save', [Keys.CONTROL, Keys.s], { name: 'Save (Ctrl+S)' }),
  chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy (Ctrl+C)' }),
  chordSequence('paste', [Keys.CONTROL, Keys.v], { name: 'Paste (Ctrl+V)' }),
  chordSequence('undo', [Keys.CONTROL, Keys.z], { name: 'Undo (Ctrl+Z)' }),
  chordSequence('select-all', [Keys.CONTROL, Keys.a], { name: 'Select All (Ctrl+A)' }),
  
  // Hold sequences
  holdSequence('charge-jump', Keys.SPACE, 750, { name: 'Charge Jump (Hold Space)' }),
  holdSequence('power-attack', Keys.f, 1000, { name: 'Power Attack (Hold F)' }),
  holdSequence('heavy-punch', Keys.h, 2000, { name: 'Heavy Punch (Hold H)' }),
  holdSequence('special-move', Keys.q, 600, { 
    name: 'Special Move (Hold Ctrl+Q)',
    modifiers: { ctrl: true }
  }),
  
  // Regular sequences
  comboSequence('vim-escape', [Keys.j, Keys.k], {
    name: 'Vim Escape (jk)',
    timeout: 300
  }),
  comboSequence('hello', [Keys.h, Keys.e, Keys.l, Keys.l, Keys.o], {
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
  const [preventDefault, setPreventDefault] = useState(true);
  const [customHoldTime, setCustomHoldTime] = useState(500);
  const [customSequences, setCustomSequences] = useState<SequenceDefinition[]>([]);
  const [matchedSequences, setMatchedSequences] = useState<MatchedSequence[]>([]);
  
  // Build sequences array including custom hold
  const sequences = React.useMemo(() => {
    const base = getBaseSequences();
    const customHold = holdSequence('custom-hold', Keys.x, customHoldTime, {
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
    preventDefault,
    setPreventDefault,
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
      preventDefault={preventDefault}
      sequences={showSequences ? sequences : undefined}
      onSequenceMatch={handleSequenceMatch}
    >
      <InteractiveDemo {...demoProps} />
    </NormalizedKeysProvider>
  );
}