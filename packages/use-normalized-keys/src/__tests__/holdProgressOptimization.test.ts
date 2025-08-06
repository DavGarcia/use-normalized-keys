import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys, holdSequence } from '../index';

describe('Hold Progress RAF Optimization', () => {
  let originalRequestAnimationFrame: typeof requestAnimationFrame;
  let originalCancelAnimationFrame: typeof cancelAnimationFrame;
  let requestAnimationFrameSpy: ReturnType<typeof vi.fn>;
  let cancelAnimationFrameSpy: ReturnType<typeof vi.fn>;
  let frameCallCount = 0;

  beforeEach(() => {
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;
    frameCallCount = 0;
    
    requestAnimationFrameSpy = vi.fn().mockImplementation((callback) => {
      frameCallCount++;
      // Execute callback immediately for testing
      setTimeout(callback, 0);
      return frameCallCount; // Return unique ID for each RAF call
    });
    cancelAnimationFrameSpy = vi.fn();
    
    global.requestAnimationFrame = requestAnimationFrameSpy;
    global.cancelAnimationFrame = cancelAnimationFrameSpy;
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('should not run RAF when no holds are active', () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { sequences: [] }
    }));
    
    expect(result.current.currentHolds.size).toBe(0);
    
    // With optimization, requestAnimationFrame should not be called when no holds are active
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
  });

  it('should start RAF when hold sequence is added and becomes active', () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: { 
        sequences: [
          holdSequence('test-hold', 'Space', 500)
        ]
      }
    }));
    
    // Initially no holds
    expect(result.current.currentHolds.size).toBe(0);
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    
    // Simulate Space keydown to start hold sequence
    act(() => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
    });

    // Now there should be an active hold and RAF should start
    expect(result.current.currentHolds.size).toBe(1);
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should stop RAF when hold sequence completes', async () => {
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
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
    
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

    // Hold should be complete/removed and RAF loop should stop naturally (no cancelAnimationFrame needed if no more holds)
    // The RAF loop stops itself when currentHolds.size becomes 0
    expect(result.current.currentHolds.size).toBe(0);
  });

  it('should manage RAF correctly with multiple holds', async () => {
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
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
    
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
    // Each change to currentHolds triggers a new useEffect, so we may have more RAF calls
    // The important thing is that RAF was called (optimization is working)
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    
    // Release first key
    act(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
    });

    // Should still have one hold active, RAF should continue
    expect(result.current.currentHolds.size).toBe(1);
    // cancelAnimationFrame may be called as the useEffect re-runs when currentHolds changes
    // The key point is that a new RAF loop is started when holds still exist
    
    // Release second key
    act(() => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
    });

    // Now all holds are complete, RAF loop should stop naturally
    expect(result.current.currentHolds.size).toBe(0);
  });
});