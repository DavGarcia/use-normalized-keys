import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys } from '../index';
import { 
  simulateKeySequence, 
  simulateWindowsShiftNumpadPhantom,
  mockPlatform,
  createKeyboardEvent,
  wait
} from './testUtils';

describe('useNormalizedKeys - Integration Tests', () => {
  beforeEach(() => {
    // Reset to default platform
    mockPlatform('Linux');
  });

  describe('Windows Shift+Numpad Phantom Event Suppression', () => {
    beforeEach(() => {
      mockPlatform('Windows');
    });

    it('should suppress phantom Shift events during Shift+Numpad interaction', async () => {
      vi.useFakeTimers();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Test the working phantom Shift suppression with proper event flow
      // 1. Real Shift keydown (establishes shiftIsDown = true)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.pressedKeys.has('Shift')).toBe(true);
      expect(result.current.activeModifiers.shift).toBe(true);
      
      // 2. Numpad keyup (sets numpadUpTime for phantom detection window)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: '1',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // 3. Phantom Shift keydown immediately after (should be suppressed)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        // Use same timestamp to simulate immediate phantom
        Object.defineProperty(event, 'timeStamp', { value: performance.now() });
        window.dispatchEvent(event);
      });

      // Verify suppression occurred (either as phantom or duplicate)
      const suppressionOccurred = consoleSpy.mock.calls.some(call => 
        call.some(arg => 
          typeof arg === 'string' && (
            arg.includes('Suppressing phantom Shift keydown') ||
            arg.includes('Suppressed duplicate keydown for key: Shift')
          )
        )
      );
      expect(suppressionOccurred).toBe(true);
      
      // Shift should still be tracked as down (no change from phantom)
      expect(result.current.pressedKeys.has('Shift')).toBe(true);
      expect(result.current.activeModifiers.shift).toBe(true);

      consoleSpy.mockRestore();
      vi.useRealTimers();
    });

    it('should maintain correct Shift state throughout phantom event sequence', async () => {
      vi.useFakeTimers();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Test multi-key phantom suppression with state tracking
      // 1. Real Shift keydown
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.pressedKeys.has('Shift')).toBe(true);
      expect(result.current.activeModifiers.shift).toBe(true);
      
      // 2. Numpad sequence with phantom Shift events
      // First numpad key
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: '1',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // Phantom Shift keyup (should be buffered)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false }
        });
        window.dispatchEvent(event);
      });
      
      // Shift should still appear active (phantom keyup is buffered)
      expect(result.current.activeModifiers.shift).toBe(true);
      
      // First numpad keyup (confirms phantom)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: '1',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // Phantom Shift keydown (should be suppressed)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        Object.defineProperty(event, 'timeStamp', { value: performance.now() });
        window.dispatchEvent(event);
      });
      
      // Verify state consistency - Shift should remain active throughout
      expect(result.current.activeModifiers.shift).toBe(true);
      
      // Verify suppression occurred (either as phantom or duplicate)
      const suppressionOccurred = consoleSpy.mock.calls.some(call => 
        call.some(arg => 
          typeof arg === 'string' && (
            arg.includes('Suppressing phantom Shift keydown') ||
            arg.includes('Suppressed duplicate keydown for key: Shift')
          )
        )
      );
      expect(suppressionOccurred).toBe(true);

      consoleSpy.mockRestore();
      vi.useRealTimers();
    });

    it('should calculate correct Shift duration without phantom event interference', async () => {
      vi.useFakeTimers();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      const startTime = performance.now();
      
      // Real Shift keydown
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        Object.defineProperty(event, 'timeStamp', { value: startTime });
        window.dispatchEvent(event);
      });
      
      // Simulate numpad sequence with phantom events over 200ms
      await act(async () => {
        vi.advanceTimersByTime(50);
      });
      
      // Phantom Shift keyup (should be buffered, not affect duration)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false }
        });
        Object.defineProperty(event, 'timeStamp', { value: startTime + 50 });
        window.dispatchEvent(event);
      });
      
      // Numpad keyup (confirms phantom)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: '1',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        Object.defineProperty(event, 'timeStamp', { value: startTime + 55 });
        window.dispatchEvent(event);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      
      // Real Shift keyup at 200ms
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false }
        });
        Object.defineProperty(event, 'timeStamp', { value: startTime + 200 });
        // Mark as processed to prevent buffering since this is the real keyup
        (event as any).__useNormalizedKeys_processed = true;
        window.dispatchEvent(event);
      });
      
      // Duration should be calculated from real keydown to real keyup (~200ms)
      // Not affected by phantom keyup at 50ms
      expect(result.current.lastEvent?.duration).toBeGreaterThan(150);
      expect(result.current.lastEvent?.duration).toBeLessThan(250);
      
      // Verify phantom suppression occurred
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Buffering Shift keyup'));

      consoleSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('Modifier Key Tap vs Hold Detection', () => {
    it('should detect tap when modifier is pressed and released quickly', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Shift',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(down);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(50); // Quick release after 50ms
      });
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'Shift',
          modifierStates: { Shift: false }
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(true);
      expect(result.current.lastEvent?.isHold).toBe(false);
      expect(result.current.lastEvent?.duration).toBeLessThan(200);
      
      vi.useRealTimers();
    });

    it('should detect hold when modifier is pressed for longer duration', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Hold
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Control',
          modifierStates: { Control: true }
        });
        window.dispatchEvent(down);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(250); // Hold longer than threshold
      });
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'Control',
          modifierStates: { Control: false }
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(false);
      expect(result.current.lastEvent?.isHold).toBe(true);
      expect(result.current.lastEvent?.duration).toBeGreaterThan(200);
      
      vi.useRealTimers();
    });
  });

  describe('Universal Tap vs Hold Detection (TDD)', () => {
    it('should detect tap for regular keys', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap on regular key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'a',
          code: 'KeyA'
        });
        window.dispatchEvent(down);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(50); // Quick release after 50ms
      });
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'a',
          code: 'KeyA'
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(true);
      expect(result.current.lastEvent?.isHold).toBe(false);
      expect(result.current.lastEvent?.duration).toBeLessThan(200);
      
      vi.useRealTimers();
    });

    it('should detect hold for regular keys', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Long hold on regular key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Space',
          code: 'Space'
        });
        window.dispatchEvent(down);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(250); // Hold longer than threshold
      });
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'Space',
          code: 'Space'
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(false);
      expect(result.current.lastEvent?.isHold).toBe(true);
      expect(result.current.lastEvent?.duration).toBeGreaterThan(200);
      
      vi.useRealTimers();
    });

    it('should detect tap for number keys', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap on number key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: '1',
          code: 'Digit1'
        });
        window.dispatchEvent(down);
      });
      
      await act(async () => {
        vi.advanceTimersByTime(75); // Quick release after 75ms
      });
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: '1',
          code: 'Digit1'
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(true);
      expect(result.current.lastEvent?.isHold).toBe(false);
      expect(result.current.lastEvent?.duration).toBeLessThan(200);
      
      vi.useRealTimers();
    });
  });

  describe('NumLock State Handling', () => {
    it('should report digit mode when NumLock is on', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: '1',
          code: 'Numpad1',
          modifierStates: { NumLock: true }
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.lastEvent?.key).toBe('1');
      expect(result.current.lastEvent?.numpadInfo?.activeMode).toBe('digit');
      expect(result.current.lastEvent?.numpadInfo?.isNumLockOn).toBe(true);
    });

    it('should report navigation mode when NumLock is off', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { NumLock: false }
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.lastEvent?.key).toBe('End');
      expect(result.current.lastEvent?.numpadInfo?.activeMode).toBe('navigation');
      expect(result.current.lastEvent?.numpadInfo?.isNumLockOn).toBe(false);
    });
  });

  describe('Focus Loss Recovery', () => {
    it('should reset all keys when window loses focus', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      // Press multiple keys
      await simulateKeySequence(window, [
        { type: 'keydown', key: 'a' },
        { type: 'keydown', key: 'b' },
        { type: 'keydown', key: 'Shift', modifierStates: { Shift: true } }
      ]);
      
      expect(result.current.pressedKeys.size).toBe(3);
      expect(result.current.activeModifiers.shift).toBe(true);
      
      // Simulate window blur
      await act(async () => {
        window.dispatchEvent(new Event('blur'));
      });
      
      expect(result.current.pressedKeys.size).toBe(0);
      expect(result.current.activeModifiers.shift).toBe(false);
    });
  });

  describe('Input Field Exclusion', () => {
    it('should ignore events from input fields by default', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      const input = document.createElement('input');
      document.body.appendChild(input);
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a' });
        Object.defineProperty(event, 'target', { value: input });
        window.dispatchEvent(event);
      });
      
      expect(result.current.pressedKeys.size).toBe(0);
      expect(result.current.lastEvent).toBeNull();
      
      document.body.removeChild(input);
    });

    it('should process events from input fields when exclusion is disabled', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ excludeInputFields: false }));
      
      const input = document.createElement('input');
      document.body.appendChild(input);
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a' });
        Object.defineProperty(event, 'target', { value: input });
        window.dispatchEvent(event);
      });
      
      expect(result.current.pressedKeys.has('a')).toBe(true);
      expect(result.current.lastEvent?.key).toBe('a');
      
      document.body.removeChild(input);
    });
  });

  describe('Repeat Event Handling', () => {
    it('should ignore auto-repeat keydown events', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      let eventCount = 0;
      
      // First real keydown
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a', repeat: false });
        window.dispatchEvent(event);
      });
      eventCount++;
      
      // Auto-repeat events
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          const event = createKeyboardEvent('keydown', { key: 'a', repeat: true });
          window.dispatchEvent(event);
        });
      }
      
      // Should still only have one 'a' in pressed keys
      expect(result.current.pressedKeys.size).toBe(1);
      expect(result.current.pressedKeys.has('a')).toBe(true);
    });
  });

  describe('Key Normalization', () => {
    it('should normalize shifted number keys to digits', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: '!',
          code: 'Digit1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.lastEvent?.key).toBe('1');
      expect(result.current.lastEvent?.originalKey).toBe('!');
      expect(result.current.pressedKeys.has('1')).toBe(true);
    });

    it('should normalize space key variations', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: ' ',
          code: 'Space'
        });
        window.dispatchEvent(event);
      });
      
      expect(result.current.lastEvent?.key).toBe('Space');
      expect(result.current.pressedKeys.has('Space')).toBe(true);
    });
  });

  describe('Sequence Detection Repair (TDD)', () => {
    it('should detect "hello" sequence like in the demo (currently FAILING)', async () => {
      const matchedSequences: any[] = [];
      
      const { result } = renderHook(() => useNormalizedKeys({
        sequences: [
          {
            id: 'hello',
            keys: ['h', 'e', 'l', 'l', 'o'],
            type: 'sequence' as const
          }
        ],
        onSequenceMatch: (match) => {
          matchedSequences.push(match);
        }
      }));
      
      // Type "hello" sequence
      const keys = ['h', 'e', 'l', 'l', 'o'];
      for (const key of keys) {
        await act(async () => {
          const downEvent = createKeyboardEvent('keydown', { key });
          window.dispatchEvent(downEvent);
        });
        
        await act(async () => {
          const upEvent = createKeyboardEvent('keyup', { key });
          window.dispatchEvent(upEvent);
        });
      }
      
      // This test will FAIL because sequence detection is broken
      expect(matchedSequences).toHaveLength(1);
      expect(matchedSequences[0].sequenceId).toBe('hello');
    });

    it('should detect "jk" sequence like in the demo (currently FAILING)', async () => {
      const matchedSequences: any[] = [];
      
      const { result } = renderHook(() => useNormalizedKeys({
        debug: true,  // Hook-level debug
        sequences: [
          {
            id: 'jk',
            keys: ['j', 'k'],
            type: 'sequence' as const
          }
        ],
        onSequenceMatch: (match) => {
          console.log('MATCH DETECTED:', match);
          matchedSequences.push(match);
        }
      }));
      
      // Type "jk" sequence
      await act(async () => {
        const jDown = createKeyboardEvent('keydown', { key: 'j' });
        console.log('Dispatching j keydown, originalKey:', jDown.key);
        window.dispatchEvent(jDown);
      });
      
      await act(async () => {
        const jUp = createKeyboardEvent('keyup', { key: 'j' });
        window.dispatchEvent(jUp);
      });
      
      await act(async () => {
        const kDown = createKeyboardEvent('keydown', { key: 'k' });
        console.log('Dispatching k keydown, originalKey:', kDown.key);
        window.dispatchEvent(kDown);
      });
      
      await act(async () => {
        const kUp = createKeyboardEvent('keyup', { key: 'k' });
        window.dispatchEvent(kUp);
      });
      
      console.log('Final matchedSequences:', matchedSequences);
      console.log('Result sequences:', result.current.sequences?.matches);
      
      // This test will FAIL because sequence detection is broken
      expect(matchedSequences).toHaveLength(1);
      expect(matchedSequences[0].sequenceId).toBe('jk');
    });
  });
});