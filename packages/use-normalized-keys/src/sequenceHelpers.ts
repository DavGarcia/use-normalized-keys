/**
 * Helper functions for creating sequence definitions
 * 
 * These utilities simplify the creation of common sequence patterns,
 * making it easier for developers to define keyboard sequences without
 * dealing with the full complexity of the SequenceDefinition interface.
 */

import type { SequenceDefinition, SequenceKey } from './sequenceDetection';

/**
 * Creates a hold sequence definition
 * 
 * @param id - Unique identifier for the sequence
 * @param key - The key to hold (automatically normalizes space key)
 * @param duration - How long the key must be held in milliseconds
 * @param options - Additional options
 * @returns SequenceDefinition for a hold sequence
 * 
 * @example
 * holdSequence('charge-jump', ' ', 750)
 * holdSequence('power-attack', 'f', 1000, { name: 'Power Attack' })
 * holdSequence('special-move', 's', 600, { modifiers: { ctrl: true } })
 */
export function holdSequence(
  id: string,
  key: string,
  duration: number,
  options?: {
    name?: string;
    modifiers?: {
      shift?: boolean;
      ctrl?: boolean;
      alt?: boolean;
      meta?: boolean;
    };
  }
): SequenceDefinition {
  // Normalize common key representations
  const normalizedKey = key === ' ' ? 'Space' : key;
  
  const sequenceKey: SequenceKey = {
    key: normalizedKey,
    minHoldTime: duration,
    ...(options?.modifiers && { modifiers: options.modifiers })
  };

  return {
    id,
    name: options?.name || `Hold ${normalizedKey}`,
    keys: [sequenceKey],
    type: 'hold'
  };
}

/**
 * Creates a combo/sequence definition (sequential key presses)
 * 
 * @param id - Unique identifier for the sequence
 * @param keys - Array of keys in order (automatically normalizes space key)
 * @param options - Additional options
 * @returns SequenceDefinition for a sequential combo
 * 
 * @example
 * comboSequence('konami', ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'b', 'a'])
 * comboSequence('hadouken', ['↓', '↘', '→', 'p'], { timeout: 500 })
 * comboSequence('vim-escape', ['j', 'k'], { name: 'Vim Escape', timeout: 300 })
 */
export function comboSequence(
  id: string,
  keys: string[],
  options?: {
    name?: string;
    timeout?: number;
    allowOtherKeys?: boolean;
    resetOnMismatch?: boolean;
    caseSensitive?: boolean;
  }
): SequenceDefinition {
  // Normalize space keys in the sequence
  const normalizedKeys = keys.map(k => k === ' ' ? 'Space' : k);

  return {
    id,
    name: options?.name || normalizedKeys.join(' → '),
    keys: normalizedKeys,
    type: 'sequence',
    timeout: options?.timeout || 1000,
    ...(options?.allowOtherKeys !== undefined && { allowOtherKeys: options.allowOtherKeys }),
    ...(options?.resetOnMismatch !== undefined && { resetOnMismatch: options.resetOnMismatch }),
    ...(options?.caseSensitive !== undefined && { caseSensitive: options.caseSensitive })
  };
}

/**
 * Creates a chord definition (simultaneous key combination)
 * 
 * @param id - Unique identifier for the sequence
 * @param keys - Array of keys that must be pressed together
 * @param options - Additional options
 * @returns SequenceDefinition for a chord
 * 
 * @example
 * chordSequence('save', ['Control', 's'])
 * chordSequence('copy', ['Control', 'c'], { name: 'Copy' })
 * chordSequence('screenshot', ['Control', 'Shift', 's'])
 */
export function chordSequence(
  id: string,
  keys: string[],
  options?: {
    name?: string;
    allowOtherKeys?: boolean;
  }
): SequenceDefinition {
  // For chords, we typically want the exact keys
  return {
    id,
    name: options?.name || keys.join(' + '),
    keys,
    type: 'chord',
    ...(options?.allowOtherKeys !== undefined && { allowOtherKeys: options.allowOtherKeys })
  };
}

/**
 * Creates multiple hold sequences with a common pattern
 * Useful for fighting games with multiple charge moves
 * 
 * @param configs - Array of hold configurations
 * @returns Array of SequenceDefinitions
 * 
 * @example
 * holdSequences([
 *   { id: 'light-punch', key: 'j', duration: 200 },
 *   { id: 'medium-punch', key: 'j', duration: 500 },
 *   { id: 'heavy-punch', key: 'j', duration: 1000 }
 * ])
 */
export function holdSequences(
  configs: Array<{
    id: string;
    key: string;
    duration: number;
    name?: string;
    modifiers?: {
      shift?: boolean;
      ctrl?: boolean;
      alt?: boolean;
      meta?: boolean;
    };
  }>
): SequenceDefinition[] {
  return configs.map(config => 
    holdSequence(config.id, config.key, config.duration, {
      name: config.name,
      modifiers: config.modifiers
    })
  );
}

/**
 * Creates fighting game style directional combos
 * 
 * @param id - Unique identifier for the sequence
 * @param notation - Fighting game notation (e.g., "236P" for quarter-circle-forward punch)
 * @param options - Additional options
 * @returns SequenceDefinition for the combo
 * 
 * @example
 * fightingCombo('hadouken', '236P')
 * fightingCombo('shoryuken', '623P', { timeout: 400 })
 * fightingCombo('sonic-boom', '[4]6P') // [] indicates charge/hold
 */
export function fightingCombo(
  id: string,
  notation: string,
  options?: {
    name?: string;
    timeout?: number;
    chargeTime?: number;
  }
): SequenceDefinition {
  // Numpad notation to arrow key mapping
  const directionMap: Record<string, string> = {
    '1': '↙', '2': '↓', '3': '↘',
    '4': '←', '5': '', '6': '→',
    '7': '↖', '8': '↑', '9': '↗'
  };

  // Button mapping
  const buttonMap: Record<string, string> = {
    'P': 'p', // Punch
    'K': 'k', // Kick
    'LP': 'j', // Light punch
    'MP': 'k', // Medium punch
    'HP': 'l', // Heavy punch
    'LK': 'u', // Light kick
    'MK': 'i', // Medium kick
    'HK': 'o', // Heavy kick
  };

  // Parse charge notation [4]6P
  const chargeMatch = notation.match(/\[(\d)\](.+)/);
  if (chargeMatch) {
    const chargeDir = directionMap[chargeMatch[1]] || chargeMatch[1];
    const remainingNotation = chargeMatch[2];
    
    // This is a charge move - create a more complex sequence
    // For now, return a simple combo (could be enhanced to support charge mechanics)
    const keys: string[] = [];
    let j = 0;
    while (j < remainingNotation.length) {
      const char = remainingNotation[j];
      
      // Check for direction
      if (char in directionMap) {
        const mapped = directionMap[char];
        if (mapped !== '') keys.push(mapped);
        j++;
      } 
      // Check for multi-character button (LP, MP, HP, LK, MK, HK)
      else if (j + 1 < remainingNotation.length) {
        const twoChar = remainingNotation.substring(j, j + 2).toUpperCase();
        if (twoChar in buttonMap) {
          keys.push(buttonMap[twoChar]);
          j += 2;
        } else if (char.toUpperCase() in buttonMap) {
          keys.push(buttonMap[char.toUpperCase()]);
          j++;
        } else {
          keys.push(char);
          j++;
        }
      }
      // Single character
      else if (char.toUpperCase() in buttonMap) {
        keys.push(buttonMap[char.toUpperCase()]);
        j++;
      } else {
        keys.push(char);
        j++;
      }
    }

    return {
      id,
      name: options?.name || `Charge ${notation}`,
      keys,
      type: 'sequence',
      timeout: options?.timeout || 500
    };
  }

  // Parse regular notation
  const keys: string[] = [];
  let i = 0;
  while (i < notation.length) {
    const char = notation[i];
    
    // Check for direction
    if (char in directionMap) {
      const mapped = directionMap[char];
      if (mapped !== '') keys.push(mapped);
      i++;
    } 
    // Check for multi-character button (LP, MP, HP, LK, MK, HK)
    else if (i + 1 < notation.length) {
      const twoChar = notation.substring(i, i + 2).toUpperCase();
      if (twoChar in buttonMap) {
        keys.push(buttonMap[twoChar]);
        i += 2;
      } else if (char.toUpperCase() in buttonMap) {
        keys.push(buttonMap[char.toUpperCase()]);
        i++;
      } else {
        keys.push(char);
        i++;
      }
    }
    // Single character
    else if (char.toUpperCase() in buttonMap) {
      keys.push(buttonMap[char.toUpperCase()]);
      i++;
    } else {
      keys.push(char);
      i++;
    }
  }

  return {
    id,
    name: options?.name || notation,
    keys,
    type: 'sequence',
    timeout: options?.timeout || 600
  };
}

/**
 * Creates a sequence that must be completed within a rhythm window
 * Useful for rhythm games or timed combos
 * 
 * @param id - Unique identifier for the sequence
 * @param pattern - Array of keys with optional timing
 * @param bpm - Beats per minute for rhythm
 * @param options - Additional options
 * @returns SequenceDefinition
 * 
 * @example
 * rhythmSequence('dance-move', ['↑', '↓', '←', '→'], 120)
 */
export function rhythmSequence(
  id: string,
  pattern: string[],
  bpm: number,
  options?: {
    name?: string;
    tolerance?: number; // Timing tolerance in ms
  }
): SequenceDefinition {
  const beatInterval = 60000 / bpm; // ms per beat
  const tolerance = options?.tolerance || beatInterval * 0.25; // 25% tolerance by default

  return {
    id,
    name: options?.name || `${pattern.join(' ')} @ ${bpm}BPM`,
    keys: pattern.map(k => k === ' ' ? 'Space' : k),
    type: 'sequence',
    timeout: beatInterval + tolerance,
    resetOnMismatch: true
  };
}