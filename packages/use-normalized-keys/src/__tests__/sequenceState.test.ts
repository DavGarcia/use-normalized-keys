import { describe, it, expect } from 'vitest';
import { createSequenceState, SequenceState } from '../sequenceDetection';
import type { HoldProgress } from '../index';

describe('SequenceState activeHolds', () => {
  it('should initialize with empty activeHolds Map', () => {
    const state = createSequenceState();
    expect(state.activeHolds).toBeDefined();
    expect(state.activeHolds).toBeInstanceOf(Map);
    expect(state.activeHolds.size).toBe(0);
  });

  it('should track active holds in state', () => {
    const state = createSequenceState();
    
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
    
    state.activeHolds.set('test-hold', holdProgress);
    
    expect(state.activeHolds.size).toBe(1);
    expect(state.activeHolds.get('test-hold')).toEqual(holdProgress);
  });

  it('should clear activeHolds when state is reset', () => {
    const state = createSequenceState();
    
    const holdProgress: HoldProgress = {
      sequenceId: 'test-hold',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0.5,
      progressPercent: 50,
      elapsedTime: 500,
      remainingTime: 500,
      isComplete: false
    };
    
    state.activeHolds.set('test-hold', holdProgress);
    expect(state.activeHolds.size).toBe(1);
    
    // Reset state
    state.activeHolds.clear();
    expect(state.activeHolds.size).toBe(0);
  });

  it('should support multiple active holds', () => {
    const state = createSequenceState();
    
    const hold1: HoldProgress = {
      sequenceId: 'hold1',
      key: 'Space',
      startTime: Date.now(),
      minHoldTime: 1000,
      progress: 0.3,
      progressPercent: 30,
      elapsedTime: 300,
      remainingTime: 700,
      isComplete: false
    };
    
    const hold2: HoldProgress = {
      sequenceId: 'hold2',
      key: 'f',
      startTime: Date.now() - 100,
      minHoldTime: 500,
      progress: 0.2,
      progressPercent: 20,
      elapsedTime: 100,
      remainingTime: 400,
      isComplete: false
    };
    
    state.activeHolds.set('hold1', hold1);
    state.activeHolds.set('hold2', hold2);
    
    expect(state.activeHolds.size).toBe(2);
    expect(state.activeHolds.get('hold1')).toEqual(hold1);
    expect(state.activeHolds.get('hold2')).toEqual(hold2);
  });
});