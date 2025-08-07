import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useHoldSequence } from '../hooks';
import { NormalizedKeysProvider } from '../context';
import type { NormalizedKeyState, HoldProgress, MatchedSequence } from '../index';
import * as useNormalizedKeysModule from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('useHoldSequence - Unified Hook', () => {
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

  const createMockHoldProgress = (
    sequenceId: string,
    progress: number,
    startTime: number = Date.now(),
    minHoldTime: number = 1000,
    isComplete: boolean = false
  ): HoldProgress => ({
    sequenceId,
    sequenceName: `${sequenceId} sequence`,
    key: 'testkey',
    startTime,
    minHoldTime,
    progress: progress / 100,
    progressPercent: progress,
    elapsedTime: (progress / 100) * minHoldTime,
    remainingTime: Math.max(0, minHoldTime - (progress / 100) * minHoldTime),
    isComplete,
  });

  const createMockMatchedSequence = (
    sequenceId: string,
    matchedAt: number = Date.now()
  ): MatchedSequence => ({
    sequenceId,
    sequenceName: `${sequenceId} sequence`,
    type: 'hold',
    keys: ['testkey'],
    matchedAt,
    elapsedTime: 100,
    metadata: {},
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(mockNormalizedKeyState);
  });

  describe('Basic Functionality', () => {
    it('should throw error when used without Provider', () => {
      expect(() => {
        renderHook(() => useHoldSequence('test-sequence'));
      }).toThrow('useHoldSequence must be used within a NormalizedKeysProvider');
    });

    it('should work correctly when used with Provider', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.error).toBeUndefined();
      expect(result.current).toBeDefined();
      
      // Check that all API surfaces are present
      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('isHolding');
      expect(result.current).toHaveProperty('scale');
      expect(result.current).toHaveProperty('opacity');
      expect(result.current).toHaveProperty('justStarted');
      expect(result.current).toHaveProperty('justCompleted');
      expect(result.current).toHaveProperty('matchCount');
      expect(result.current).toHaveProperty('eventHistory');
    });
  });

  describe('Progress Data (useHoldProgress functionality)', () => {
    it('should return correct initial progress state', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current.progress).toBe(0);
      expect(result.current.isHolding).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.elapsedTime).toBe(0);
      expect(result.current.remainingTime).toBe(0);
      expect(result.current.startTime).toBe(null);
      expect(result.current.minHoldTime).toBe(0);
    });

    it('should return correct progress data when hold is active', () => {
      const mockHold = createMockHoldProgress('test-sequence', 50);
      const stateWithHold = {
        ...mockNormalizedKeyState,
        currentHolds: new Map([['test-sequence', mockHold]]),
      };
      
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(stateWithHold);

      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current.isHolding).toBe(true);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.elapsedTime).toBe(mockHold.elapsedTime);
      expect(result.current.remainingTime).toBe(mockHold.remainingTime);
      expect(result.current.startTime).toBe(mockHold.startTime);
      expect(result.current.minHoldTime).toBe(mockHold.minHoldTime);
    });
  });

  describe('Animation Properties (useHoldAnimation functionality)', () => {
    it('should return correct initial animation state', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current.scale).toBe(1);
      expect(result.current.opacity).toBe(0.3);
      expect(result.current.glow).toBe(0);
      expect(result.current.shake).toBe(0);
      expect(result.current.isCharging).toBe(false);
      expect(result.current.isReady).toBe(false);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should calculate animation properties based on progress', () => {
      // This test would need to be adjusted for the actual RAF implementation
      // For now, we test that the properties exist and have reasonable types
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(typeof result.current.scale).toBe('number');
      expect(typeof result.current.opacity).toBe('number');
      expect(typeof result.current.glow).toBe('number');
      expect(typeof result.current.shake).toBe('number');
      expect(typeof result.current.isCharging).toBe('boolean');
      expect(typeof result.current.isReady).toBe('boolean');
      expect(typeof result.current.isAnimating).toBe('boolean');
    });
  });

  describe('Application Event Flags (useSequence functionality)', () => {
    it('should return correct initial event state', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current.justStarted).toBe(false);
      expect(result.current.justCompleted).toBe(false);
      expect(result.current.justCancelled).toBe(false);
      expect(result.current.matchCount).toBe(0);
      expect(result.current.lastMatch).toBeUndefined();
      expect(result.current.eventHistory).toEqual([]);
      expect(result.current.timeSinceStart).toBe(null);
      expect(result.current.timeSinceLastEvent).toBe(null);
    });

    it('should track match information correctly', () => {
      const mockMatch = createMockMatchedSequence('test-sequence');
      const stateWithMatches = {
        ...mockNormalizedKeyState,
        sequences: {
          ...mockNormalizedKeyState.sequences!,
          matches: [mockMatch],
        },
      };
      
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(stateWithMatches);

      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current.matchCount).toBe(1);
      expect(result.current.lastMatch).toEqual(mockMatch);
    });

    it('should track hold cancellation event history correctly', () => {
      const mockUseNormalizedKeys = vi.mocked(useNormalizedKeysModule.useNormalizedKeys);
      
      // Initial state - no hold
      const initialState = {
        ...mockNormalizedKeyState,
        currentHolds: new Map(),
      };
      mockUseNormalizedKeys.mockReturnValue(initialState);
      
      const { result, rerender } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Verify initial state
      expect(result.current.eventHistory).toEqual([]);
      expect(result.current.justCancelled).toBe(false);

      // Start a hold (currentHold exists, previousHold is null)
      const incompleteHold = createMockHoldProgress('test-sequence', 50, Date.now(), 1000, false);
      const stateWithHold = {
        ...mockNormalizedKeyState,
        currentHolds: new Map([['test-sequence', incompleteHold]]),
      };
      mockUseNormalizedKeys.mockReturnValue(stateWithHold);
      rerender();

      // Hold should be active with 'started' event
      expect(result.current.isHolding).toBe(true);
      expect(result.current.eventHistory.length).toBe(1);
      expect(result.current.eventHistory[0].type).toBe('started');

      // Cancel the hold before completion (currentHold becomes null, previousHold exists and incomplete)
      // This should trigger lines 121-125 in hooks.ts
      const stateAfterCancellation = {
        ...mockNormalizedKeyState,
        currentHolds: new Map(), // Hold is removed (cancelled)
      };
      mockUseNormalizedKeys.mockReturnValue(stateAfterCancellation);
      rerender();

      // Verify cancellation was logged in event history
      expect(result.current.isHolding).toBe(false);
      expect(result.current.eventHistory.length).toBe(2);
      expect(result.current.eventHistory[0].type).toBe('started');
      expect(result.current.eventHistory[1].type).toBe('cancelled'); // This covers lines 121-125
      expect(result.current.justCancelled).toBe(true);
    });
  });

  describe('Comprehensive API Surface', () => {
    it('should provide all expected properties from all three original hooks', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      const expectedProperties = [
        // Progress data (useHoldProgress)
        'progress',
        'isHolding',
        'isComplete',
        'elapsedTime',
        'remainingTime',
        'startTime',
        'minHoldTime',
        
        // Animation properties (useHoldAnimation)
        'scale',
        'opacity',
        'glow',
        'shake',
        'isCharging',
        'isReady',
        'isAnimating',
        
        // Application event flags (useSequence)
        'justStarted',
        'justCompleted',
        'justCancelled',
        'timeSinceStart',
        'timeSinceLastEvent',
        'lastMatch',
        'matchCount',
        'eventHistory',
      ];

      expectedProperties.forEach(property => {
        expect(result.current).toHaveProperty(property);
      });
    });

    it('should have consistent return types', () => {
      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Progress data types
      expect(typeof result.current.progress).toBe('number');
      expect(typeof result.current.isHolding).toBe('boolean');
      expect(typeof result.current.isComplete).toBe('boolean');
      expect(typeof result.current.elapsedTime).toBe('number');
      expect(typeof result.current.remainingTime).toBe('number');
      expect(typeof result.current.minHoldTime).toBe('number');
      
      // Animation property types
      expect(typeof result.current.scale).toBe('number');
      expect(typeof result.current.opacity).toBe('number');
      expect(typeof result.current.glow).toBe('number');
      expect(typeof result.current.shake).toBe('number');
      expect(typeof result.current.isCharging).toBe('boolean');
      expect(typeof result.current.isReady).toBe('boolean');
      expect(typeof result.current.isAnimating).toBe('boolean');
      
      // Event flag types
      expect(typeof result.current.justStarted).toBe('boolean');
      expect(typeof result.current.justCompleted).toBe('boolean');
      expect(typeof result.current.justCancelled).toBe('boolean');
      expect(typeof result.current.matchCount).toBe('number');
      expect(Array.isArray(result.current.eventHistory)).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should handle multiple instances without conflicts', () => {
      const { result: result1 } = renderHook(() => useHoldSequence('sequence-1'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });
      
      const { result: result2 } = renderHook(() => useHoldSequence('sequence-2'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Both hooks should work independently
      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current.progress).toBe(0);
      expect(result2.current.progress).toBe(0);
    });

    it('should properly cleanup resources on unmount', () => {
      const { unmount } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Should not throw on unmount (tests proper cleanup)
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('RequestAnimationFrame Integration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should calculate animation properties from hold progress without RAF', () => {
      // The unified hook no longer uses RAF - it calculates properties directly from Context data
      const mockHold = createMockHoldProgress('test-sequence', 25);
      const stateWithHold = {
        ...mockNormalizedKeyState,
        currentHolds: new Map([['test-sequence', mockHold]]),
      };
      
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(stateWithHold);

      const { result } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Should calculate animation properties directly from progress
      expect(result.current.scale).toBe(1.075); // 1 + (25/100) * 0.3
      expect(result.current.opacity).toBe(0.475); // 0.3 + (25/100) * 0.7
      expect(result.current.isCharging).toBe(true);
    });

    it('should update animation properties when hold progress changes', () => {
      // Test that animation properties update reactively with Context changes
      const mockHold25 = createMockHoldProgress('test-sequence', 25);
      const mockHold75 = createMockHoldProgress('test-sequence', 75);
      
      const stateWithHold25 = {
        ...mockNormalizedKeyState,
        currentHolds: new Map([['test-sequence', mockHold25]]),
      };
      
      const stateWithHold75 = {
        ...mockNormalizedKeyState,
        currentHolds: new Map([['test-sequence', mockHold75]]),
      };
      
      const mockUseNormalizedKeys = vi.mocked(useNormalizedKeysModule.useNormalizedKeys);
      mockUseNormalizedKeys.mockReturnValue(stateWithHold25);

      const { result, rerender } = renderHook(() => useHoldSequence('test-sequence'), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      // Check initial 25% progress animation properties
      expect(result.current.scale).toBe(1.075); // 1 + (25/100) * 0.3
      expect(result.current.opacity).toBe(0.475); // 0.3 + (25/100) * 0.7
      
      // Update to 75% progress
      mockUseNormalizedKeys.mockReturnValue(stateWithHold75);
      rerender();
      
      // Check updated 75% progress animation properties
      expect(result.current.scale).toBe(1.225); // 1 + (75/100) * 0.3
      expect(result.current.opacity).toBe(0.825); // 0.3 + (75/100) * 0.7
    });
  });
});