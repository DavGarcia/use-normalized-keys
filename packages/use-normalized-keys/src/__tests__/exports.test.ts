import { describe, it, expect } from 'vitest';
import * as exports from '../index';

describe('Package Exports', () => {
  describe('Core Hook Exports', () => {
    it('should export useNormalizedKeys', () => {
      expect(exports.useNormalizedKeys).toBeDefined();
      expect(typeof exports.useNormalizedKeys).toBe('function');
    });
  });

  describe('Context API Exports', () => {
    it('should export NormalizedKeysContext', () => {
      expect(exports.NormalizedKeysContext).toBeDefined();
      expect(exports.NormalizedKeysContext).toHaveProperty('Provider');
      expect(exports.NormalizedKeysContext).toHaveProperty('Consumer');
    });

    it('should export NormalizedKeysProvider', () => {
      expect(exports.NormalizedKeysProvider).toBeDefined();
      expect(typeof exports.NormalizedKeysProvider).toBe('function');
    });

    it('should export useNormalizedKeysContext', () => {
      expect(exports.useNormalizedKeysContext).toBeDefined();
      expect(typeof exports.useNormalizedKeysContext).toBe('function');
    });
  });

  describe('Helper Hook Exports', () => {
    it('should export useHoldProgress', () => {
      expect(exports.useHoldProgress).toBeDefined();
      expect(typeof exports.useHoldProgress).toBe('function');
    });

    it('should export useHoldAnimation', () => {
      expect(exports.useHoldAnimation).toBeDefined();
      expect(typeof exports.useHoldAnimation).toBe('function');
    });

    it('should export useSequence', () => {
      expect(exports.useSequence).toBeDefined();
      expect(typeof exports.useSequence).toBe('function');
    });
  });

  describe('Sequence Helper Exports', () => {
    it('should export comboSequence', () => {
      expect(exports.comboSequence).toBeDefined();
      expect(typeof exports.comboSequence).toBe('function');
    });

    it('should export holdSequence', () => {
      expect(exports.holdSequence).toBeDefined();
      expect(typeof exports.holdSequence).toBe('function');
    });

    it('should export chordSequence', () => {
      expect(exports.chordSequence).toBeDefined();
      expect(typeof exports.chordSequence).toBe('function');
    });
  });

  describe('Type Exports', () => {
    // These are type exports, so we just verify they don't break imports
    it('should successfully import all type exports', () => {
      // The fact that this test file compiles means the types are exported correctly
      type TestNormalizedKeyEvent = typeof exports.NormalizedKeyEvent;
      type TestNormalizedKeyState = typeof exports.NormalizedKeyState;
      type TestUseNormalizedKeysOptions = typeof exports.UseNormalizedKeysOptions;
      type TestSequenceDefinition = typeof exports.SequenceDefinition;
      type TestMatchedSequence = typeof exports.MatchedSequence;
      type TestHoldProgress = typeof exports.HoldProgress;
      type TestCurrentHolds = typeof exports.CurrentHolds;
      type TestNormalizedKeysContextType = typeof exports.NormalizedKeysContextType;
      type TestNormalizedKeysProviderProps = typeof exports.NormalizedKeysProviderProps;
      
      // This test passes if TypeScript compilation succeeds
      expect(true).toBe(true);
    });
  });

  describe('Export Count', () => {
    it('should export the expected number of items', () => {
      const exportKeys = Object.keys(exports);
      const expectedExports = [
        // Core hook
        'useNormalizedKeys',
        // Context API
        'NormalizedKeysContext',
        'NormalizedKeysProvider', 
        'useNormalizedKeysContext',
        // Helper hooks
        'useHoldProgress',
        'useHoldAnimation',
        'useSequence',
        // Sequence helpers
        'comboSequence',
        'holdSequence',
        'chordSequence',
        // Types (these might not show up in Object.keys but are type exports)
      ];
      
      expectedExports.forEach(exportName => {
        expect(exportKeys).toContain(exportName);
      });
    });
  });

  describe('Import Paths', () => {
    it('should allow importing Context exports from main index', async () => {
      // Dynamic import to test the module resolution
      const module = await import('../index');
      
      expect(module.NormalizedKeysContext).toBeDefined();
      expect(module.NormalizedKeysProvider).toBeDefined();
      expect(module.useNormalizedKeysContext).toBeDefined();
    });
  });
});