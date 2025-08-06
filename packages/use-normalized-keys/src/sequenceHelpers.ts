/**
 * Helper functions for creating sequence definitions
 * 
 * These utilities simplify the creation of common sequence patterns,
 * making it easier for developers to define keyboard sequences without
 * dealing with the full complexity of the SequenceDefinition interface.
 */

import type { SequenceDefinition, SequenceKey } from './sequenceDetection';
import { Keys } from './keyConstants';

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
 * holdSequence('brush-pressure', Keys.b, 750)
 * holdSequence('pen-pressure', Keys.p, 1000, { name: 'Pen Pressure Build' })
 * holdSequence('save-draft', Keys.s, 600, { modifiers: { ctrl: true } })
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
 * comboSequence('quick-save', [Keys.CONTROL, Keys.s, Keys.ENTER], { timeout: 500 })
 * comboSequence('brush-to-eraser', [Keys.b, Keys.e], { name: 'Switch to Eraser', timeout: 500 })
 * comboSequence('vim-escape', [Keys.j, Keys.k], { name: 'Vim Escape', timeout: 300 })
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
 * chordSequence('save', [Keys.CONTROL, Keys.s])
 * chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy' })
 * chordSequence('screenshot', [Keys.CONTROL, Keys.SHIFT, Keys.s])
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
 * Useful for drawing applications with variable pressure levels
 * 
 * @param configs - Array of hold configurations
 * @returns Array of SequenceDefinitions
 * 
 * @example
 * holdSequences([
 *   { id: 'light-pressure', key: Keys.b, duration: 200 },
 *   { id: 'medium-pressure', key: Keys.b, duration: 500 },
 *   { id: 'heavy-pressure', key: Keys.b, duration: 1000 }
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

