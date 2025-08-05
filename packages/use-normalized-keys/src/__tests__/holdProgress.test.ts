import { describe, it, expect } from 'vitest';
import type { HoldProgress } from '../index';

describe('HoldProgress Types', () => {
  it('should have correct HoldProgress interface structure', () => {
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      sequenceName: 'Test Hold',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0.5,
      progressPercent: 50,
      elapsedTime: 500,
      remainingTime: 500,
      isComplete: false
    };

    expect(holdProgress.sequenceId).toBe('test-hold');
    expect(holdProgress.sequenceName).toBe('Test Hold');
    expect(holdProgress.key).toBe('Space');
    expect(holdProgress.minHoldTime).toBe(1000);
    expect(holdProgress.progress).toBe(0.5);
    expect(holdProgress.progressPercent).toBe(50);
    expect(holdProgress.elapsedTime).toBe(500);
    expect(holdProgress.remainingTime).toBe(500);
    expect(holdProgress.isComplete).toBe(false);
  });

  it('should allow optional sequenceName', () => {
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0,
      progressPercent: 0,
      elapsedTime: 0,
      remainingTime: 1000,
      isComplete: false
    };

    expect(holdProgress.sequenceName).toBeUndefined();
  });

  it('should handle completed holds', () => {
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now() - 1000,
      minHoldTime: 1000,
      progress: 1,
      progressPercent: 100,
      elapsedTime: 1000,
      remainingTime: 0,
      isComplete: true
    };

    expect(holdProgress.progress).toBe(1);
    expect(holdProgress.progressPercent).toBe(100);
    expect(holdProgress.remainingTime).toBe(0);
    expect(holdProgress.isComplete).toBe(true);
  });

  it('should handle progress values correctly', () => {
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now() - 750,
      minHoldTime: 1000,
      progress: 0.75,
      progressPercent: 75,
      elapsedTime: 750,
      remainingTime: 250,
      isComplete: false
    };

    // Progress should be between 0 and 1
    expect(holdProgress.progress).toBeGreaterThanOrEqual(0);
    expect(holdProgress.progress).toBeLessThanOrEqual(1);
    
    // Progress percent should be between 0 and 100
    expect(holdProgress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(holdProgress.progressPercent).toBeLessThanOrEqual(100);
    
    // Elapsed + remaining should equal minHoldTime
    expect(holdProgress.elapsedTime + holdProgress.remainingTime).toBe(holdProgress.minHoldTime);
  });
});