import { describe, it, expect } from 'vitest';
import {
  holdSequence,
  comboSequence,
  chordSequence,
  holdSequences
} from '../sequenceHelpers';

describe('sequenceHelpers', () => {
  describe('holdSequence', () => {
    it('should create a basic hold sequence', () => {
      const result = holdSequence('test-hold', 'f', 1000);
      
      expect(result).toEqual({
        id: 'test-hold',
        name: 'Hold f',
        keys: [{ key: 'f', minHoldTime: 1000 }],
        type: 'hold'
      });
    });

    it('should normalize space key', () => {
      const result = holdSequence('charge-jump', ' ', 750);
      
      expect(result.keys[0]).toEqual({
        key: 'Space',
        minHoldTime: 750
      });
      expect(result.name).toBe('Hold Space');
    });

    it('should accept custom name', () => {
      const result = holdSequence('power-attack', 'f', 1000, { name: 'Power Attack' });
      
      expect(result.name).toBe('Power Attack');
    });

    it('should include modifiers when provided', () => {
      const result = holdSequence('special-move', 's', 600, {
        name: 'Special Move',
        modifiers: { ctrl: true, shift: false }
      });
      
      expect(result.keys[0]).toEqual({
        key: 's',
        minHoldTime: 600,
        modifiers: { ctrl: true, shift: false }
      });
    });
  });

  describe('comboSequence', () => {
    it('should create a basic combo sequence', () => {
      const result = comboSequence('test-combo', ['a', 'b', 'c']);
      
      expect(result).toEqual({
        id: 'test-combo',
        name: 'a → b → c',
        keys: ['a', 'b', 'c'],
        type: 'sequence',
        timeout: 1000
      });
    });

    it('should normalize space keys in combo', () => {
      const result = comboSequence('jump-combo', ['↑', ' ', '↑']);
      
      expect(result.keys).toEqual(['↑', 'Space', '↑']);
    });

    it('should accept custom timeout', () => {
      const result = comboSequence('quick-combo', ['j', 'k'], { timeout: 300 });
      
      expect(result.timeout).toBe(300);
    });

    it('should include optional flags when provided', () => {
      const result = comboSequence('flexible-combo', ['a', 'b'], {
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
      const result = chordSequence('save', ['Control', 's']);
      
      expect(result).toEqual({
        id: 'save',
        name: 'Control + s',
        keys: ['Control', 's'],
        type: 'chord'
      });
    });

    it('should accept custom name', () => {
      const result = chordSequence('copy', ['Control', 'c'], { name: 'Copy' });
      
      expect(result.name).toBe('Copy');
    });

    it('should include allowOtherKeys when provided', () => {
      const result = chordSequence('test-chord', ['a', 'b'], { allowOtherKeys: true });
      
      expect(result.allowOtherKeys).toBe(true);
    });
  });

  describe('holdSequences', () => {
    it('should create multiple hold sequences', () => {
      const configs = [
        { id: 'light-punch', key: 'j', duration: 200 },
        { id: 'medium-punch', key: 'j', duration: 500 },
        { id: 'heavy-punch', key: 'j', duration: 1000 }
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
          key: 's', 
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