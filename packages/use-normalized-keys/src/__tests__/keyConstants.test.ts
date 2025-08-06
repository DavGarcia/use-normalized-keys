import { describe, it, expect } from 'vitest';
import { Keys, CommonSequences, isValidNormalizedKey, getKeyDescription } from '../keyConstants';

describe('Key Constants', () => {
  describe('Keys constant', () => {
    it('should have correct special key values', () => {
      expect(Keys.SPACE).toBe('Space');
      expect(Keys.ENTER).toBe('Enter');
      expect(Keys.TAB).toBe('Tab');
      expect(Keys.ESCAPE).toBe('Escape');
      expect(Keys.BACKSPACE).toBe('Backspace');
      expect(Keys.DELETE).toBe('Delete');
    });

    it('should have correct arrow key values', () => {
      expect(Keys.ARROW_UP).toBe('ArrowUp');
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');
      expect(Keys.ARROW_LEFT).toBe('ArrowLeft');
      expect(Keys.ARROW_RIGHT).toBe('ArrowRight');
    });

    it('should have correct modifier key values', () => {
      expect(Keys.SHIFT).toBe('Shift');
      expect(Keys.CONTROL).toBe('Control');
      expect(Keys.ALT).toBe('Alt');
      expect(Keys.META).toBe('Meta');
      expect(Keys.CAPS_LOCK).toBe('CapsLock');
    });

    it('should have correct function key values', () => {
      expect(Keys.F1).toBe('F1');
      expect(Keys.F5).toBe('F5');
      expect(Keys.F12).toBe('F12');
    });

    it('should have correct number key values', () => {
      expect(Keys.DIGIT_1).toBe('1');
      expect(Keys.DIGIT_5).toBe('5');
      expect(Keys.DIGIT_0).toBe('0');
    });

    it('should have correct letter key values (lowercase)', () => {
      expect(Keys.a).toBe('a');
      expect(Keys.z).toBe('z');
      expect(Keys.W).toBe('w');  // Gaming keys mapped to lowercase
      expect(Keys.A).toBe('a');
      expect(Keys.S).toBe('s');
      expect(Keys.D).toBe('d');
    });

    it('should have correct punctuation key values', () => {
      expect(Keys.MINUS).toBe('-');
      expect(Keys.EQUALS).toBe('=');
      expect(Keys.BRACKET_LEFT).toBe('[');
      expect(Keys.BRACKET_RIGHT).toBe(']');
      expect(Keys.SEMICOLON).toBe(';');
      expect(Keys.QUOTE).toBe("'");
      expect(Keys.COMMA).toBe(',');
      expect(Keys.PERIOD).toBe('.');
      expect(Keys.SLASH).toBe('/');
    });
  });

  describe('CommonSequences constant', () => {
    it('should have correct Konami code sequence', () => {
      expect(CommonSequences.KONAMI_CODE).toEqual([
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a'
      ]);
    });

    it('should have correct fighting game sequences', () => {
      expect(CommonSequences.HADOUKEN).toEqual([
        'ArrowDown', 'ArrowDown+ArrowRight', 'ArrowRight'
      ]);
      
      expect(CommonSequences.SHORYUKEN).toEqual([
        'ArrowRight', 'ArrowDown', 'ArrowDown+ArrowRight'
      ]);
    });

    it('should have vim escape sequence', () => {
      expect(CommonSequences.VIM_ESCAPE).toEqual(['j', 'k']);
    });
  });

  describe('isValidNormalizedKey function', () => {
    it('should validate correct key values', () => {
      expect(isValidNormalizedKey('Space')).toBe(true);
      expect(isValidNormalizedKey('ArrowUp')).toBe(true);
      expect(isValidNormalizedKey('Control')).toBe(true);
      expect(isValidNormalizedKey('a')).toBe(true);
      expect(isValidNormalizedKey('F5')).toBe(true);
    });

    it('should reject incorrect key values', () => {
      expect(isValidNormalizedKey(' ')).toBe(false);      // Space character instead of 'Space'
      expect(isValidNormalizedKey('↑')).toBe(false);       // Unicode arrow instead of 'ArrowUp'
      expect(isValidNormalizedKey('ctrl')).toBe(false);    // Lowercase instead of 'Control'
      expect(isValidNormalizedKey('cmd')).toBe(false);     // Common alias instead of 'Meta'
      expect(isValidNormalizedKey('Up')).toBe(false);      // Old format instead of 'ArrowUp'
    });

    it('should reject empty and invalid strings', () => {
      expect(isValidNormalizedKey('')).toBe(false);
      expect(isValidNormalizedKey('InvalidKey')).toBe(false);
      expect(isValidNormalizedKey('123InvalidKey')).toBe(false);
    });
  });

  describe('getKeyDescription function', () => {
    it('should provide human-readable descriptions for special keys', () => {
      expect(getKeyDescription('Space')).toBe('Space Bar');
      expect(getKeyDescription('ArrowUp')).toBe('Up Arrow ↑');
      expect(getKeyDescription('ArrowDown')).toBe('Down Arrow ↓');
      expect(getKeyDescription('ArrowLeft')).toBe('Left Arrow ←');
      expect(getKeyDescription('ArrowRight')).toBe('Right Arrow →');
      expect(getKeyDescription('Control')).toBe('Ctrl');
      expect(getKeyDescription('Meta')).toBe('Cmd/Windows Key');
      expect(getKeyDescription('Enter')).toBe('Enter/Return');
    });

    it('should return the key itself for keys without special descriptions', () => {
      expect(getKeyDescription('a')).toBe('a');
      expect(getKeyDescription('F5')).toBe('F5');
      expect(getKeyDescription('1')).toBe('1');
    });
  });

  describe('Type safety', () => {
    it('should ensure all Keys values are strings', () => {
      Object.values(Keys).forEach(key => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      });
    });

    it('should ensure CommonSequences values are arrays of strings', () => {
      Object.values(CommonSequences).forEach(sequence => {
        expect(Array.isArray(sequence)).toBe(true);
        sequence.forEach(key => {
          expect(typeof key).toBe('string');
          expect(key.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Integration with key mapping expectations', () => {
    it('should use normalized forms that match key mapping system', () => {
      // These are the key patterns our normalization system expects
      expect(Keys.SPACE).toBe('Space');  // Not ' '
      expect(Keys.CONTROL).toBe('Control');  // Not 'Ctrl'
      expect(Keys.META).toBe('Meta');  // Not 'Cmd' or 'Windows'
      
      // Arrow keys should match the standard KeyboardEvent.key values
      expect(Keys.ARROW_UP).toBe('ArrowUp');
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');
      expect(Keys.ARROW_LEFT).toBe('ArrowLeft');
      expect(Keys.ARROW_RIGHT).toBe('ArrowRight');
      
      // Letters should be lowercase (normalized form)
      expect(Keys.a).toBe('a');
      expect(Keys.z).toBe('z');
    });

    it('should provide gaming-friendly key constants', () => {
      // WASD gaming keys should be lowercase
      expect(Keys.W).toBe('w');
      expect(Keys.A).toBe('a');
      expect(Keys.S).toBe('s');
      expect(Keys.D).toBe('d');
    });
  });

  describe('Common developer mistakes prevention', () => {
    it('should not include common mistake values in valid keys', () => {
      // These are common mistakes developers make
      const commonMistakes = [' ', '↑', '↓', '←', '→', 'ctrl', 'Ctrl', 'cmd', 'Up', 'Down', 'Left', 'Right'];
      
      commonMistakes.forEach(mistake => {
        expect(isValidNormalizedKey(mistake)).toBe(false);
        expect(Object.values(Keys).includes(mistake as any)).toBe(false);
      });
    });

    it('should provide the correct alternatives to common mistakes', () => {
      // Verify that we have the correct alternatives
      expect(Keys.SPACE).toBe('Space');  // Not ' '
      expect(Keys.ARROW_UP).toBe('ArrowUp');  // Not '↑' or 'Up'
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');  // Not '↓' or 'Down'
      expect(Keys.CONTROL).toBe('Control');  // Not 'ctrl' or 'Ctrl'
      expect(Keys.META).toBe('Meta');  // Not 'cmd'
    });
  });
});