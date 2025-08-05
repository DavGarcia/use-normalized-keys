import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHoldAnimation } from '../hooks';
import * as useNormalizedKeysModule from '../index';
import type { CurrentHolds, HoldProgress } from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('useHoldAnimation', () => {
  let mockCurrentHolds: CurrentHolds;
  let mockRequestAnimationFrame: any;
  let mockCancelAnimationFrame: any;
  let animationFrameCallbacks: (() => void)[] = [];
  let frameId = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCurrentHolds = new Map();
    
    // Mock useNormalizedKeys to return our controlled currentHolds
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue({
      currentHolds: mockCurrentHolds,
    } as any);

    // Mock requestAnimationFrame
    frameId = 0;
    animationFrameCallbacks = [];
    mockRequestAnimationFrame = vi.fn((callback) => {
      const id = ++frameId;
      animationFrameCallbacks.push(callback);
      return id;
    });
    mockCancelAnimationFrame = vi.fn();
    
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    
    // Mock Date.now for consistent time
    vi.setSystemTime(new Date('2025-01-01'));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    animationFrameCallbacks = [];
  });

  it('should return initial idle state when no hold is active', () => {
    const { result } = renderHook(() => useHoldAnimation('test-hold'));

    expect(result.current).toEqual({
      progress: 0,
      scale: 1,
      opacity: 0.3,
      glow: 0,
      shake: 0,
      isAnimating: false,
      isCharging: false,
      isReady: false,
    });
  });

  it('should start animating when hold becomes active', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));

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

    expect(result.current.isAnimating).toBe(true);
    expect(result.current.isCharging).toBe(true);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should animate scale and opacity based on progress', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));
    
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

    // Advance time to 50% progress
    act(() => {
      vi.advanceTimersByTime(500);
      // Run animation frames multiple times for smoothing
      for (let i = 0; i < 10; i++) {
        animationFrameCallbacks.forEach(cb => cb());
        animationFrameCallbacks = [];
      }
    });

    // Check that values have animated
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.scale).toBeGreaterThan(1);
    expect(result.current.scale).toBeLessThan(1.3);
    expect(result.current.opacity).toBeGreaterThan(0.3);
    expect(result.current.opacity).toBeLessThan(1);
  });

  it('should show glow effect when progress is above 80%', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));
    
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

    // Advance time to 85% progress
    act(() => {
      vi.advanceTimersByTime(850);
      // Run animation frames multiple times
      for (let i = 0; i < 20; i++) {
        animationFrameCallbacks.forEach(cb => cb());
        animationFrameCallbacks = [];
      }
    });

    expect(result.current.glow).toBeGreaterThan(0);
    expect(result.current.glow).toBeLessThanOrEqual(1);
  });

  it('should show shake effect and isReady when progress is above 90%', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));
    
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

    // Advance time to 95% progress
    act(() => {
      vi.advanceTimersByTime(950);
      // Run animation frames multiple times
      for (let i = 0; i < 30; i++) {
        animationFrameCallbacks.forEach(cb => cb());
        animationFrameCallbacks = [];
      }
    });

    expect(result.current.isReady).toBe(true);
    // Shake value should be non-zero (can be positive or negative)
    expect(Math.abs(result.current.shake)).toBeGreaterThan(0);
  });

  it('should animate release when hold is removed', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));
    
    // Start with an active hold
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now() - 500,
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

    // Let it animate
    act(() => {
      for (let i = 0; i < 5; i++) {
        animationFrameCallbacks.forEach(cb => cb());
        animationFrameCallbacks = [];
      }
    });

    const progressBeforeRelease = result.current.progress;
    expect(progressBeforeRelease).toBeGreaterThan(0);

    // Remove the hold
    act(() => {
      mockCurrentHolds.clear();
      rerender();
    });

    // Continue animation - should start release animation
    act(() => {
      animationFrameCallbacks.forEach(cb => cb());
      animationFrameCallbacks = [];
    });

    expect(result.current.isCharging).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.glow).toBe(0);
    expect(result.current.shake).toBe(0);
    
    // Progress should still be animating down
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThan(progressBeforeRelease);
  });

  it('should reset to idle state when animation completes', () => {
    const { result, rerender } = renderHook(() => useHoldAnimation('test-hold'));
    
    // Start with a hold that gets removed
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now() - 100,
      minHoldTime: 1000,
      progress: 0.1,
      progressPercent: 10,
      elapsedTime: 100,
      remainingTime: 900,
      isComplete: false,
    };

    act(() => {
      mockCurrentHolds.set('test-hold', holdProgress);
      rerender();
    });

    // Remove hold and let release animation complete
    act(() => {
      mockCurrentHolds.clear();
      rerender();
    });

    // Run many animation frames to complete the decay
    act(() => {
      for (let i = 0; i < 50; i++) {
        animationFrameCallbacks.forEach(cb => cb());
        animationFrameCallbacks = [];
      }
    });

    // Should be back to idle state
    expect(result.current).toEqual({
      progress: 0,
      scale: 1,
      opacity: 0.3,
      glow: 0,
      shake: 0,
      isAnimating: false,
      isCharging: false,
      isReady: false,
    });
  });

  it('should clean up animation frame on unmount', () => {
    const { unmount } = renderHook(() => useHoldAnimation('test-hold'));
    
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

    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
});