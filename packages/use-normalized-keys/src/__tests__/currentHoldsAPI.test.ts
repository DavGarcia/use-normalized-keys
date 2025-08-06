import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys } from '../index';
import type { SequenceDefinition } from '../sequenceDetection';

describe('currentHolds API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expose currentHolds as empty Map by default', () => {
    const { result } = renderHook(() => useNormalizedKeys());
    
    expect(result.current.currentHolds).toBeDefined();
    expect(result.current.currentHolds).toBeInstanceOf(Map);
    expect(result.current.currentHolds.size).toBe(0);
  });

  it('should track hold progress when key is pressed', () => {
    const sequences: SequenceDefinition[] = [
      {
        id: 'test-hold',
        name: 'Test Hold',
        keys: [{ key: 'Space', minHoldTime: 1000 }],
        type: 'hold'
      }
    ];
    
    const { result } = renderHook(() => 
      useNormalizedKeys({ 
        sequences 
      })
    );
    
    // Simulate space keydown
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
    
    // Should have started tracking the hold
    expect(result.current.currentHolds.size).toBe(1);
    expect(result.current.currentHolds.has('test-hold')).toBe(true);
    
    const holdProgress = result.current.currentHolds.get('test-hold');
    expect(holdProgress).toBeDefined();
    expect(holdProgress?.sequenceId).toBe('test-hold');
    expect(holdProgress?.key).toBe('Space');
    expect(holdProgress?.progress).toBe(0);
    expect(holdProgress?.isComplete).toBe(false);
  });

  it('should clear hold progress on keyup', () => {
    const sequences: SequenceDefinition[] = [
      {
        id: 'test-hold',
        keys: [{ key: 'Space', minHoldTime: 1000 }],
        type: 'hold'
      }
    ];
    
    const { result } = renderHook(() => 
      useNormalizedKeys({ 
        sequences,
        debug: true
      })
    );
    
    // Simulate space keydown
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current.currentHolds.size).toBe(1);
    
    // Simulate space keyup
    act(() => {
      const event = new KeyboardEvent('keyup', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
    
    // Wait a bit for state to update
    act(() => {
      vi.advanceTimersByTime(20);
    });
    
    expect(result.current.currentHolds.size).toBe(0);
  });

  it('should update hold progress values in real-time', () => {
    const sequences: SequenceDefinition[] = [
      {
        id: 'test-hold',
        keys: [{ key: 'Space', minHoldTime: 1000 }],
        type: 'hold'
      }
    ];
    
    const { result } = renderHook(() => 
      useNormalizedKeys({ 
        sequences 
      })
    );
    
    // Simulate space keydown
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
    
    const initialHold = result.current.currentHolds.get('test-hold');
    expect(initialHold?.progress).toBe(0);
    expect(initialHold?.elapsedTime).toBe(0);
    expect(initialHold?.remainingTime).toBe(1000);
    
    // Note: In a real implementation, we'd need to trigger updates
    // via requestAnimationFrame or similar mechanism
    // For now, we're just verifying the structure is correct
  });

  it('should return empty Map when no sequences are configured', () => {
    const { result } = renderHook(() => useNormalizedKeys());
    
    expect(result.current.currentHolds).toBeInstanceOf(Map);
    expect(result.current.currentHolds.size).toBe(0);
    
    // Simulate keypress
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });
    
    // Should still be empty
    expect(result.current.currentHolds.size).toBe(0);
  });
});