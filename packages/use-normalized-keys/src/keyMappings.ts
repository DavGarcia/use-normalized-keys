/**
 * Key Mapping Tables and Normalization Utilities
 * 
 * This module contains key mapping tables and normalization functions for cross-browser
 * keyboard input handling. Key mapping tables are derived from HumanInput library
 * (Apache-2.0 licensed) with proper attribution.
 * 
 * Attribution:
 * Key mapping tables adapted from HumanInput
 * Copyright (c) 2015 Dan McDougall
 * Licensed under the Apache License, Version 2.0
 * https://github.com/liftoff/HumanInput
 */


// Comprehensive symbol-to-base character mapping for all shifted keys
// Includes both numbers and punctuation for complete key normalization
// Based on US QWERTY layout
const SYMBOL_TO_BASE_MAP: Record<string, string> = {
  // Digit row symbols (Shift + 1-0)
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  
  // Punctuation symbols
  '_': '-',    // Shift + minus
  '+': '=',    // Shift + equals
  '{': '[',    // Shift + left bracket
  '}': ']',    // Shift + right bracket
  '|': '\\',   // Shift + backslash
  ':': ';',    // Shift + semicolon
  '"': "'",    // Shift + quote
  '<': ',',    // Shift + comma
  '>': '.',    // Shift + period
  '?': '/',    // Shift + slash
  '~': '`',    // Shift + backtick
};

// Numpad key mappings for consistent handling
// Derived from HumanInput's numpad handling patterns
const NUMPAD_KEY_MAP: Record<string, string> = {
  'Numpad0': '0',
  'Numpad1': '1',
  'Numpad2': '2',
  'Numpad3': '3',
  'Numpad4': '4',
  'Numpad5': '5',
  'Numpad6': '6',
  'Numpad7': '7',
  'Numpad8': '8',
  'Numpad9': '9',
  'NumpadDecimal': '.',
  'NumpadAdd': '+',
  'NumpadSubtract': '-',
  'NumpadMultiply': '*',
  'NumpadDivide': '/',
  'NumpadEnter': 'Enter',
};

// Navigation mode mappings for numpad when NumLock is off
const NUMPAD_NAVIGATION_MAP: Record<string, string> = {
  'Numpad0': 'Insert',
  'Numpad1': 'End',
  'Numpad2': 'ArrowDown',
  'Numpad3': 'PageDown',
  'Numpad4': 'ArrowLeft',
  'Numpad5': 'Clear', // Center key
  'Numpad6': 'ArrowRight',
  'Numpad7': 'Home',
  'Numpad8': 'ArrowUp',
  'Numpad9': 'PageUp',
  'NumpadDecimal': 'Delete',
};

// Key code normalization map for cross-browser consistency
// Based on common key code variations across browsers
const KEY_CODE_NORMALIZATION_MAP: Record<string, string> = {
  // Space variations
  ' ': 'Space',
  'Spacebar': 'Space',
  
  // Arrow key variations  
  'Up': 'ArrowUp',
  'Down': 'ArrowDown', 
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  
  // Modifier key variations
  'Ctrl': 'Control',
  'Cmd': 'Meta',
  'Command': 'Meta',
  'Win': 'Meta',
  'Windows': 'Meta',
  'Super': 'Meta',
  
  // Function key normalization
  'Esc': 'Escape',
  'Del': 'Delete',
  'Ins': 'Insert',
  
  // Common variations
  'Apps': 'ContextMenu',
  'Menu': 'ContextMenu',
  'PrintScreen': 'PrintScreen',
  'PrtSc': 'PrintScreen',
  'ScrollLock': 'ScrollLock',
  'Scroll': 'ScrollLock',
  'Pause': 'Pause',
  'Break': 'Pause',
};

/**
 * Normalizes a keyboard event key value for consistent cross-browser handling
 * Handles shifted symbols (both numbers and punctuation) by returning their base characters
 * 
 * @param event - The keyboard event to normalize
 * @returns Normalized key string
 */
export function normalizeKey(event: KeyboardEvent): string {
  let key = event.key;
  const code = event.code;
  
  // Handle numpad keys based on NumLock state
  if (code.startsWith('Numpad') || event.location === 3) {
    const isNumLockOn = event.getModifierState('NumLock');
    
    if (isNumLockOn && NUMPAD_KEY_MAP[code]) {
      // NumLock on: return digit/operator
      return NUMPAD_KEY_MAP[code];
    } else if (!isNumLockOn && NUMPAD_NAVIGATION_MAP[code]) {
      // NumLock off: return navigation key
      return NUMPAD_NAVIGATION_MAP[code];
    }
    
    // Fallback to original key if no mapping found
    if (!isNumLockOn && NUMPAD_KEY_MAP[code]) {
      return NUMPAD_KEY_MAP[code];
    }
  }
  
  // Handle symbol-to-base character mapping for shifted keys (numbers and punctuation)
  if (SYMBOL_TO_BASE_MAP[key]) {
    return SYMBOL_TO_BASE_MAP[key];
  }
  
  // Handle general key normalization
  if (KEY_CODE_NORMALIZATION_MAP[key]) {
    return KEY_CODE_NORMALIZATION_MAP[key];
  }
  
  // Normalize letter keys to lowercase
  if (key.length === 1 && key >= 'A' && key <= 'Z') {
    return key.toLowerCase();
  }
  
  return key;
}

/**
 * Gets the normalized key code for consistent identification
 * 
 * @param event - The keyboard event
 * @returns Normalized key code
 */
export function normalizeKeyCode(event: KeyboardEvent): string {
  // Prefer event.code for physical key identification
  let code = event.code;
  
  // Handle cases where code might be empty or inconsistent
  if (!code) {
    // Fallback to constructing code from key
    const key = event.key;
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      code = `Key${key.toUpperCase()}`;
    } else if (key.length === 1 && key >= '0' && key <= '9') {
      code = `Digit${key}`;
    } else {
      code = key;
    }
  }
  
  return code;
}

/**
 * Checks if a key event represents a numpad key
 * 
 * @param event - The keyboard event to check
 * @returns True if the key is from the numpad
 */
export function isNumpadKey(event: KeyboardEvent): boolean {
  return event.code.startsWith('Numpad') || event.location === 3;
}

/**
 * Gets the semantic meaning of a numpad key based on NumLock state
 * 
 * @param event - The keyboard event for a numpad key
 * @returns Object with digit and navigation values, plus active mode
 */
export function getNumpadKeyInfo(event: KeyboardEvent): {
  digit: string | null;
  navigation: string | null; 
  activeMode: 'digit' | 'navigation';
  isNumLockOn: boolean;
} {
  const code = event.code;
  const isNumLockOn = event.getModifierState('NumLock');
  
  return {
    digit: NUMPAD_KEY_MAP[code] || null,
    navigation: NUMPAD_NAVIGATION_MAP[code] || null,
    activeMode: isNumLockOn ? 'digit' : 'navigation',
    isNumLockOn
  };
}

/**
 * Checks if a key represents a modifier key
 * 
 * @param key - The key string to check
 * @returns True if the key is a modifier key
 */
export function isModifierKey(key: string): boolean {
  const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock'];
  return modifierKeys.indexOf(key) !== -1;
}

/**
 * Gets comprehensive modifier state from a keyboard event
 * 
 * @param event - The keyboard event
 * @returns Object with all modifier states
 */
export function getModifierStates(event: KeyboardEvent) {
  return {
    shift: event.getModifierState('Shift'),
    ctrl: event.getModifierState('Control'),
    alt: event.getModifierState('Alt'),
    meta: event.getModifierState('Meta'),
    caps: event.getModifierState('CapsLock'),
    numLock: event.getModifierState('NumLock'),
    scrollLock: event.getModifierState('ScrollLock'),
  };
}

// Export mapping tables for testing and advanced usage
export {
  SYMBOL_TO_BASE_MAP,
  NUMPAD_KEY_MAP,
  NUMPAD_NAVIGATION_MAP,
  KEY_CODE_NORMALIZATION_MAP,
};