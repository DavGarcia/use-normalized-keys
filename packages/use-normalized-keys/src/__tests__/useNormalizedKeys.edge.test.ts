import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys } from '../index';
import { createKeyboardEvent, mockPlatform, simulateKeyDown, simulateKeyUp } from './testUtils';

describe('useNormalizedKeys - Edge Cases and Error Conditions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockPlatform('Linux');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Debug Mode', () => {
    it('should log debug information when debug mode is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      await simulateKeyDown(window, 'a');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('[useNormalizedKeys]'))
      )).toBe(true);
      consoleSpy.mockRestore();
    });

    it('should log suppressed repeat events in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // First real keydown
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a', repeat: false });
        window.dispatchEvent(event);
      });

      // Repeat keydown
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a', repeat: true });
        window.dispatchEvent(event);
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Suppressed repeat event'));
      consoleSpy.mockRestore();
    });

    it('should log duplicate keydown suppression in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // First keydown
      await simulateKeyDown(window, 'a');
      
      // Duplicate keydown without keyup
      await simulateKeyDown(window, 'a');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Suppressed duplicate keydown'));
      consoleSpy.mockRestore();
    });

    it('should log keyup without keydown suppression in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Keyup without prior keydown
      await simulateKeyUp(window, 'a');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Suppressed keyup for key not tracked as down'));
      consoleSpy.mockRestore();
    });

    it('should log focus loss reset in debug mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Press a key
      await simulateKeyDown(window, 'a');
      
      // Simulate blur
      await act(async () => {
        window.dispatchEvent(new Event('blur'));
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('All keys reset due to focus loss'));
      consoleSpy.mockRestore();
    });
  });

  describe('Platform-Specific Edge Cases', () => {
    it('should handle macOS Meta key timeout', async () => {
      mockPlatform('Mac');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Press Meta key
      await act(async () => {
        const event = createKeyboardEvent('keydown', {
          key: 'Meta',
          modifierStates: { Meta: true }
        });
        window.dispatchEvent(event);
      });

      // Advance time to trigger timeout
      vi.advanceTimersByTime(1100);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Force reset Meta key due to macOS timeout'));
      consoleSpy.mockRestore();
    });

    it('should validate key events and warn about inconsistencies', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Send event with empty key
      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: '', code: 'Unknown' });
        window.dispatchEvent(event);
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useNormalizedKeys] Key event validation issues'),
        expect.objectContaining({
          isValid: false,
          corrections: expect.arrayContaining(['Empty key value detected'])
        })
      );
      warnSpy.mockRestore();
    });

    it('should log Windows phantom event suppression in debug mode', async () => {
      mockPlatform('Windows');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true }));

      // Set up scenario for phantom event
      await simulateKeyDown(window, 'Shift', { modifierStates: { Shift: true } });
      await simulateKeyDown(window, 'End', { code: 'Numpad1', modifierStates: { Shift: true } });
      
      // Phantom Shift up
      await act(async () => {
        const event = createKeyboardEvent('keyup', {
          key: 'Shift',
          code: 'ShiftLeft',
          modifierStates: { Shift: true } // Still held
        });
        window.dispatchEvent(event);
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Suppressed Windows Shift+Numpad phantom event'));
      consoleSpy.mockRestore();
    });
  });

  describe('Event Target Edge Cases', () => {
    it('should handle events with non-element targets', async () => {
      const { result } = renderHook(() => useNormalizedKeys());

      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a' });
        // Set target to null
        Object.defineProperty(event, 'target', { value: null });
        window.dispatchEvent(event);
      });

      expect(result.current.pressedKeys.has('a')).toBe(true);
    });

    it('should handle events with non-HTML element targets', async () => {
      const { result } = renderHook(() => useNormalizedKeys());

      await act(async () => {
        const event = createKeyboardEvent('keydown', { key: 'a' });
        // Set target to a text node
        const textNode = document.createTextNode('test');
        Object.defineProperty(event, 'target', { value: textNode });
        window.dispatchEvent(event);
      });

      expect(result.current.pressedKeys.has('a')).toBe(true);
    });
  });

  describe('Modifier Key Edge Cases', () => {
    it('should calculate duration for modifier keyup events', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useNormalizedKeys({ debug: true, tapHoldThreshold: 100 }));

      // Press modifier
      await simulateKeyDown(window, 'Control', { modifierStates: { Control: true } });
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Release modifier
      await simulateKeyUp(window, 'Control', { modifierStates: { Control: false } });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Modifier key Control held for'));
      expect(result.current.lastEvent?.isHold).toBe(true);
      expect(result.current.lastEvent?.isTap).toBe(false);
      
      consoleSpy.mockRestore();
      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('Capture Phase Event Handling', () => {
    it('should capture events in capture phase to prevent stopPropagation issues', async () => {
      const { result } = renderHook(() => useNormalizedKeys());
      
      let capturePhaseHandled = false;
      let bubblePhaseHandled = false;

      // Add a listener that stops propagation in bubble phase
      const bubbleHandler = (e: Event) => {
        bubblePhaseHandled = true;
        e.stopPropagation();
      };
      window.addEventListener('keydown', bubbleHandler);

      // Add a capture phase listener to verify our hook runs first
      const captureHandler = () => {
        capturePhaseHandled = true;
      };
      window.addEventListener('keydown', captureHandler, true);

      await simulateKeyDown(window, 'a');

      expect(result.current.pressedKeys.has('a')).toBe(true);
      expect(capturePhaseHandled).toBe(true);

      window.removeEventListener('keydown', bubbleHandler);
      window.removeEventListener('keydown', captureHandler, true);
    });
  });
});