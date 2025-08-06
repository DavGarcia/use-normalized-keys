/**
 * Input Sequence Detection System
 * 
 * This module provides advanced sequence and combination detection for keyboard input,
 * enabling features like sequence detection (e.g., "Save File" shortcuts), chord detection
 * (e.g., "Ctrl+Shift+P"), and timing-based sequences.
 */

import type { HoldProgress } from './index';

// Import type from the parent module to avoid circular dependency
export interface NormalizedKeyEvent {
  key: string;
  originalKey: string;
  code: string;
  originalCode: string;
  type: 'keydown' | 'keyup';
  isModifier: boolean;
  activeModifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    caps: boolean;
    numLock: boolean;
    scrollLock: boolean;
  };
  timestamp: number;
  isRepeat: boolean;
  isNumpad: boolean;
  duration?: number;
  isTap?: boolean;
  isHold?: boolean;
  preventedDefault?: boolean;
  numpadInfo?: {
    digit: string | null;
    navigation: string | null;
    activeMode: 'digit' | 'navigation';
    isNumLockOn: boolean;
  };
}

/**
 * Type of sequence detection
 */
export type SequenceType = 
  | 'sequence'  // Sequential key presses (e.g., "ABC" or "↑↑↓↓")
  | 'chord'     // Simultaneous key combination (e.g., "Ctrl+K")
  | 'hold';     // Long press detection (e.g., "Hold A for 2 seconds")

/**
 * Represents a single key in a sequence
 */
export interface SequenceKey {
  key: string;              // Normalized key value
  modifiers?: {             // Required modifier states (for chords)
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  minHoldTime?: number;     // Minimum hold time in ms (for hold type)
}

/**
 * Defines a sequence pattern to detect
 */
export interface SequenceDefinition {
  id: string;                      // Unique identifier for the sequence
  name?: string;                   // Human-readable name
  keys: string[] | SequenceKey[];  // Keys in the sequence
  type: SequenceType;              // Type of sequence
  timeout?: number;                // Max time between keys (ms)
  allowOtherKeys?: boolean;        // Allow other keys between sequence keys
  resetOnMismatch?: boolean;       // Reset sequence on wrong key
  caseSensitive?: boolean;         // Case sensitive matching
}

/**
 * Result when a sequence is matched
 */
export interface MatchedSequence {
  sequenceId: string;             // ID of matched sequence
  sequenceName?: string;          // Name of matched sequence
  type: SequenceType;            // Type of matched sequence
  startTime: number;             // When sequence started
  endTime: number;               // When sequence completed
  duration: number;              // Total duration in ms
  keys: NormalizedKeyEvent[];    // The actual key events that matched
  matchedAt: number;             // Timestamp of match
}

/**
 * Options for sequence detection
 */
export interface SequenceOptions {
  sequences?: SequenceDefinition[];        // Sequences to detect
  chordTimeout?: number;                   // Time to wait for chord completion (default: 50ms)
  sequenceTimeout?: number;                // Time between keys in sequence (default: 1000ms)
  holdThreshold?: number;                  // Minimum time for hold detection (default: 500ms)
  maxSequenceLength?: number;              // Max keys to track (default: 20)
  onSequenceMatch?: (match: MatchedSequence) => void;  // Callback on match
  debug?: boolean;                         // Enable debug logging
}

/**
 * Internal state for tracking sequences
 */
export interface SequenceState {
  // Active sequence tracking
  currentSequence: NormalizedKeyEvent[];
  sequenceStartTime: number | null;
  lastKeyTime: number;
  
  // Chord detection
  activeChordKeys: Set<string>;
  potentialChord: NormalizedKeyEvent[];
  chordStartTime: number | null;
  chordMatched: boolean; // Track if current chord was already matched
  
  // Hold detection
  heldKeys: Map<string, { startTime: number; event: NormalizedKeyEvent }>;
  holdTimers: Map<string, NodeJS.Timeout>; // Track active hold timers
  activeHolds: Map<string, HoldProgress>; // Track active hold progress
  
  // Match history (optional, for debugging)
  recentMatches: MatchedSequence[];
  
  // Configuration
  options: Required<SequenceOptions>;
}

/**
 * Creates initial sequence detection state
 */
export function createSequenceState(options: SequenceOptions = {}): SequenceState {
  const defaultOptions: Required<SequenceOptions> = {
    sequences: [],
    chordTimeout: 50,
    sequenceTimeout: 1000,
    holdThreshold: 500,
    maxSequenceLength: 20,
    onSequenceMatch: () => {},
    debug: false,
  };

  return {
    currentSequence: [],
    sequenceStartTime: null,
    lastKeyTime: 0,
    activeChordKeys: new Set(),
    potentialChord: [],
    chordStartTime: null,
    chordMatched: false,
    heldKeys: new Map(),
    holdTimers: new Map(),
    activeHolds: new Map(),
    recentMatches: [],
    options: { ...defaultOptions, ...options },
  };
}

/**
 * Checks if a key matches a sequence key definition
 */
function keyMatches(
  event: NormalizedKeyEvent, 
  sequenceKey: string | SequenceKey,
  caseSensitive: boolean = false
): boolean {
  if (typeof sequenceKey === 'string') {
    // Use originalKey for case-sensitive matching to preserve case
    const eventKey = caseSensitive ? event.originalKey : event.originalKey.toLowerCase();
    const targetKey = caseSensitive ? sequenceKey : sequenceKey.toLowerCase();
    return eventKey === targetKey;
  }

  // Check key match
  const eventKey = caseSensitive ? event.originalKey : event.originalKey.toLowerCase();
  const targetKey = caseSensitive ? sequenceKey.key : sequenceKey.key.toLowerCase();
  if (eventKey !== targetKey) return false;

  // Check modifier requirements
  if (sequenceKey.modifiers) {
    const mods = sequenceKey.modifiers;
    if (mods.shift !== undefined && event.activeModifiers.shift !== mods.shift) return false;
    if (mods.ctrl !== undefined && event.activeModifiers.ctrl !== mods.ctrl) return false;
    if (mods.alt !== undefined && event.activeModifiers.alt !== mods.alt) return false;
    if (mods.meta !== undefined && event.activeModifiers.meta !== mods.meta) return false;
  }

  return true;
}

/**
 * Processes a key event for sequence detection
 * 
 * @param event - The normalized key event to process
 * @param state - The sequence detection state
 * @returns Updated state and any matched sequences
 */
export function processSequenceEvent(
  event: NormalizedKeyEvent,
  state: SequenceState
): { matches: MatchedSequence[]; state: SequenceState } {
  const matches: MatchedSequence[] = [];
  const { options } = state;
  const now = event.timestamp;

  if (options.debug) {
    console.log('[sequenceDetection] Processing event:', event.key, event.type, 'current sequence length:', state.currentSequence.length, 'state id:', state.options.sequences?.length || 0);
  }

  // Handle keydown events
  if (event.type === 'keydown') {
    // Track for hold detection using normalized key
    if (!state.heldKeys.has(event.key)) {
      state.heldKeys.set(event.key, { startTime: now, event });
      
      // Check for hold sequences and start timers
      if (options.sequences) {
        options.sequences.forEach(seq => {
          if (seq.type === 'hold') {
            const keyDef = seq.keys[0];
            if (!keyDef) return;
            
            const targetKey = typeof keyDef === 'string' ? keyDef : keyDef.key;
            const minHoldTime = typeof keyDef === 'string' 
              ? options.holdThreshold 
              : (keyDef.minHoldTime ?? options.holdThreshold);
            
            const keyNorm = seq.caseSensitive ? event.key : event.key.toLowerCase();
            const targetNorm = seq.caseSensitive ? targetKey : targetKey.toLowerCase();
            
            if (keyNorm === targetNorm) {
              // Check modifiers if specified
              if (typeof keyDef === 'object' && keyDef.modifiers) {
                const modsMatch = Object.entries(keyDef.modifiers).every(([mod, value]) => 
                  event.activeModifiers[mod as keyof typeof event.activeModifiers] === value
                );
                if (!modsMatch) return;
              }
              
              // Start tracking hold progress
              const holdProgress: HoldProgress = {
                sequenceId: seq.id,
                sequenceName: seq.name,
                key: event.key,
                startTime: now,
                minHoldTime,
                progress: 0,
                progressPercent: 0,
                elapsedTime: 0,
                remainingTime: minHoldTime,
                isComplete: false
              };
              state.activeHolds.set(seq.id, holdProgress);
              
              if (options.debug) {
                console.log('[sequenceDetection] Started tracking hold for:', seq.id, 'key:', event.key, 'activeHolds size:', state.activeHolds.size);
              }
              
              // Start hold timer
              const timerId = setTimeout(() => {
                // Mark hold as complete
                const completeHold = state.activeHolds.get(seq.id);
                if (completeHold) {
                  completeHold.isComplete = true;
                  completeHold.progress = 1;
                  completeHold.progressPercent = 100;
                  completeHold.elapsedTime = minHoldTime;
                  completeHold.remainingTime = 0;
                }
                
                // Emit hold match event
                const match: MatchedSequence = {
                  sequenceId: seq.id,
                  sequenceName: seq.name,
                  type: 'hold',
                  startTime: now,
                  endTime: now + minHoldTime,
                  duration: minHoldTime,
                  keys: [event],
                  matchedAt: now + minHoldTime,
                };
                
                // Add to matches
                matches.push(match);
                
                // Trigger callback
                if (options.onSequenceMatch && state.options.sequences && state.options.sequences.length > 0) {
                  options.onSequenceMatch(match);
                }
                
                // Add to recent matches
                state.recentMatches.push(match);
                if (state.recentMatches.length > 10) {
                  state.recentMatches.shift();
                }
                
                if (options.debug) {
                  console.log('[sequenceDetection] Hold matched (timer fired):', seq.id, `${minHoldTime}ms`);
                }
                
                // Remove the timer from tracking
                state.holdTimers.delete(seq.id);
              }, minHoldTime);
              
              // Store timer for cleanup
              state.holdTimers.set(seq.id, timerId);
              
              if (options.debug) {
                console.log('[sequenceDetection] Started hold timer for:', seq.id, `${minHoldTime}ms`);
              }
            }
          }
        });
      }
    }

    // Add to current sequence (only keydown events for sequence matching)
    state.currentSequence.push(event);
    
    if (options.debug) {
      console.log('[sequenceDetection] Added to sequence, new length:', state.currentSequence.length);
    }
    
    // Initialize sequence timing
    if (state.sequenceStartTime === null) {
      state.sequenceStartTime = now;
    }
    
    // Check if sequence is too long
    if (state.currentSequence.length > options.maxSequenceLength) {
      state.currentSequence.shift(); // Remove oldest
    }
    
    // Check for timeouts (only if we had a previous key)
    if (state.lastKeyTime > 0 && now - state.lastKeyTime > options.sequenceTimeout) {
      // Reset sequence due to timeout
      if (options.debug) {
        console.log('[sequenceDetection] Sequence timeout, resetting');
      }
      state.currentSequence = [event];
      state.sequenceStartTime = now;
    }
    
    state.lastKeyTime = now;

    // Add to potential chord
    state.activeChordKeys.add(event.key);
    state.potentialChord.push(event);
    if (state.chordStartTime === null) {
      state.chordStartTime = now;
      state.chordMatched = false; // Reset chord matched flag
    }

    // Check for sequence matches
    const sequenceMatches = checkSequenceMatches(state, now);
    matches.push(...sequenceMatches);

    // Check for chord matches after a timeout to allow all keys to be pressed
    // Schedule chord check
    if (state.activeChordKeys.size > 0) {
      setTimeout(() => {
        // Only check if we still have active chord keys
        if (state.activeChordKeys.size > 0) {
          if (!state.chordMatched) {
            const chordMatches = checkChordMatches(state, now);
            if (chordMatches.length > 0) {
              // Mark chord as already matched to prevent duplicate
              state.chordMatched = true;
              
              chordMatches.forEach(match => {
                // Double-check sequences still exist (in case they were cleared)
                if (options.onSequenceMatch && state.options.sequences && state.options.sequences.length > 0) {
                  options.onSequenceMatch(match);
                }
              });
            }
          }
        }
      }, options.chordTimeout);
    }
  }

  // Handle keyup events
  if (event.type === 'keyup') {
    if (options.debug) {
      console.log('[sequenceDetection] Processing keyup, sequence length before:', state.currentSequence.length);
    }
    
    // Cancel any hold timers for this key
    if (options.sequences) {
      options.sequences.forEach(seq => {
        if (seq.type === 'hold') {
          const keyDef = seq.keys[0];
          if (!keyDef) return;
          
          const targetKey = typeof keyDef === 'string' ? keyDef : keyDef.key;
          const keyNorm = seq.caseSensitive ? event.key : event.key.toLowerCase();
          const targetNorm = seq.caseSensitive ? targetKey : targetKey.toLowerCase();
          
          if (options.debug) {
            console.log('[sequenceDetection] Keyup comparison for seq:', seq.id, 'keyNorm:', keyNorm, 'targetNorm:', targetNorm, 'match:', keyNorm === targetNorm);
          }
          
          if (keyNorm === targetNorm) {
            // Check modifiers if specified
            if (typeof keyDef === 'object' && keyDef.modifiers) {
              const modsMatch = Object.entries(keyDef.modifiers).every(([mod, value]) => 
                event.activeModifiers[mod as keyof typeof event.activeModifiers] === value
              );
              if (!modsMatch) return;
            }
            
            const timerId = state.holdTimers.get(seq.id);
            if (timerId) {
              clearTimeout(timerId);
              state.holdTimers.delete(seq.id);
              
              if (options.debug) {
                console.log('[sequenceDetection] Cancelled hold timer for:', seq.id);
              }
            }
            
            // Clear hold progress
            state.activeHolds.delete(seq.id);
            
            if (options.debug) {
              console.log('[sequenceDetection] Cleared activeHolds for:', seq.id, 'activeHolds size:', state.activeHolds.size);
            }
          }
        }
      });
    }
    
    // Clean up held key tracking
    state.heldKeys.delete(event.key);

    // Remove from active chord keys
    state.activeChordKeys.delete(event.key);
    
    if (options.debug) {
      console.log('[sequenceDetection] After chord key removal, activeChordKeys size:', state.activeChordKeys.size, 'sequence length:', state.currentSequence.length);
    }
    
    // If no more keys are held, check final chord (only if not already matched)
    if (state.activeChordKeys.size === 0) {
      if (options.debug) {
        console.log('[sequenceDetection] No chord keys active, checking final chord. Sequence length before chord reset:', state.currentSequence.length);
      }
      
      if (state.chordStartTime !== null && !state.chordMatched) {
        const chordMatches = checkChordMatches(state, now);
        matches.push(...chordMatches);
      }
      
      // Reset chord state (NOT sequence state!)
      state.potentialChord = [];
      state.chordStartTime = null;
      state.chordMatched = false;
      
      if (options.debug) {
        console.log('[sequenceDetection] After chord reset, sequence length:', state.currentSequence.length);
      }
    }
    
    if (options.debug) {
      console.log('[sequenceDetection] Keyup processing complete, final sequence length:', state.currentSequence.length);
    }
  }

  // Trigger callbacks for matches
  matches.forEach(match => {
    // Double-check sequences still exist before calling callback
    if (options.onSequenceMatch && state.options.sequences && state.options.sequences.length > 0) {
      options.onSequenceMatch(match);
    }
    // Keep recent matches for debugging
    state.recentMatches.push(match);
    if (state.recentMatches.length > 10) {
      state.recentMatches.shift();
    }
  });

  return { matches, state };
}

/**
 * Checks for sequence pattern matches
 */
function checkSequenceMatches(state: SequenceState, now: number): MatchedSequence[] {
  const matches: MatchedSequence[] = [];
  const { currentSequence, options } = state;

  // Skip if no sequences defined
  if (!options.sequences || options.sequences.length === 0) {
    return matches;
  }

  // Check each defined sequence
  options.sequences.forEach(def => {
    if (def.type !== 'sequence') return;

    const keys = def.keys;
    const seqLength = keys.length;
    
    if (options.debug) {
      console.log(`[sequenceDetection] Checking sequence ${def.id}: need ${seqLength} keys, have ${currentSequence.length}`);
    }
    
    // Not enough keys yet
    if (currentSequence.length < seqLength) return;

    // Check if the last N keys match the sequence
    let matchStart = -1;
    
    // Try matching from the end backwards
    for (let start = currentSequence.length - seqLength; start >= 0; start--) {
      let isMatch = true;
      let keyIndex = 0;
      
      for (let i = start; i < currentSequence.length && keyIndex < seqLength; i++) {
        const event = currentSequence[i];
        
        if (options.debug) {
          console.log(`[sequenceDetection] Comparing event key "${event.key}" (original: "${event.originalKey}") with expected "${keys[keyIndex]}"`);
        }
        
        // Skip non-matching keys if allowed
        if (def.allowOtherKeys && !keyMatches(event, keys[keyIndex], def.caseSensitive)) {
          if (options.debug) {
            console.log(`[sequenceDetection] Skipping non-matching key (allowOtherKeys=true)`);
          }
          continue;
        }
        
        if (!keyMatches(event, keys[keyIndex], def.caseSensitive)) {
          if (options.debug) {
            console.log(`[sequenceDetection] Key mismatch: "${event.originalKey}" !== "${keys[keyIndex]}"`);
          }
          isMatch = false;
          break;
        }
        
        if (options.debug) {
          console.log(`[sequenceDetection] Key matched: "${event.originalKey}" === "${keys[keyIndex]}"`);
        }
        keyIndex++;
      }
      
      if (isMatch && keyIndex === seqLength) {
        matchStart = start;
        break;
      }
    }

    if (matchStart >= 0) {
      // Extract the matching events
      const matchedEvents: NormalizedKeyEvent[] = [];
      let keyIndex = 0;
      
      for (let i = matchStart; i < currentSequence.length && keyIndex < seqLength; i++) {
        const event = currentSequence[i];
        if (keyMatches(event, keys[keyIndex], def.caseSensitive)) {
          matchedEvents.push(event);
          keyIndex++;
        }
      }

      const match: MatchedSequence = {
        sequenceId: def.id,
        sequenceName: def.name,
        type: 'sequence',
        startTime: matchedEvents[0].timestamp,
        endTime: matchedEvents[matchedEvents.length - 1].timestamp,
        duration: matchedEvents[matchedEvents.length - 1].timestamp - matchedEvents[0].timestamp,
        keys: matchedEvents,
        matchedAt: now,
      };

      matches.push(match);

      if (options.debug) {
        console.log('[sequenceDetection] Sequence matched:', def.id);
      }

      // Reset sequence after match if configured
      if (def.resetOnMismatch) {
        state.currentSequence = [];
        state.sequenceStartTime = null;
      }
    }
  });

  return matches;
}

/**
 * Checks for chord pattern matches
 */
function checkChordMatches(state: SequenceState, now: number): MatchedSequence[] {
  const matches: MatchedSequence[] = [];
  const { potentialChord, activeChordKeys, options } = state;

  if (potentialChord.length === 0) return matches;

  // Skip if no sequences defined
  if (!options.sequences || options.sequences.length === 0) {
    return matches;
  }

  // Check each defined chord
  options.sequences.forEach(def => {
    if (def.type !== 'chord') return;

    const requiredKeys = new Set(
      def.keys.map(k => {
        const key = typeof k === 'string' ? k : k.key;
        return def.caseSensitive ? key : key.toLowerCase();
      })
    );

    // Check if all required keys are active
    const activeNormalized = new Set(
      Array.from(activeChordKeys).map(k => def.caseSensitive ? k : k.toLowerCase())
    );

    const hasAllKeys = Array.from(requiredKeys).every(k => activeNormalized.has(k));
    const hasExtraKeys = activeNormalized.size > requiredKeys.size;

    if (hasAllKeys && (!hasExtraKeys || def.allowOtherKeys)) {
      // Verify modifiers if specified
      let modifiersMatch = true;
      
      for (const keyDef of def.keys) {
        if (typeof keyDef !== 'string' && keyDef.modifiers) {
          // Find the event for this key
          const keyEvent = potentialChord.find(e => 
            keyMatches(e, keyDef.key, def.caseSensitive)
          );
          
          if (keyEvent && !keyMatches(keyEvent, keyDef, def.caseSensitive)) {
            modifiersMatch = false;
            break;
          }
        }
      }

      if (modifiersMatch) {
        const match: MatchedSequence = {
          sequenceId: def.id,
          sequenceName: def.name,
          type: 'chord',
          startTime: state.chordStartTime!,
          endTime: now,
          duration: now - state.chordStartTime!,
          keys: [...potentialChord],
          matchedAt: now,
        };

        matches.push(match);

        if (options.debug) {
          console.log('[sequenceDetection] Chord matched:', def.id);
        }
      }
    }
  });

  return matches;
}

/**
 * Checks for hold pattern matches
 */
function checkHoldMatches(
  key: string, 
  duration: number, 
  state: SequenceState, 
  now: number
): MatchedSequence[] {
  const matches: MatchedSequence[] = [];
  const { options } = state;

  // Skip if no sequences defined
  if (!options.sequences || options.sequences.length === 0) {
    return matches;
  }

  // Check each defined hold sequence
  options.sequences.forEach(def => {
    if (def.type !== 'hold') return;

    // For hold sequences, we expect a single key definition
    const keyDef = def.keys[0];
    if (!keyDef) return;

    const targetKey = typeof keyDef === 'string' ? keyDef : keyDef.key;
    const minHoldTime = typeof keyDef === 'string' 
      ? options.holdThreshold 
      : (keyDef.minHoldTime ?? options.holdThreshold);

    const keyNorm = def.caseSensitive ? key : key.toLowerCase();
    const targetNorm = def.caseSensitive ? targetKey : targetKey.toLowerCase();

    if (keyNorm === targetNorm && duration >= minHoldTime) {
      // Find the original keydown event using originalKey for case sensitivity
      const keydownEvent = state.currentSequence.find(
        e => e.type === 'keydown' && 
             (def.caseSensitive ? e.originalKey : e.originalKey.toLowerCase()) === targetNorm
      );

      if (keydownEvent) {
        const match: MatchedSequence = {
          sequenceId: def.id,
          sequenceName: def.name,
          type: 'hold',
          startTime: now - duration,
          endTime: now,
          duration: duration,
          keys: [keydownEvent],
          matchedAt: now,
        };

        matches.push(match);

        if (options.debug) {
          console.log('[sequenceDetection] Hold matched:', def.id, `${duration}ms`);
        }
      }
    }
  });

  return matches;
}

/**
 * Resets sequence detection state
 */
export function resetSequenceState(state: SequenceState): void {
  state.currentSequence = [];
  state.sequenceStartTime = null;
  state.lastKeyTime = 0;
  state.activeChordKeys.clear();
  state.potentialChord = [];
  state.chordStartTime = null;
  state.chordMatched = false;
  state.heldKeys.clear();
  
  // Cancel all hold timers
  state.holdTimers.forEach(timerId => clearTimeout(timerId));
  state.holdTimers.clear();
  
  // Clear active hold progress
  state.activeHolds.clear();
  
  state.recentMatches = [];
}

/**
 * Updates sequence detection options
 */
export function updateSequenceOptions(
  state: SequenceState, 
  newOptions: Partial<SequenceOptions>
): void {
  const oldOptions = state.options;
  state.options = { ...state.options, ...newOptions };
  
  // Reset state only if sequences actually changed (deep comparison)
  if (newOptions.sequences !== undefined) {
    const oldSequences = Array.isArray(oldOptions.sequences) ? oldOptions.sequences : [];
    const newSequences = newOptions.sequences;
    
    // Check if sequences actually changed by comparing length and IDs
    const sequencesChanged = 
      oldSequences.length !== newSequences.length ||
      oldSequences.some((oldSeq, index) => {
        const newSeq = newSequences[index];
        return !newSeq || oldSeq.id !== newSeq.id || 
               JSON.stringify(oldSeq.keys) !== JSON.stringify(newSeq.keys) ||
               oldSeq.type !== newSeq.type;
      });
    
    if (sequencesChanged) {
      if (state.options.debug) {
        console.log('[sequenceDetection] Sequences changed, resetting state. Old length:', oldSequences.length, 'New length:', newSequences.length);
      }
      resetSequenceState(state);
    } else if (state.options.debug) {
      console.log('[sequenceDetection] Sequences unchanged, preserving state. Length:', newSequences.length);
    }
  }
}