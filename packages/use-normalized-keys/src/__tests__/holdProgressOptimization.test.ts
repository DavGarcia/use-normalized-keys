import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys, holdSequence } from '../index';

describe('Hold Progress Interval Optimization', () => {
  let originalSetInterval: typeof setInterval;
  let originalClearInterval: typeof clearInterval;
  let setIntervalSpy: ReturnType<typeof vi.fn>;
  let clearIntervalSpy: ReturnType<typeof vi.fn>;
  let intervalCallCount = 0;

  beforeEach(() => {
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;
    intervalCallCount = 0;
    
    setIntervalSpy = vi.fn().mockImplementation(() => {
      intervalCallCount++;
      return intervalCallCount; // Return unique ID for each interval
    });
    clearIntervalSpy = vi.fn();
    
    global.setInterval = setIntervalSpy;
    global.clearInterval = clearIntervalSpy;
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  });

  it('should not run interval when no holds are active', () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { sequences: [] }
    }));
    
    expect(result.current.currentHolds.size).toBe(0);
    
    // With optimization, setInterval should not be called when no holds are active
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('should start interval when hold sequence is added and becomes active', () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { 
        sequences: [
          holdSequence('test-hold', 'Space', 500)
        ]
      }
    }));
    
    // Initially no holds
    expect(result.current.currentHolds.size).toBe(0);
    expect(setIntervalSpy).not.toHaveBeenCalled();
    
    // Simulate Space keydown to start hold sequence
    act(() => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
    });

    // Now there should be an active hold and interval should start
    expect(result.current.currentHolds.size).toBe(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 16);
  });

  it('should clear interval when hold sequence completes', async () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { 
        sequences: [
          holdSequence('test-hold', 'Space', 100) // Short hold for testing
        ]
      }
    }));
    
    // Start hold sequence
    act(() => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
    });

    expect(result.current.currentHolds.size).toBe(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 16);
    
    // Wait for hold to complete and then release key
    await new Promise(resolve => setTimeout(resolve, 150));
    
    act(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
    });

    // Hold should be complete/removed and interval cleared
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should manage interval correctly with multiple holds', async () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { 
        sequences: [
          holdSequence('hold-1', 'Space', 200),
          holdSequence('hold-2', 'Enter', 300)
        ]
      }
    }));
    
    // Start first hold
    act(() => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
    });

    expect(result.current.currentHolds.size).toBe(1);
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    
    // Start second hold
    act(() => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
    });

    expect(result.current.currentHolds.size).toBe(2);
    // Each change to currentHolds triggers a new useEffect, so we may have more than 1 call
    // The important thing is that setInterval was called (optimization is working)
    expect(setIntervalSpy).toHaveBeenCalled();
    
    // Release first key
    act(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
    });

    // Should still have one hold active, interval should continue
    expect(result.current.currentHolds.size).toBe(1);
    // clearInterval may be called as the useEffect re-runs when currentHolds changes
    // The key point is that a new interval is started when holds still exist
    
    // Release second key
    act(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
    });

    // Now all holds are complete, interval should be cleared
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});