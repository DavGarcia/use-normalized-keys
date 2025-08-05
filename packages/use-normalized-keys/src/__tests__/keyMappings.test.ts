import { describe, it, expect, vi } from 'vitest';
import {
  normalizeKey,
  normalizeKeyCode,
  isNumpadKey,
  isModifierKey,
  getModifierStates,
  getNumpadKeyInfo,
  NUMPAD_KEY_MAP,
  NUMPAD_NAVIGATION_MAP,
  KEY_CODE_NORMALIZATION_MAP,
  SYMBOL_TO_BASE_MAP,
} from '../keyMappings';
import { createKeyboardEvent } from './testUtils';

describe('keyMappings', () => {
  describe('normalizeKey', () => {
    it('should normalize symbol keys to digits', () => {
      const event = createKeyboardEvent('keydown', { key: '!', code: 'Digit1' });
      expect(normalizeKey(event)).toBe('1');
    });

    it('should normalize all shift+digit symbols', () => {
      // Test digit symbols using SYMBOL_TO_BASE_MAP (which includes digit mappings)
      const digitSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      const expectedDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      
      digitSymbols.forEach((symbol, index) => {
        const event = createKeyboardEvent('keydown', { key: symbol });
        expect(normalizeKey(event)).toBe(expectedDigits[index]);
      });
    });

    it('should normalize punctuation symbols to base characters', () => {
      // Test minus/underscore
      const underscoreEvent = createKeyboardEvent('keydown', { key: '_', code: 'Minus' });
      expect(normalizeKey(underscoreEvent)).toBe('-');

      // Test equals/plus
      const plusEvent = createKeyboardEvent('keydown', { key: '+', code: 'Equal' });
      expect(normalizeKey(plusEvent)).toBe('=');

      // Test left bracket/left brace
      const leftBraceEvent = createKeyboardEvent('keydown', { key: '{', code: 'BracketLeft' });
      expect(normalizeKey(leftBraceEvent)).toBe('[');

      // Test right bracket/right brace
      const rightBraceEvent = createKeyboardEvent('keydown', { key: '}', code: 'BracketRight' });
      expect(normalizeKey(rightBraceEvent)).toBe(']');

      // Test backslash/pipe
      const pipeEvent = createKeyboardEvent('keydown', { key: '|', code: 'Backslash' });
      expect(normalizeKey(pipeEvent)).toBe('\\');

      // Test semicolon/colon
      const colonEvent = createKeyboardEvent('keydown', { key: ':', code: 'Semicolon' });
      expect(normalizeKey(colonEvent)).toBe(';');

      // Test quote/double quote
      const doubleQuoteEvent = createKeyboardEvent('keydown', { key: '"', code: 'Quote' });
      expect(normalizeKey(doubleQuoteEvent)).toBe("'");

      // Test comma/less than
      const lessThanEvent = createKeyboardEvent('keydown', { key: '<', code: 'Comma' });
      expect(normalizeKey(lessThanEvent)).toBe(',');

      // Test period/greater than
      const greaterThanEvent = createKeyboardEvent('keydown', { key: '>', code: 'Period' });
      expect(normalizeKey(greaterThanEvent)).toBe('.');

      // Test slash/question mark
      const questionEvent = createKeyboardEvent('keydown', { key: '?', code: 'Slash' });
      expect(normalizeKey(questionEvent)).toBe('/');

      // Test backtick/tilde
      const tildeEvent = createKeyboardEvent('keydown', { key: '~', code: 'Backquote' });
      expect(normalizeKey(tildeEvent)).toBe('`');
    });

    it('should handle base punctuation keys without normalization', () => {
      // These should pass through unchanged when not shifted
      const baseKeys = ['-', '=', '[', ']', '\\', ';', "'", ',', '.', '/', '`'];
      
      baseKeys.forEach(key => {
        const event = createKeyboardEvent('keydown', { key });
        expect(normalizeKey(event)).toBe(key);
      });
    });

    it('should normalize uppercase letters to lowercase', () => {
      const event = createKeyboardEvent('keydown', { key: 'A' });
      expect(normalizeKey(event)).toBe('a');
    });

    it('should normalize key variations', () => {
      const spacebar = createKeyboardEvent('keydown', { key: ' ' });
      expect(normalizeKey(spacebar)).toBe('Space');

      const escape = createKeyboardEvent('keydown', { key: 'Esc' });
      expect(normalizeKey(escape)).toBe('Escape');
    });

    it('should handle numpad keys with NumLock on', () => {
      const event = createKeyboardEvent('keydown', {
        key: '1',
        code: 'Numpad1',
        modifierStates: { NumLock: true },
      });
      expect(normalizeKey(event)).toBe('1');
    });

    it('should handle numpad keys with NumLock off', () => {
      const event = createKeyboardEvent('keydown', {
        key: 'End',
        code: 'Numpad1',
        modifierStates: { NumLock: false },
      });
      expect(normalizeKey(event)).toBe('End');
    });

    it('should return original key if no normalization needed', () => {
      const event = createKeyboardEvent('keydown', { key: 'Enter' });
      expect(normalizeKey(event)).toBe('Enter');
    });
  });

  describe('normalizeKeyCode', () => {
    it('should return the event code when available', () => {
      const event = createKeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
      expect(normalizeKeyCode(event)).toBe('KeyA');
    });

    it('should construct code from key when code is empty', () => {
      const letterEvent = { key: 'a', code: '' } as KeyboardEvent;
      expect(normalizeKeyCode(letterEvent)).toBe('KeyA');

      const digitEvent = { key: '5', code: '' } as KeyboardEvent;
      expect(normalizeKeyCode(digitEvent)).toBe('Digit5');

      const otherEvent = { key: 'Enter', code: '' } as KeyboardEvent;
      expect(normalizeKeyCode(otherEvent)).toBe('Enter');
    });
  });

  describe('isNumpadKey', () => {
    it('should identify numpad keys by code', () => {
      const numpadKey = createKeyboardEvent('keydown', {
        key: '1',
        code: 'Numpad1',
      });
      expect(isNumpadKey(numpadKey)).toBe(true);
    });

    it('should identify numpad keys by location', () => {
      const numpadKey = createKeyboardEvent('keydown', {
        key: '1',
        code: 'Digit1',
      });
      // Mock location property
      Object.defineProperty(numpadKey, 'location', { value: 3 });
      expect(isNumpadKey(numpadKey)).toBe(true);
    });

    it('should not identify regular keys as numpad', () => {
      const regularKey = createKeyboardEvent('keydown', {
        key: '1',
        code: 'Digit1',
      });
      expect(isNumpadKey(regularKey)).toBe(false);
    });
  });

  describe('isModifierKey', () => {
    it('should identify modifier keys', () => {
      expect(isModifierKey('Shift')).toBe(true);
      expect(isModifierKey('Control')).toBe(true);
      expect(isModifierKey('Alt')).toBe(true);
      expect(isModifierKey('Meta')).toBe(true);
      expect(isModifierKey('CapsLock')).toBe(true);
      expect(isModifierKey('NumLock')).toBe(true);
      expect(isModifierKey('ScrollLock')).toBe(true);
    });

    it('should not identify regular keys as modifiers', () => {
      expect(isModifierKey('a')).toBe(false);
      expect(isModifierKey('Enter')).toBe(false);
      expect(isModifierKey('Space')).toBe(false);
    });
  });

  describe('getModifierStates', () => {
    it('should get all modifier states', () => {
      const event = createKeyboardEvent('keydown', {
        key: 'a',
        modifierStates: {
          Shift: true,
          Control: false,
          Alt: true,
          Meta: false,
          CapsLock: true,
          NumLock: false,
          ScrollLock: false,
        },
      });

      const states = getModifierStates(event);
      expect(states).toEqual({
        shift: true,
        ctrl: false,
        alt: true,
        meta: false,
        caps: true,
        numLock: false,
        scrollLock: false,
      });
    });
  });

  describe('getNumpadKeyInfo', () => {
    it('should return digit mode info when NumLock is on', () => {
      const event = createKeyboardEvent('keydown', {
        key: '1',
        code: 'Numpad1',
        modifierStates: { NumLock: true },
      });

      const info = getNumpadKeyInfo(event);
      expect(info).toEqual({
        digit: '1',
        navigation: 'End',
        activeMode: 'digit',
        isNumLockOn: true,
      });
    });

    it('should return navigation mode info when NumLock is off', () => {
      const event = createKeyboardEvent('keydown', {
        key: 'End',
        code: 'Numpad1',
        modifierStates: { NumLock: false },
      });

      const info = getNumpadKeyInfo(event);
      expect(info).toEqual({
        digit: '1',
        navigation: 'End',
        activeMode: 'navigation',
        isNumLockOn: false,
      });
    });

    it('should handle numpad operator keys', () => {
      const event = createKeyboardEvent('keydown', {
        key: '+',
        code: 'NumpadAdd',
        modifierStates: { NumLock: true },
      });

      const info = getNumpadKeyInfo(event);
      expect(info).toEqual({
        digit: '+',
        navigation: null,
        activeMode: 'digit',
        isNumLockOn: true,
      });
    });
  });

  describe('Mapping Tables', () => {
    // SYMBOL_TO_DIGIT_MAP has been removed as dead code - its functionality is in SYMBOL_TO_BASE_MAP

    it('should have correct numpad key mappings', () => {
      expect(NUMPAD_KEY_MAP['Numpad0']).toBe('0');
      expect(NUMPAD_KEY_MAP['NumpadDecimal']).toBe('.');
      expect(NUMPAD_KEY_MAP['NumpadAdd']).toBe('+');
      expect(NUMPAD_KEY_MAP['NumpadEnter']).toBe('Enter');
    });

    it('should have correct numpad navigation mappings', () => {
      expect(NUMPAD_NAVIGATION_MAP['Numpad1']).toBe('End');
      expect(NUMPAD_NAVIGATION_MAP['Numpad7']).toBe('Home');
      expect(NUMPAD_NAVIGATION_MAP['Numpad5']).toBe('Clear');
      expect(NUMPAD_NAVIGATION_MAP['NumpadDecimal']).toBe('Delete');
    });

    it('should have correct key code normalization mappings', () => {
      expect(KEY_CODE_NORMALIZATION_MAP[' ']).toBe('Space');
      expect(KEY_CODE_NORMALIZATION_MAP['Esc']).toBe('Escape');
      expect(KEY_CODE_NORMALIZATION_MAP['Ctrl']).toBe('Control');
      expect(KEY_CODE_NORMALIZATION_MAP['Cmd']).toBe('Meta');
    });

    it('should have correct symbol to base character mappings', () => {
      // Test digit symbols (should be included in SYMBOL_TO_BASE_MAP)
      expect(SYMBOL_TO_BASE_MAP['!']).toBe('1');
      expect(SYMBOL_TO_BASE_MAP['@']).toBe('2');
      expect(SYMBOL_TO_BASE_MAP[')']).toBe('0');
      
      // Test punctuation symbols
      expect(SYMBOL_TO_BASE_MAP['_']).toBe('-');
      expect(SYMBOL_TO_BASE_MAP['+']).toBe('=');
      expect(SYMBOL_TO_BASE_MAP['{']).toBe('[');
      expect(SYMBOL_TO_BASE_MAP['}']).toBe(']');
      expect(SYMBOL_TO_BASE_MAP['|']).toBe('\\');
      expect(SYMBOL_TO_BASE_MAP[':']).toBe(';');
      expect(SYMBOL_TO_BASE_MAP['"']).toBe("'");
      expect(SYMBOL_TO_BASE_MAP['<']).toBe(',');
      expect(SYMBOL_TO_BASE_MAP['>']).toBe('.');
      expect(SYMBOL_TO_BASE_MAP['?']).toBe('/');
      expect(SYMBOL_TO_BASE_MAP['~']).toBe('`');
    });
  });
});