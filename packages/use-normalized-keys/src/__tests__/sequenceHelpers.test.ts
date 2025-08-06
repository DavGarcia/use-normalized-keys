import { describe, it, expect } from 'vitest';
import {
  holdSequence,
  comboSequence,
  chordSequence,
  holdSequences
} from '../sequenceHelpers';
import { Keys } from '../keyConstants';

describe('sequenceHelpers', () => {
  describe('holdSequence', () => {
    it('should create a basic hold sequence', () => {
      const result = holdSequence('test-hold', Keys.f, 1000);
      
      expect(result).toEqual({
        id: 'test-hold',
        name: 'Hold f',
        keys: [{ key: Keys.f, minHoldTime: 1000 }],
        type: 'hold'
      });
    });

    it('should normalize space key', () => {
      const result = holdSequence('charge-jump', Keys.SPACE, 750);
      
      expect(result.keys[0]).toEqual({
        key: Keys.SPACE,
        minHoldTime: 750
      });
      expect(result.name).toBe('Hold Space');
    });

    it('should accept custom name', () => {
      const result = holdSequence('power-attack', Keys.f, 1000, { name: 'Power Attack' });
      
      expect(result.name).toBe('Power Attack');
    });

    it('should include modifiers when provided', () => {
      const result = holdSequence('special-move', Keys.s, 600, {
        name: 'Special Move',
        modifiers: { ctrl: true, shift: false }
      });
      
      expect(result.keys[0]).toEqual({
        key: Keys.s,
        minHoldTime: 600,
        modifiers: { ctrl: true, shift: false }
      });
    });
  });

  describe('comboSequence', () => {
    it('should create a basic combo sequence', () => {
      const result = comboSequence('test-combo', [Keys.a, Keys.b, Keys.c]);
      
      expect(result).toEqual({
        id: 'test-combo',
        name: 'a → b → c',
        keys: [Keys.a, Keys.b, Keys.c],
        type: 'sequence',
        timeout: 1000
      });
    });

    it('should normalize space keys in combo', () => {
      const result = comboSequence('jump-combo', [Keys.ARROW_UP, Keys.SPACE, Keys.ARROW_UP]);
      
      expect(result.keys).toEqual([Keys.ARROW_UP, Keys.SPACE, Keys.ARROW_UP]);
    });

    it('should accept custom timeout', () => {
      const result = comboSequence('quick-combo', [Keys.j, Keys.k], { timeout: 300 });
      
      expect(result.timeout).toBe(300);
    });

    it('should include optional flags when provided', () => {
      const result = comboSequence('flexible-combo', [Keys.a, Keys.b], {
        allowOtherKeys: true,
        resetOnMismatch: false,
        caseSensitive: true
      });
      
      expect(result.allowOtherKeys).toBe(true);
      expect(result.resetOnMismatch).toBe(false);
      expect(result.caseSensitive).toBe(true);
    });
  });

  describe('chordSequence', () => {
    it('should create a basic chord sequence', () => {
      const result = chordSequence('save', [Keys.CONTROL, Keys.s]);
      
      expect(result).toEqual({
        id: 'save',
        name: 'Control + s',
        keys: [Keys.CONTROL, Keys.s],
        type: 'chord'
      });
    });

    it('should accept custom name', () => {
      const result = chordSequence('copy', [Keys.CONTROL, Keys.c], { name: 'Copy' });
      
      expect(result.name).toBe('Copy');
    });

    it('should include allowOtherKeys when provided', () => {
      const result = chordSequence('test-chord', [Keys.a, Keys.b], { allowOtherKeys: true });
      
      expect(result.allowOtherKeys).toBe(true);
    });
  });

  describe('holdSequences', () => {
    it('should create multiple hold sequences', () => {
      const configs = [
        { id: 'light-punch', key: Keys.j, duration: 200 },
        { id: 'medium-punch', key: Keys.j, duration: 500 },
        { id: 'heavy-punch', key: Keys.j, duration: 1000 }
      ];
      
      const results = holdSequences(configs);
      
      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('light-punch');
      expect(results[0].keys[0].minHoldTime).toBe(200);
      expect(results[1].id).toBe('medium-punch');
      expect(results[1].keys[0].minHoldTime).toBe(500);
      expect(results[2].id).toBe('heavy-punch');
      expect(results[2].keys[0].minHoldTime).toBe(1000);
    });

    it('should pass through names and modifiers', () => {
      const configs = [
        { 
          id: 'special-1', 
          key: Keys.s, 
          duration: 500, 
          name: 'Special Move 1',
          modifiers: { ctrl: true }
        }
      ];
      
      const results = holdSequences(configs);
      
      expect(results[0].name).toBe('Special Move 1');
      expect(results[0].keys[0].modifiers).toEqual({ ctrl: true });
    });
  });

});