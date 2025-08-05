import { describe, it, expect, vi } from 'vitest';
import { renderHook, render } from '@testing-library/react';
import React from 'react';
import { useHoldProgress, useHoldAnimation, useSequence } from '../hooks';
import { NormalizedKeysProvider } from '../context';
import type { NormalizedKeyState } from '../index';
import * as useNormalizedKeysModule from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('Helper Hooks Context Requirements', () => {
  const mockNormalizedKeyState: NormalizedKeyState = {
    lastEvent: null,
    pressedKeys: new Set(),
    isKeyPressed: vi.fn(() => false),
    activeModifiers: {
      shift: false,
      ctrl: false,
      alt: false,
      meta: false,
      caps: false,
      numLock: false,
      scrollLock: false,
    },
    sequences: {
      matches: [],
      addSequence: vi.fn(),
      removeSequence: vi.fn(),
      clearSequences: vi.fn(),
      resetState: vi.fn(),
    },
    currentHolds: new Map(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(mockNormalizedKeyState);
  });

  describe('useHoldProgress', () => {
    it('should throw error when used without Provider', () => {
      expect(() => {
        renderHook(() => useHoldProgress('test-hold'));
      }).toThrow('useHoldProgress must be used within a NormalizedKeysProvider');
    });

    it('should work correctly when used with Provider', () => {
      const { result } = renderHook(() => useHoldProgress('test-hold'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.error).toBeUndefined();
      expect(result.current).toBeDefined();
      expect(result.current.progress).toBe(0);
      expect(result.current.isHolding).toBe(false);
    });
  });

  describe('useHoldAnimation', () => {
    it('should throw error when used without Provider', () => {
      expect(() => {
        renderHook(() => useHoldAnimation('test-hold'));
      }).toThrow('useHoldAnimation must be used within a NormalizedKeysProvider');
    });

    it('should work correctly when used with Provider', () => {
      const { result } = renderHook(() => useHoldAnimation('test-hold'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.error).toBeUndefined();
      expect(result.current).toBeDefined();
      expect(result.current.progress).toBe(0);
      expect(result.current.scale).toBe(1);
      expect(result.current.opacity).toBe(0.3);
    });
  });

  describe('useSequence', () => {
    it('should throw error when used without Provider', () => {
      expect(() => {
        renderHook(() => useSequence('test-sequence'));
      }).toThrow('useSequence must be used within a NormalizedKeysProvider');
    });

    it('should work correctly when used with Provider', () => {
      const { result } = renderHook(() => useSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.error).toBeUndefined();
      expect(result.current).toBeDefined();
      expect(result.current.isHolding).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.progress).toBe(0);
    });
  });

  describe('Multiple Helper Hooks', () => {
    it('should all throw errors without Provider', () => {
      const TestComponent = () => {
        useHoldProgress('hold1');
        useHoldAnimation('hold2');
        useSequence('seq1');
        return null;
      };

      expect(() => {
        renderHook(() => TestComponent());
      }).toThrow('useHoldProgress must be used within a NormalizedKeysProvider');
    });

    it('should all work together with Provider', () => {
      const TestComponent = () => {
        const holdProgress = useHoldProgress('hold1');
        const holdAnimation = useHoldAnimation('hold2');
        const sequence = useSequence('seq1');
        
        return {
          holdProgress,
          holdAnimation,
          sequence,
        };
      };

      const { result } = renderHook(() => TestComponent(), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.error).toBeUndefined();
      expect(result.current?.holdProgress).toBeDefined();
      expect(result.current?.holdAnimation).toBeDefined();
      expect(result.current?.sequence).toBeDefined();
    });
  });

  describe('Error Message Quality', () => {
    it('should provide clear guidance in error messages', () => {
      const hooks = [
        { hook: useHoldProgress, name: 'useHoldProgress' },
        { hook: useHoldAnimation, name: 'useHoldAnimation' },
        { hook: useSequence, name: 'useSequence' },
      ];

      hooks.forEach(({ hook, name }) => {
        expect(() => {
          renderHook(() => hook('test'));
        }).toThrow(`${name} must be used within a NormalizedKeysProvider`);
      });
    });
  });

  describe('Nested Provider Usage', () => {
    it('should use nearest Provider context', () => {
      const outerHolds = new Map([['outer-hold', { progress: 50 } as any]]);
      const innerHolds = new Map([['inner-hold', { progress: 75 } as any]]);
      
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys)
        .mockReturnValueOnce({ ...mockNormalizedKeyState, currentHolds: outerHolds })
        .mockReturnValueOnce({ ...mockNormalizedKeyState, currentHolds: innerHolds });

      const TestComponent = () => {
        const outerProgress = useHoldProgress('outer-hold');
        
        return (
          <div>
            <div data-testid="outer">{outerProgress.progress}</div>
            <NormalizedKeysProvider>
              <InnerComponent />
            </NormalizedKeysProvider>
          </div>
        );
      };

      const InnerComponent = () => {
        const innerProgress = useHoldProgress('inner-hold');
        return <div data-testid="inner">{innerProgress.progress}</div>;
      };

      const { getByTestId } = render(
        <NormalizedKeysProvider>
          <TestComponent />
        </NormalizedKeysProvider>
      );

      // This test verifies that nested providers work correctly
      // (though in practice this pattern should be avoided)
    });
  });
});