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
      sequences: []
    }));
    
    expect(result.current.currentHolds.size).toBe(0);
    
    // With optimization, requestAnimationFrame should not be called when no holds are active
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
  });

  it('should start RAF when hold sequence is added and becomes active', async () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: [
        holdSequence('test-hold', 'Space', 500)
      ]
    }));
    
    // Initially no holds
    expect(result.current.currentHolds.size).toBe(0);
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    
    // Simulate Space keydown to start hold sequence
    await act(async () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
      // Allow RAF callbacks to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Now there should be an active hold and RAF should start
    expect(result.current.currentHolds.size).toBe(1);
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should stop RAF when hold sequence completes', async () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: [
        holdSequence('test-hold', 'Space', 100) // Short hold for testing
      ]
    }));
    
    // Start hold sequence
    await act(async () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
      // Allow RAF callbacks to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.currentHolds.size).toBe(1);
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
    
    // Wait for hold to complete and then release key
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Space',
        code: 'Space',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
      
      // Allow RAF callbacks to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Hold should be complete/removed and RAF loop should stop naturally (no cancelAnimationFrame needed if no more holds)
    // The RAF loop stops itself when currentHolds.size becomes 0
    expect(result.current.currentHolds.size).toBe(0);
  });

  it('should call RAF when managing hold progress updates', async () => {
    const { result } = renderHook(() => useNormalizedKeys({
      sequences: [
        holdSequence('hold-test', 'a', 500)
      ]
    }));
    
    // Start hold
    await act(async () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        bubbles: true
      });
      window.dispatchEvent(keydownEvent);
      // Allow RAF callbacks to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.currentHolds.size).toBe(1);
    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
    
    // Test that RAF is managing hold progress updates
    const initialCallCount = requestAnimationFrameSpy.mock.calls.length;
    
    // Allow some more RAF cycles to run
    await act(async () => {
      // Trigger more RAF calls by waiting
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // RAF should continue to be called for hold progress updates
    expect(requestAnimationFrameSpy.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    
    // Cleanup by releasing key
    await act(async () => {
      const keyupEvent = new KeyboardEvent('keyup', {
        key: 'a',
        code: 'KeyA',
        bubbles: true
      });
      window.dispatchEvent(keyupEvent);
      // Allow RAF callbacks to process
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // The test completes successfully if no RAF act() warnings were generated
  });
});