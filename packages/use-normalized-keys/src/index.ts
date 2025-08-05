import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  normalizeKey, 
  normalizeKeyCode, 
  isNumpadKey, 
  isModifierKey, 
  getModifierStates, 
  getNumpadKeyInfo 
} from './keyMappings';
import {
  Platform,
  createPlatformQuirkState,
  shouldSuppressWindowsShiftPhantom,
  setEventEmitter,
  handleMacOSMetaTimeout,
  validateKeyEventConsistency,
  cleanupPlatformQuirks,
  getPlatformDebugInfo
} from './platformQuirks';
import {
  SequenceOptions,
  SequenceState,
  MatchedSequence,
  SequenceDefinition,
  NormalizedKeyEvent,
  createSequenceState,
  processSequenceEvent,
  resetSequenceState,
  updateSequenceOptions
} from './sequenceDetection';

// Type definitions for key state tracking
interface KeyState {
  isDown: boolean;
  lastEventType: 'keydown' | 'keyup' | null;
  timestamp: number;
  pressTime?: number; // For tap-vs-hold detection
}

// Hold progress tracking
export interface HoldProgress {
  sequenceId: string;
  sequenceName?: string;
  key: string;
  startTime: number;
  minHoldTime: number;
  progress: number;
  progressPercent: number;
  elapsedTime: number;
  remainingTime: number;
  isComplete: boolean;
}

// Type alias for current holds map
export type CurrentHolds = Map<string, HoldProgress>;

// Hook return type definitions
export interface NormalizedKeyState {
  lastEvent: NormalizedKeyEvent | null;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
  activeModifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    caps: boolean;
    numLock: boolean;
    scrollLock: boolean;
  };
  sequences?: {
    matches: MatchedSequence[];
    addSequence: (definition: SequenceDefinition) => void;
    removeSequence: (id: string) => void;
    clearSequences: () => void;
    resetState: () => void;
    debugState?: {
      currentSequence: NormalizedKeyEvent[];
      sequenceStartTime: number | null;
      lastKeyTime: number;
      activeChordKeys: Set<string>;
      potentialChord: NormalizedKeyEvent[];
      chordStartTime: number | null;
      chordMatched: boolean;
      heldKeys: Map<string, { startTime: number; event: NormalizedKeyEvent }>;
      recentMatches: MatchedSequence[];
    };
  };
  currentHolds: CurrentHolds;
}

export interface UseNormalizedKeysOptions {
  enabled?: boolean;
  debug?: boolean;
  excludeInputFields?: boolean; // Option to disable input field exclusion
  tapHoldThreshold?: number; // Threshold in ms for tap vs hold detection (default: 200)
  sequences?: SequenceOptions; // Sequence detection configuration
  preventDefault?: boolean | string[]; // Prevent default for all keys (true) or specific combinations
}

// Utility function to check if target is an input field
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  
  const tagName = target.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = target.getAttribute('contenteditable') === 'true';
  
  return isInput || isContentEditable;
}

/**
 * Parses a key combination string into its components
 * Examples: "Ctrl+S" -> { ctrl: true, key: "s" }
 *           "Ctrl+Shift+N" -> { ctrl: true, shift: true, key: "n" }
 */
function parseKeyCombination(combination: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
} {
  const parts = combination.split('+').map(part => part.trim());
  const result = {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
    key: ''
  };
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    if (lowerPart === 'ctrl' || lowerPart === 'control') {
      result.ctrl = true;
    } else if (lowerPart === 'shift') {
      result.shift = true;
    } else if (lowerPart === 'alt') {
      result.alt = true;
    } else if (lowerPart === 'meta' || lowerPart === 'cmd' || lowerPart === 'command') {
      result.meta = true;
    } else {
      // This is the key itself
      result.key = part.toLowerCase();
    }
  }
  
  return result;
}

/**
 * Checks if an event matches a key combination string
 */
function matchesKeyCombination(event: KeyboardEvent, combination: string): boolean {
  const parsed = parseKeyCombination(combination);
  
  // Check modifiers
  if (parsed.ctrl !== event.ctrlKey) return false;
  if (parsed.shift !== event.shiftKey) return false;
  if (parsed.alt !== event.altKey) return false;
  if (parsed.meta !== event.metaKey) return false;
  
  // Check the key itself
  const eventKey = event.key.toLowerCase();
  const eventCode = event.code.toLowerCase();
  const targetKey = parsed.key;
  
  // Handle special cases for key matching
  if (targetKey === 'space' && (eventKey === ' ' || eventCode === 'space')) return true;
  if (targetKey === 'enter' && (eventKey === 'enter' || eventCode === 'enter')) return true;
  if (targetKey === 'escape' && (eventKey === 'escape' || eventCode === 'escape')) return true;
  if (targetKey === 'tab' && (eventKey === 'tab' || eventCode === 'tab')) return true;
  if (targetKey === 'backspace' && (eventKey === 'backspace' || eventCode === 'backspace')) return true;
  if (targetKey === 'delete' && (eventKey === 'delete' || eventCode === 'delete')) return true;
  
  // Handle function keys
  if (targetKey.startsWith('f') && targetKey.match(/^f\d+$/)) {
    return eventKey === targetKey || eventCode === targetKey;
  }
  
  // Standard key matching
  return eventKey === targetKey;
}

/**
 * Determines if preventDefault should be called for an event
 */
function shouldPreventDefault(
  event: KeyboardEvent, 
  preventDefault: boolean | string[] | undefined,
  excludeInputFields: boolean
): boolean {
  // Don't prevent default if preventDefault is not configured
  if (!preventDefault) return false;
  
  // Don't prevent default in input fields if exclusion is enabled
  if (excludeInputFields && isInputElement(event.target)) return false;
  
  // If preventDefault is true, prevent all events
  if (preventDefault === true) return true;
  
  // If preventDefault is an array, check if the event matches any combination
  if (Array.isArray(preventDefault)) {
    return preventDefault.some(combination => matchesKeyCombination(event, combination));
  }
  
  return false;
}

/**
 * A React hook for normalized keyboard input handling
 * Optimized for games and interactive applications with professional-grade features
 * 
 * Features:
 * - Global keyboard event capturing with capture phase
 * - Automatic input field detection and exclusion
 * - Cross-browser key normalization
 * - Platform-specific quirk handling
 * - Focus loss recovery and stuck key prevention
 * - Advanced modifier key management with tap-vs-hold detection
 * - High-performance state tracking with debounced repeat handling
 * 
 * @param options Configuration options for the hook
 * @returns Object containing normalized keyboard state and utilities
 */
export function useNormalizedKeys(options: UseNormalizedKeysOptions = {}): NormalizedKeyState {
  const { 
    enabled = true, 
    debug = false,
    excludeInputFields = true,
    tapHoldThreshold = 200,
    sequences,
    preventDefault
  } = options;
  
  // Internal state tracking using useRef to minimize re-renders
  const keyStatesRef = useRef<Map<string, KeyState>>(new Map());
  const debugCountersRef = useRef({ events: 0, suppressed: 0, quirksHandled: 0 });
  const platformQuirksRef = useRef(createPlatformQuirkState());
  const sequenceStateRef = useRef<SequenceState | null>(
    sequences ? createSequenceState({ ...sequences, debug }) : null
  );
  const sequencesClearedRef = useRef(false);
  
  // React state for consumer-relevant changes only
  const [lastEvent, setLastEvent] = useState<NormalizedKeyEvent | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [activeModifiers, setActiveModifiers] = useState({
    shift: false,
    ctrl: false,
    alt: false,
    meta: false,
    caps: false,
    numLock: false,
    scrollLock: false,
  });
  const [sequenceMatches, setSequenceMatches] = useState<MatchedSequence[]>([]);
  const [currentHolds, setCurrentHolds] = useState<CurrentHolds>(new Map());

  const isKeyPressed = useCallback((key: string): boolean => {
    return pressedKeys.has(key);
  }, [pressedKeys]);

  // Function to reset all key states (for focus loss recovery)
  const resetAllKeys = useCallback(() => {
    keyStatesRef.current.clear();
    setPressedKeys(new Set());
    setActiveModifiers({
      shift: false,
      ctrl: false,
      alt: false,
      meta: false,
      caps: false,
      numLock: false,
      scrollLock: false,
    });
    
    // Clean up platform-specific quirk state
    cleanupPlatformQuirks(platformQuirksRef.current);
    
    // Reset sequence state if enabled
    if (sequenceStateRef.current) {
      resetSequenceState(sequenceStateRef.current);
      setSequenceMatches([]);
      setCurrentHolds(new Map());
    }
    
    if (debug) {
      console.log('[useNormalizedKeys] All keys reset due to focus loss');
    }
  }, [debug]);

  // Function to update key state
  const updateKeyState = useCallback((
    event: KeyboardEvent, 
    type: 'keydown' | 'keyup'
  ) => {
    const originalKey = event.key;
    const originalCode = event.code;
    const normalizedKey = normalizeKey(event);
    const normalizedCode = normalizeKeyCode(event);
    const timestamp = Date.now();
    const keyStates = keyStatesRef.current;
    const quirks = platformQuirksRef.current;
    
    // Perform platform-specific quirk handling and validation
    
    // 1. Check for Windows Shift+Numpad phantom events
    const phantomResult = shouldSuppressWindowsShiftPhantom(event, keyStates, quirks);
    if (phantomResult === 'suppress') {
      debugCountersRef.current.quirksHandled++;
      if (debug) {
        console.log('[useNormalizedKeys] Suppressed Windows Shift+Numpad phantom event');
      }
      return; // Don't process this phantom event
    } else if (phantomResult === 'buffer') {
      debugCountersRef.current.quirksHandled++;
      if (debug) {
        console.log('[useNormalizedKeys] Buffered potential phantom Shift keyup');
      }
      return; // Event is buffered, will be emitted later if not phantom
    }
    
    // 2. Handle macOS Meta key timeout issues
    handleMacOSMetaTimeout(event, quirks, () => {
      // Force reset Meta key state when timeout occurs
      const metaStates = keyStates.get('Meta');
      if (metaStates?.isDown) {
        keyStates.set('Meta', { ...metaStates, isDown: false });
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete('Meta');
          return newSet;
        });
        if (debug) {
          console.log('[useNormalizedKeys] Force reset Meta key due to macOS timeout');
        }
      }
    });
    
    // 3. Validate key event consistency
    const validation = validateKeyEventConsistency(event, quirks);
    if (!validation.isValid && debug) {
      console.warn('[useNormalizedKeys] Key event validation issues:', validation);
    }
    
    // Use normalized key for state tracking
    const trackingKey = normalizedKey;
    
    // Get current key state
    const currentState = keyStates.get(trackingKey) || {
      isDown: false,
      lastEventType: null,
      timestamp: 0
    };

    // Handle keydown events
    if (type === 'keydown') {
      // Ignore auto-repeat events
      if (event.repeat) {
        if (debug) {
          debugCountersRef.current.suppressed++;
          console.log(`[useNormalizedKeys] Suppressed repeat event for key: ${trackingKey}`);
        }
        return;
      }
      
      // Ignore if key is already tracked as down
      if (currentState.isDown) {
        if (debug) {
          debugCountersRef.current.suppressed++;
          console.log(`[useNormalizedKeys] Suppressed duplicate keydown for key: ${trackingKey}`);
        }
        return;
      }

      // Update key state
      keyStates.set(trackingKey, {
        isDown: true,
        lastEventType: 'keydown',
        timestamp,
        pressTime: timestamp
      });

      // Update pressed keys set
      setPressedKeys(prev => new Set(prev).add(trackingKey));
    } 
    // Handle keyup events
    else if (type === 'keyup') {
      // Only process if key was actually down
      if (!currentState.isDown) {
        if (debug) {
          debugCountersRef.current.suppressed++;
          console.log(`[useNormalizedKeys] Suppressed keyup for key not tracked as down: ${trackingKey}`);
        }
        return;
      }

      // Update key state
      keyStates.set(trackingKey, {
        isDown: false,
        lastEventType: 'keyup',
        timestamp,
        pressTime: currentState.pressTime
      });

      // Update pressed keys set
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackingKey);
        return newSet;
      });
    }

    // Update modifier states
    const modifiers = getModifierStates(event);
    setActiveModifiers(modifiers);

    // Get numpad information if applicable
    let numpadInfo;
    if (isNumpadKey(event)) {
      numpadInfo = getNumpadKeyInfo(event);
    }

    // Calculate duration for all keys on keyup
    let duration: number | undefined;
    let isTap: boolean | undefined;
    let isHold: boolean | undefined;
    
    if (type === 'keyup' && currentState.pressTime) {
      duration = timestamp - currentState.pressTime;
      
      // Calculate tap/hold for ALL keys (not just modifiers)
      isTap = duration < tapHoldThreshold;
      isHold = duration >= tapHoldThreshold;
      
      if (debug) {
        console.log(`[useNormalizedKeys] Key ${normalizedKey} ${isTap ? 'tapped' : 'held'} for ${duration}ms`);
      }
    }

    // Check if we should prevent default for this event
    const shouldPrevent = shouldPreventDefault(event, preventDefault, excludeInputFields);
    if (shouldPrevent) {
      event.preventDefault();
      if (debug) {
        console.log(`[useNormalizedKeys] Prevented default for ${normalizedKey} (${type})`);
      }
    }

    // Create normalized event object
    const normalizedEvent: NormalizedKeyEvent = {
      key: normalizedKey,
      originalKey,
      code: normalizedCode,
      originalCode,
      type,
      isModifier: isModifierKey(normalizedKey),
      activeModifiers: modifiers,
      timestamp,
      isRepeat: event.repeat,
      isNumpad: isNumpadKey(event),
      duration,
      isTap,
      isHold,
      preventedDefault: shouldPrevent,
      numpadInfo
    };

    // Update last event
    setLastEvent(normalizedEvent);

    // Note: We don't emit separate keytap events
    // Consumers should check: event.type === 'keyup' && event.isTap
    // The isTap property is already set based on tapHoldThreshold

    // Process sequence detection if enabled
    if (sequenceStateRef.current) {
      if (debug) {
        console.log('[useNormalizedKeys] Before sequence processing, current sequence length:', sequenceStateRef.current.currentSequence.length);
      }
      const { matches, state } = processSequenceEvent(normalizedEvent, sequenceStateRef.current);
      sequenceStateRef.current = state;
      if (debug) {
        console.log('[useNormalizedKeys] After sequence processing, current sequence length:', sequenceStateRef.current.currentSequence.length);
      }
      
      // Always sync currentHolds from the sequence state after processing
      // This ensures we capture both additions and removals
      setCurrentHolds(new Map(state.activeHolds));
      
      if (matches.length > 0) {
        setSequenceMatches(prev => [...prev, ...matches]);
        
        if (debug) {
          console.log('[useNormalizedKeys] Sequences matched:', matches.map(m => m.sequenceId));
        }
      }
    }

    // Debug logging
    if (debug) {
      debugCountersRef.current.events++;
      console.log('[useNormalizedKeys] Event:', normalizedEvent);
      console.log('[useNormalizedKeys] Debug counters:', debugCountersRef.current);
      
      // Include platform debug info periodically
      if (debugCountersRef.current.events % 10 === 0) {
        console.log('[useNormalizedKeys] Platform debug info:', getPlatformDebugInfo(quirks));
      }
    }
  }, [debug, tapHoldThreshold]);

  useEffect(() => {
    if (!enabled) return;

    // Set up event emitter for buffered Windows phantom events
    setEventEmitter(platformQuirksRef.current, (bufferedEvent: KeyboardEvent) => {
      // Process the buffered event that was delayed
      updateKeyState(bufferedEvent, bufferedEvent.type as 'keydown' | 'keyup');
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip events from input fields if exclusion is enabled
      if (excludeInputFields && isInputElement(event.target)) {
        return;
      }

      updateKeyState(event, 'keydown');
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Skip events from input fields if exclusion is enabled
      if (excludeInputFields && isInputElement(event.target)) {
        return;
      }

      updateKeyState(event, 'keyup');
    };

    // Handle window blur for stuck key prevention
    const handleWindowBlur = () => {
      resetAllKeys();
    };

    // Use capture phase to intercept events before stopPropagation
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      
      // Clean up platform-specific quirk timers and state
      cleanupPlatformQuirks(platformQuirksRef.current);
    };
  }, [enabled, excludeInputFields, updateKeyState, resetAllKeys]);

  // Sequence management functions
  const addSequence = useCallback((definition: SequenceDefinition) => {
    sequencesClearedRef.current = false; // Reset the cleared flag
    
    if (!sequenceStateRef.current) {
      sequenceStateRef.current = createSequenceState({
        ...sequences,
        sequences: [definition]
      });
    } else {
      const currentSequences = sequenceStateRef.current.options.sequences || [];
      updateSequenceOptions(sequenceStateRef.current, {
        sequences: [...currentSequences, definition]
      });
    }
    
    if (debug) {
      console.log('[useNormalizedKeys] Added sequence:', definition.id);
    }
  }, [sequences, debug]);

  const removeSequence = useCallback((id: string) => {
    if (!sequenceStateRef.current) return;
    
    const currentSequences = sequenceStateRef.current.options.sequences || [];
    const filtered = currentSequences.filter(seq => seq.id !== id);
    updateSequenceOptions(sequenceStateRef.current, {
      sequences: filtered
    });
    
    if (debug) {
      console.log('[useNormalizedKeys] Removed sequence:', id);
    }
  }, [debug]);

  const clearSequences = useCallback(() => {
    if (!sequenceStateRef.current) return;
    
    if (debug) {
      console.log('[useNormalizedKeys] Clearing sequences, current count:', sequenceStateRef.current.options.sequences?.length || 0);
    }
    
    sequencesClearedRef.current = true;
    updateSequenceOptions(sequenceStateRef.current, {
      sequences: []
    });
    setSequenceMatches([]);
    setCurrentHolds(new Map());
    
    if (debug) {
      console.log('[useNormalizedKeys] Cleared all sequences, new count:', sequenceStateRef.current.options.sequences?.length || 0);
    }
  }, [debug]);

  const resetSequenceStateCallback = useCallback(() => {
    if (!sequenceStateRef.current) return;
    
    resetSequenceState(sequenceStateRef.current);
    setSequenceMatches([]);
    setCurrentHolds(new Map());
    
    if (debug) {
      console.log('[useNormalizedKeys] Reset sequence state');
    }
  }, [debug]);

  // Update sequence options when they change
  useEffect(() => {
    if (sequences && sequenceStateRef.current && !sequencesClearedRef.current) {
      updateSequenceOptions(sequenceStateRef.current, sequences);
    }
  }, [sequences]);

  // Store ref to currentHolds for interval access
  const currentHoldsRef = useRef<CurrentHolds>(currentHolds);
  useEffect(() => {
    currentHoldsRef.current = currentHolds;
  }, [currentHolds]);

  // Update hold progress values in real-time
  useEffect(() => {
    const updateHoldProgress = () => {
      const holds = currentHoldsRef.current;
      if (holds.size === 0) return;
      
      const now = Date.now();
      let hasChanges = false;
      const updatedHolds = new Map<string, HoldProgress>();

      holds.forEach((hold, sequenceId) => {
        if (!hold.isComplete) {
          const elapsed = now - hold.startTime;
          const progress = Math.min(1, elapsed / hold.minHoldTime);
          const progressPercent = progress * 100;
          const remainingTime = Math.max(0, hold.minHoldTime - elapsed);
          
          const updatedHold: HoldProgress = {
            ...hold,
            progress,
            progressPercent,
            elapsedTime: elapsed,
            remainingTime,
            isComplete: progress >= 1
          };
          
          updatedHolds.set(sequenceId, updatedHold);
          hasChanges = true;
        } else {
          updatedHolds.set(sequenceId, hold);
        }
      });

      if (hasChanges) {
        setCurrentHolds(updatedHolds);
      }
    };

    const intervalId = setInterval(updateHoldProgress, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, []);

  // Build return object
  const result: NormalizedKeyState = {
    lastEvent,
    pressedKeys,
    isKeyPressed,
    activeModifiers,
    currentHolds
  };

  // Add sequence functionality if enabled
  if (sequences) {
    result.sequences = {
      matches: sequenceMatches,
      addSequence,
      removeSequence,
      clearSequences,
      resetState: resetSequenceStateCallback
    };

    // Add debug state if debug mode is enabled
    if (debug && sequenceStateRef.current) {
      result.sequences.debugState = {
        currentSequence: sequenceStateRef.current.currentSequence,
        sequenceStartTime: sequenceStateRef.current.sequenceStartTime,
        lastKeyTime: sequenceStateRef.current.lastKeyTime,
        activeChordKeys: sequenceStateRef.current.activeChordKeys,
        potentialChord: sequenceStateRef.current.potentialChord,
        chordStartTime: sequenceStateRef.current.chordStartTime,
        chordMatched: sequenceStateRef.current.chordMatched,
        heldKeys: sequenceStateRef.current.heldKeys,
        recentMatches: sequenceStateRef.current.recentMatches
      };
    }
  }

  return result;
}

// Re-export types for convenience
export type { NormalizedKeyEvent } from './sequenceDetection';
export type { 
  SequenceDefinition, 
  SequenceOptions,
  MatchedSequence,
  SequenceType,
  SequenceKey
} from './sequenceDetection';

// Export helper hooks
export { 
  useHoldProgress,
  useHoldAnimation,
  useSequence
} from './hooks';

// Export sequence helper functions
export {
  holdSequence,
  comboSequence,
  chordSequence,
  holdSequences,
  fightingCombo,
  rhythmSequence
} from './sequenceHelpers';