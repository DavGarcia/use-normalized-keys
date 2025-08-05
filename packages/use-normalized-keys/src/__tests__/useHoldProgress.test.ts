import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHoldProgress } from '../hooks';
import * as useNormalizedKeysModule from '../index';
import type { CurrentHolds, HoldProgress } from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('useHoldProgress', () => {
  let mockCurrentHolds: CurrentHolds;
  let mockRequestAnimationFrame: any;
  let mockCancelAnimationFrame: any;
  let animationFrameCallbacks: (() => void)[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    mockCurrentHolds = new Map();
    
    // Mock useNormalizedKeys to return our controlled currentHolds
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue({
      currentHolds: mockCurrentHolds,
    } as any);

    // Mock requestAnimationFrame
    let frameId = 0;
    mockRequestAnimationFrame = vi.fn((callback) => {
      const id = ++frameId;
      animationFrameCallbacks.push(callback);
      return id;
    });
    mockCancelAnimationFrame = vi.fn();
    
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    animationFrameCallbacks = [];
  });

  it('should return initial state when no hold is active', () => {
    const { result } = renderHook(() => useHoldProgress('test-hold'));

    expect(result.current).toEqual({
      progress: 0,
      isHolding: false,
      isComplete: false,
      elapsedTime: 0,
      remainingTime: 0,
      startTime: null,
      minHoldTime: 0,
    });
  });

  it('should track hold progress when sequence becomes active', () => {
    const { result, rerender } = renderHook(() => useHoldProgress('test-hold'));

    // Add a hold to currentHolds
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
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
      mockCurrentHolds.set('test-hold', holdProgress);
      rerender();
    });

    expect(result.current.isHolding).toBe(true);
    expect(result.current.minHoldTime).toBe(1000);
    expect(result.current.startTime).toBe(holdProgress.startTime);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should smoothly animate progress', () => {
    const { result, rerender } = renderHook(() => useHoldProgress('test-hold'));
    
    const startTime = Date.now();
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime,
      minHoldTime: 1000,
      progress: 0,
      progressPercent: 0,
      elapsedTime: 0,
      remainingTime: 1000,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('test-hold', holdProgress);
      rerender();
    });

    // Initial progress should be 0
    expect(result.current.progress).toBe(0);

    // Advance time and trigger animation frame
    act(() => {
      vi.advanceTimersByTime(500); // 50% of hold time
      // Run animation frame callbacks
      animationFrameCallbacks.forEach(cb => cb());
      animationFrameCallbacks = [];
    });

    // Progress should have updated (not exactly 50% due to smoothing)
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThan(50);
  });

  it('should animate back to zero when hold is released', () => {
    const { result, rerender } = renderHook(() => useHoldProgress('test-hold'));
    
    // Start with an active hold
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0.5,
      progressPercent: 50,
      elapsedTime: 500,
      remainingTime: 500,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('test-hold', holdProgress);
      rerender();
    });

    // Let it animate to some progress
    act(() => {
      vi.advanceTimersByTime(100);
      animationFrameCallbacks.forEach(cb => cb());
      animationFrameCallbacks = [];
    });

    const progressBeforeRelease = result.current.progress;
    expect(progressBeforeRelease).toBeGreaterThan(0);

    // Remove the hold
    act(() => {
      mockCurrentHolds.clear();
      rerender();
    });

    // Should still have some progress (animating down)
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.isHolding).toBe(false);

    // Continue animation - progress should decrease
    act(() => {
      animationFrameCallbacks.forEach(cb => cb());
      animationFrameCallbacks = [];
    });

    expect(result.current.progress).toBeLessThan(progressBeforeRelease);
  });

  it('should handle completed holds', () => {
    const { result, rerender } = renderHook(() => useHoldProgress('test-hold'));
    
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now() - 1000,
      minHoldTime: 1000,
      progress: 1,
      progressPercent: 100,
      elapsedTime: 1000,
      remainingTime: 0,
      isComplete: true,
    };

    act(() => {
      mockCurrentHolds.set('test-hold', holdProgress);
      rerender();
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.elapsedTime).toBe(1000);
    expect(result.current.remainingTime).toBe(0);
  });

  it('should clean up animation frame on unmount', () => {
    const { unmount } = renderHook(() => useHoldProgress('test-hold'));
    
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
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
      mockCurrentHolds.set('test-hold', holdProgress);
    });

    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
});