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
      const { result } = renderHook(() => useNormalizedKeys({ debug: false }));
      
      // More realistic sequence - hold shift first, then numpad
      // 1. Press and hold Shift
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // 2. Press and hold numpad key (while Shift is held)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // Now both keys are held - phantom events should be suppressed
      const eventsBefore = result.current.lastEvent;
      
      // 3. Phantom Shift up (should be suppressed)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true } // Still physically held!
        });
        window.dispatchEvent(event);
      });
      
      // Event should be suppressed - lastEvent shouldn't change
      expect(result.current.lastEvent).toBe(eventsBefore);
      expect(result.current.activeModifiers.shift).toBe(true); // Still held
      
      // 4. Release numpad key
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // 5. Phantom Shift down (should be suppressed)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // 6. Real Shift up
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false } // Actually released
        });
        window.dispatchEvent(event);
      });
      
      // Now shift should be released
      expect(result.current.activeModifiers.shift).toBe(false);
      expect(result.current.pressedKeys.has('Shift')).toBe(false);
      expect(result.current.pressedKeys.has('End')).toBe(false);
    });

    it('should maintain correct Shift state throughout phantom event sequence', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      const stateHistory: boolean[] = [];
      
      // 1. Real Shift down
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      stateHistory.push(result.current.activeModifiers.shift); // Should be true
      
      // 2. Numpad key down (while Shift is held)
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      stateHistory.push(result.current.activeModifiers.shift); // Should still be true
      
      // 3. Phantom Shift up (should be ignored since numpad is held)
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true } // Still physically held!
        });
        window.dispatchEvent(event);
      });
      stateHistory.push(result.current.activeModifiers.shift); // Should still be true (phantom ignored)
      
      // 4. Real Shift up
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false } // Actually released
        });
        window.dispatchEvent(event);
      });
      stateHistory.push(result.current.activeModifiers.shift); // Should be false
      
      // The phantom shift up should have been ignored, so we should see:
      // [true after real down, true after numpad down, true after phantom up (ignored), false after real up]
      expect(stateHistory).toEqual([true, true, true, false]);
    });

    it('should calculate correct Shift duration without phantom event interference (TDD)', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      let shiftDownTime: number;
      let shiftUpTime: number;
      let finalDuration: number | undefined;
      
      // Step 1: Real Shift down
      await act(async () => {
        shiftDownTime = Date.now();
        const event = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(event);
      });
      
      // Step 2: Phantom Shift up while numpad key held (should be suppressed)
      await act(async () => {
        // First press numpad key
        const numpadEvent = createKeyboardEvent('keydown', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(numpadEvent);
      });
      
      await act(async () => {
        // Phantom Shift up - should be suppressed
        const phantomEvent = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true } // Still physically held!
        });
        window.dispatchEvent(phantomEvent);
      });
      
      // Step 3: Release numpad
      await act(async () => {
        const numpadUpEvent = createKeyboardEvent('keyup', {
          key: 'End',
          code: 'Numpad1',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(numpadUpEvent);
      });
      
      // Step 4: Phantom Shift down (should be suppressed)
      await act(async () => {
        const phantomEvent = createKeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(phantomEvent);
      });
      
      // Step 5: Real Shift up
      await act(async () => {
        shiftUpTime = Date.now();
        const realUpEvent = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: false } // Actually released
        });
        window.dispatchEvent(realUpEvent);
      });
      
      // Get the final event duration
      finalDuration = result.current.lastEvent?.duration;
      const expectedDuration = shiftUpTime - shiftDownTime;
      
      // Test: Duration should reflect the full press duration, not affected by phantom events
      expect(finalDuration).toBeDefined();
      expect(finalDuration).toBeGreaterThan(0);
      
      // Duration should be approximately the full time from real down to real up
      // Allow for small timing variations in tests
      expect(Math.abs(finalDuration! - expectedDuration)).toBeLessThan(50); // 50ms tolerance
      
      // Key state should be correct (not affected by phantom events)
      expect(result.current.activeModifiers.shift).toBe(false);
      expect(result.current.pressedKeys.has('Shift')).toBe(false);
      expect(result.current.pressedKeys.has('End')).toBe(false);
    });
  });

  describe('Modifier Key Tap vs Hold Detection', () => {
    it('should detect tap when modifier is pressed and released quickly', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Shift',
          modifierStates: { Shift: true }
        });
        window.dispatchEvent(down);
      });
      
      await wait(50); // Quick release
      
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
    });

    it('should detect hold when modifier is pressed for longer duration', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Hold
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Control',
          modifierStates: { Control: true }
        });
        window.dispatchEvent(down);
      });
      
      await wait(250); // Hold longer than threshold
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'Control',
          modifierStates: { Control: false }
        });
        window.dispatchEvent(up);
      });
      
      expect(result.current.lastEvent?.isTap).toBe(false);
      expect(result.current.lastEvent?.isHold).toBe(true);
      expect(result.current.lastEvent?.duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe('Universal Tap vs Hold Detection (TDD)', () => {
    it('should detect tap for regular keys', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap on regular key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'a',
          code: 'KeyA'
        });
        window.dispatchEvent(down);
      });
      
      await wait(50); // Quick release
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'a',
          code: 'KeyA'
        });
        window.dispatchEvent(up);
      });
      
      // Now passes with universal tap/hold detection
      expect(result.current.lastEvent?.isTap).toBe(true);
      expect(result.current.lastEvent?.isHold).toBe(false);
      expect(result.current.lastEvent?.duration).toBeLessThan(200);
    });

    it('should detect hold for regular keys', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Long hold on regular key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: 'Space',
          code: 'Space'
        });
        window.dispatchEvent(down);
      });
      
      await wait(250); // Hold longer than threshold
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: 'Space',
          code: 'Space'
        });
        window.dispatchEvent(up);
      });
      
      // Now passes with universal tap/hold detection
      expect(result.current.lastEvent?.isTap).toBe(false);
      expect(result.current.lastEvent?.isHold).toBe(true);
      expect(result.current.lastEvent?.duration).toBeGreaterThanOrEqual(250);
    });

    it('should detect tap for number keys', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ tapHoldThreshold: 200 }));
      
      // Quick tap on number key
      await act(async () => {
        const down = createKeyboardEvent('keydown', {
          key: '1',
          code: 'Digit1'
        });
        window.dispatchEvent(down);
      });
      
      await wait(75); // Quick release
      
      await act(async () => {
        const up = createKeyboardEvent('keyup', {
          key: '1',
          code: 'Digit1'
        });
        window.dispatchEvent(up);
      });
      
      // Now passes with universal tap/hold detection
      expect(result.current.lastEvent?.isTap).toBe(true);
      expect(result.current.lastEvent?.isHold).toBe(false);
      expect(result.current.lastEvent?.duration).toBeLessThan(200);
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
        sequences: {
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
        sequences: {
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
          },
          debug: true  // Sequence-level debug  
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