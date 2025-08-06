/**
 * Normalized Key Constants
 * 
 * This module provides TypeScript constants for all normalized key values
 * to improve developer experience and reduce errors when setting up sequences.
 * 
 * Instead of guessing key names, import these constants:
 * 
 * @example
 * ```typescript
 * import { Keys } from 'use-normalized-keys';
 * 
 * // ✅ Good - Type-safe and clear
 * holdSequence('brush-pressure', Keys.b, 800)
 * comboSequence('save-file', [Keys.CONTROL, Keys.s], { timeout: 500 })
 * 
 * // ❌ Avoid - Error-prone
 * holdSequence('brush-pressure', ' ', 800)  // Should be 'b'
 * comboSequence('save-file', ['ctrl', 's'])  // Should use Keys constants
 * ```
 */

/**
 * All normalized key constants organized by category
 */
export const Keys = {
  // ========================================
  // SPECIAL KEYS
  // ========================================
  SPACE: 'Space',
  ENTER: 'Enter',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  
  // ========================================
  // ARROW KEYS (Navigation)
  // ========================================
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown', 
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  
  // Diagonal arrows (for directional input)
  ARROW_UP_LEFT: 'ArrowUp+ArrowLeft',     // ↖ diagonal
  ARROW_UP_RIGHT: 'ArrowUp+ArrowRight',   // ↗ diagonal  
  ARROW_DOWN_LEFT: 'ArrowDown+ArrowLeft', // ↙ diagonal
  ARROW_DOWN_RIGHT: 'ArrowDown+ArrowRight', // ↘ diagonal
  
  // ========================================
  // MODIFIER KEYS
  // ========================================
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta',
  CAPS_LOCK: 'CapsLock',
  
  // ========================================
  // FUNCTION KEYS
  // ========================================
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
  F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8', 
  F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  
  // ========================================
  // NUMBER ROW (Top of keyboard)
  // ========================================
  DIGIT_1: '1', DIGIT_2: '2', DIGIT_3: '3', DIGIT_4: '4', DIGIT_5: '5',
  DIGIT_6: '6', DIGIT_7: '7', DIGIT_8: '8', DIGIT_9: '9', DIGIT_0: '0',
  
  // ========================================
  // LETTERS (Lowercase normalized)
  // ========================================
  a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i',
  j: 'j', k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r',
  s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x', y: 'y', z: 'z',
  
  // ========================================
  // PUNCTUATION & SYMBOLS (Base form)
  // ========================================
  MINUS: '-',
  EQUALS: '=',
  BRACKET_LEFT: '[',
  BRACKET_RIGHT: ']',
  BACKSLASH: '\\',
  SEMICOLON: ';',
  QUOTE: "'",
  COMMA: ',',
  PERIOD: '.',
  SLASH: '/',
  BACKTICK: '`',
  
  // ========================================
  // NUMPAD KEYS
  // ========================================
  NUMPAD_0: '0',  // When NumLock is on
  NUMPAD_1: '1',  // When NumLock is on
  NUMPAD_2: '2',  // When NumLock is on  
  NUMPAD_3: '3',  // When NumLock is on
  NUMPAD_4: '4',  // When NumLock is on
  NUMPAD_5: '5',  // When NumLock is on
  NUMPAD_6: '6',  // When NumLock is on
  NUMPAD_7: '7',  // When NumLock is on
  NUMPAD_8: '8',  // When NumLock is on
  NUMPAD_9: '9',  // When NumLock is on
  NUMPAD_DECIMAL: '.',  // When NumLock is on
  
  // Numpad when NumLock is OFF maps to arrow keys:
  // NUMPAD_2 -> ArrowDown, NUMPAD_4 -> ArrowLeft, etc.
  // Use the ARROW_* constants above for those cases
  
  // ========================================
  // COMMON PRODUCTIVITY KEYS
  // ========================================
  
  // Navigation keys
  W: 'w', A: 'a', S: 's', D: 'd',
  
  // Common modifier combinations (for reference)
  // Note: These should be used in sequence definitions with modifiers object
  // Example: { key: 's', modifiers: { ctrl: true } }
} as const;

/**
 * Type-safe key value type derived from the Keys constant
 */
export type NormalizedKeyValue = typeof Keys[keyof typeof Keys];

/**
 * Common key sequences for productivity applications
 */
export const CommonSequences = {
  // Text editor shortcuts
  SAVE_FILE: ['Control', 's'] as const,
  COPY: ['Control', 'c'] as const,
  PASTE: ['Control', 'v'] as const,
  UNDO: ['Control', 'z'] as const,
  
  // Drawing tool sequences
  BRUSH_TOOL: ['b'] as const,
  ERASER_TOOL: ['e'] as const,
  PEN_TOOL: ['p'] as const,
  
  // Navigation sequences
  NAVIGATE_UP: ['ArrowUp'] as const,
  NAVIGATE_DOWN: ['ArrowDown'] as const,
  
  // Vim-style escape sequence
  VIM_ESCAPE: ['j', 'k'] as const,
  
  // Quick access sequences
  COMMAND_PALETTE: ['Control', 'Shift', 'p'] as const,
} as const;

/**
 * Helper function to validate if a string is a valid normalized key
 */
export function isValidNormalizedKey(key: string): key is NormalizedKeyValue {
  const validKeys = Object.values(Keys);
  return validKeys.includes(key as NormalizedKeyValue);
}

/**
 * Helper to get a human-readable description of a key
 */
export function getKeyDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'Space': 'Space Bar',
    'ArrowUp': 'Up Arrow ↑',
    'ArrowDown': 'Down Arrow ↓', 
    'ArrowLeft': 'Left Arrow ←',
    'ArrowRight': 'Right Arrow →',
    'Enter': 'Enter/Return',
    'Control': 'Ctrl',
    'Meta': 'Cmd/Windows Key',
    'CapsLock': 'Caps Lock',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Escape': 'Esc',
    'Tab': 'Tab',
  };
  
  return descriptions[key] || key;
}