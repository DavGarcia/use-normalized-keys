import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSequence } from '../hooks';
import * as useNormalizedKeysModule from '../index';
import type { CurrentHolds, HoldProgress, MatchedSequence } from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('useSequence', () => {
  let mockCurrentHolds: CurrentHolds;
  let mockSequences: { matches: MatchedSequence[] };

  beforeEach(() => {
    vi.useFakeTimers();
    mockCurrentHolds = new Map();
    mockSequences = { matches: [] };
    
    // Mock useNormalizedKeys
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue({
      currentHolds: mockCurrentHolds,
      sequences: mockSequences,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should return initial state when sequence is not active', () => {
    const { result } = renderHook(() => useSequence('test-sequence'));

    expect(result.current).toMatchObject({
      isHolding: false,
      isComplete: false,
      progress: 0,
      justStarted: false,
      justCompleted: false,
      justCancelled: false,
      startTime: null,
      elapsedTime: 0,
      remainingTime: 0,
      minHoldTime: 0,
      timeSinceStart: null,
      timeSinceLastEvent: null,
      lastMatch: undefined,
      matchCount: 0,
      eventHistory: [],
    });
  });

  it('should detect when a hold sequence starts', () => {
    const { result, rerender } = renderHook(() => useSequence('charge-jump'));

    const holdProgress: HoldProgress = {
      sequenceId: 'charge-jump',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 750,
      progress: 0,
      progressPercent: 0,
      elapsedTime: 0,
      remainingTime: 750,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('charge-jump', holdProgress);
      rerender();
    });

    expect(result.current.isHolding).toBe(true);
    expect(result.current.justStarted).toBe(true);
    expect(result.current.startTime).toBe(holdProgress.startTime);
    expect(result.current.minHoldTime).toBe(750);
    expect(result.current.eventHistory).toHaveLength(1);
    expect(result.current.eventHistory[0].type).toBe('started');
  });

  it('should clear justStarted flag after event window', () => {
    const { result, rerender } = renderHook(() => useSequence('charge-jump'));

    const holdProgress: HoldProgress = {
      sequenceId: 'charge-jump',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 750,
      progress: 0,
      progressPercent: 0,
      elapsedTime: 0,
      remainingTime: 750,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('charge-jump', holdProgress);
      rerender();
    });

    expect(result.current.justStarted).toBe(true);

    // Advance time past event window (100ms)
    act(() => {
      vi.advanceTimersByTime(101);
      // Force re-render to recalculate time-based values
      rerender();
    });

    expect(result.current.justStarted).toBe(false);
    expect(result.current.isHolding).toBe(true); // Still holding
  });

  it('should detect when a hold is cancelled', () => {
    const { result, rerender } = renderHook(() => useSequence('charge-jump'));

    // Start with a hold
    const holdProgress: HoldProgress = {
      sequenceId: 'charge-jump',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 750,
      progress: 0.3,
      progressPercent: 30,
      elapsedTime: 225,
      remainingTime: 525,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('charge-jump', holdProgress);
      rerender();
    });

    // Clear event window
    act(() => {
      vi.advanceTimersByTime(101);
    });

    // Remove the hold (cancelled before completion)
    act(() => {
      mockCurrentHolds.clear();
      rerender();
    });

    expect(result.current.isHolding).toBe(false);
    expect(result.current.justCancelled).toBe(true);
    expect(result.current.eventHistory).toHaveLength(2);
    expect(result.current.eventHistory[1].type).toBe('cancelled');
  });

  it('should detect when a sequence is completed', () => {
    const { result, rerender } = renderHook(() => useSequence('hadouken'));

    const matchedSequence: MatchedSequence = {
      sequenceId: 'hadouken',
      sequenceName: 'Hadouken',
      matchedAt: Date.now(),
      keysPressed: ['↓', '↘', '→', 'p'],
      timeTaken: 400,
    };

    act(() => {
      mockSequences.matches = [matchedSequence];
      rerender();
    });

    expect(result.current.justCompleted).toBe(true);
    expect(result.current.lastMatch).toBe(matchedSequence);
    expect(result.current.matchCount).toBe(1);
    expect(result.current.eventHistory).toHaveLength(1);
    expect(result.current.eventHistory[0].type).toBe('completed');
  });

  it('should track multiple completions', () => {
    const { result, rerender } = renderHook(() => useSequence('konami'));

    const firstMatchTime = Date.now();
    const firstMatch: MatchedSequence = {
      sequenceId: 'konami',
      sequenceName: 'Konami Code',
      matchedAt: firstMatchTime,
      keysPressed: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'b', 'a'],
      timeTaken: 2000,
    };

    // First match
    act(() => {
      mockSequences.matches = [firstMatch];
      rerender();
    });

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const secondMatchTime = Date.now();
    const secondMatch: MatchedSequence = {
      sequenceId: 'konami',
      sequenceName: 'Konami Code',
      matchedAt: secondMatchTime,
      keysPressed: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'b', 'a'],
      timeTaken: 1800,
    };

    // Second match
    act(() => {
      mockSequences.matches = [firstMatch, secondMatch];
      rerender();
    });

    expect(result.current.justCompleted).toBe(true);
    expect(result.current.lastMatch).toBe(secondMatch);
    expect(result.current.matchCount).toBe(2);
    expect(result.current.eventHistory).toHaveLength(2);
  });

  it('should provide timing information for active holds', () => {
    const { result, rerender } = renderHook(() => useSequence('charge-jump'));

    const startTime = Date.now();
    const holdProgress: HoldProgress = {
      sequenceId: 'charge-jump',
      key: 'Space',
      startTime,
      minHoldTime: 1000,
      progress: 0.5,
      progressPercent: 50,
      elapsedTime: 500,
      remainingTime: 500,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('charge-jump', holdProgress);
      rerender();
    });

    expect(result.current.progress).toBe(50);
    expect(result.current.elapsedTime).toBe(500);
    expect(result.current.remainingTime).toBe(500);
    expect(result.current.timeSinceStart).toBeCloseTo(0, -2); // Just started
  });

  it('should handle completed holds properly', () => {
    const { result, rerender } = renderHook(() => useSequence('power-attack'));

    const holdProgress: HoldProgress = {
      sequenceId: 'power-attack',
      key: 'f',
      startTime: Date.now() - 1000,
      minHoldTime: 1000,
      progress: 1,
      progressPercent: 100,
      elapsedTime: 1000,
      remainingTime: 0,
      isComplete: true,
    };

    act(() => {
      mockCurrentHolds.set('power-attack', holdProgress);
      rerender();
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.progress).toBe(100);
    expect(result.current.elapsedTime).toBe(1000);
    expect(result.current.remainingTime).toBe(0);
  });

  it('should maintain event history with a limit', () => {
    const { result, rerender } = renderHook(() => useSequence('test-sequence'));

    // Add multiple events
    for (let i = 0; i < 15; i++) {
      const holdProgress: HoldProgress = {
        sequenceId: 'test-sequence',
        key: 'Space',
        startTime: Date.now(),
        minHoldTime: 100,
        progress: 0,
        progressPercent: 0,
        elapsedTime: 0,
        remainingTime: 100,
        isComplete: false,
      };

      act(() => {
        mockCurrentHolds.set('test-sequence', holdProgress);
        rerender();
      });

      act(() => {
        vi.advanceTimersByTime(50);
        mockCurrentHolds.clear();
        rerender();
      });

      act(() => {
        vi.advanceTimersByTime(101);
      });
    }

    // Should only keep last 10 events
    expect(result.current.eventHistory.length).toBeLessThanOrEqual(10);
  });

  it('should not create duplicate events for unchanged state', () => {
    const { result, rerender } = renderHook(() => useSequence('test-sequence'));

    const holdProgress: HoldProgress = {
      sequenceId: 'test-sequence',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0,
      progressPercent: 0,
      elapsedTime: 0,
      remainingTime: 1000,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('test-sequence', holdProgress);
      rerender();
    });

    const eventCount = result.current.eventHistory.length;

    // Multiple rerenders without state change
    act(() => {
      rerender();
      rerender();
      rerender();
    });

    // Should not create duplicate events
    expect(result.current.eventHistory.length).toBe(eventCount);
  });

  it('should handle sequences without holds', () => {
    const { result, rerender } = renderHook(() => useSequence('combo-sequence'));

    // Just a match without a hold
    const matchedSequence: MatchedSequence = {
      sequenceId: 'combo-sequence',
      sequenceName: 'Combo',
      matchedAt: Date.now(),
      keysPressed: ['a', 'b', 'c'],
      timeTaken: 500,
    };

    act(() => {
      mockSequences.matches = [matchedSequence];
      rerender();
    });

    expect(result.current.isHolding).toBe(false);
    expect(result.current.justCompleted).toBe(true);
    expect(result.current.lastMatch).toBe(matchedSequence);
    expect(result.current.progress).toBe(0);
  });
});