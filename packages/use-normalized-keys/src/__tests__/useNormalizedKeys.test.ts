import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys } from '../index';
import { simulateKeyPress, simulateKeyDown, simulateKeyUp } from './testUtils';

describe('useNormalizedKeys', () => {
  beforeEach(() => {
    // Clear any previous key states
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useNormalizedKeys());

      expect(result.current.lastEvent).toBeNull();
      expect(result.current.pressedKeys.size).toBe(0);
      expect(result.current.isKeyPressed('a')).toBe(false);
      expect(result.current.activeModifiers).toEqual({
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
        caps: false,
        numLock: false,
        scrollLock: false,
      });
    });

    it('should track key press and release', async () => {
      const { result } = renderHook(() => useNormalizedKeys());

      // Press 'a' key
      await simulateKeyDown(window, 'a');
      
      expect(result.current.pressedKeys.has('a')).toBe(true);
      expect(result.current.isKeyPressed('a')).toBe(true);
      expect(result.current.lastEvent?.key).toBe('a');
      expect(result.current.lastEvent?.type).toBe('keydown');

      // Release 'a' key
      await simulateKeyUp(window, 'a');
      
      expect(result.current.pressedKeys.has('a')).toBe(false);
      expect(result.current.isKeyPressed('a')).toBe(false);
      // After keyup, the event should have isTap=true for quick presses (under 200ms default threshold)
      expect(result.current.lastEvent?.type).toBe('keyup');
      expect(result.current.lastEvent?.key).toBe('a');
      expect(result.current.lastEvent?.isTap).toBe(true);
    });

    it('should handle multiple keys pressed simultaneously', async () => {
      const { result } = renderHook(() => useNormalizedKeys());

      // Press multiple keys
      await simulateKeyDown(window, 'a');
      await simulateKeyDown(window, 'b');
      await simulateKeyDown(window, 'c');

      expect(result.current.pressedKeys.size).toBe(3);
      expect(result.current.isKeyPressed('a')).toBe(true);
      expect(result.current.isKeyPressed('b')).toBe(true);
      expect(result.current.isKeyPressed('c')).toBe(true);

      // Release one key
      await simulateKeyUp(window, 'b');

      expect(result.current.pressedKeys.size).toBe(2);
      expect(result.current.isKeyPressed('a')).toBe(true);
      expect(result.current.isKeyPressed('b')).toBe(false);
      expect(result.current.isKeyPressed('c')).toBe(true);
    });

    it('should respect enabled option', async () => {
      const { result } = renderHook(() => useNormalizedKeys({ enabled: false }));

      await simulateKeyPress(window, 'a');

      expect(result.current.pressedKeys.size).toBe(0);
      expect(result.current.lastEvent).toBeNull();
    });

    it('should clean up on unmount', async () => {
      const { result, unmount } = renderHook(() => useNormalizedKeys());

      await simulateKeyDown(window, 'a');
      expect(result.current.pressedKeys.has('a')).toBe(true);

      unmount();

      // After unmount, new key events shouldn't affect the hook
      await simulateKeyUp(window, 'a');
      // No way to test this directly, but ensures no errors occur
    });
  });

  describe('Modifier Keys', () => {
    it('should track modifier key states', async () => {
      const { result } = renderHook(() => useNormalizedKeys());

      await simulateKeyDown(window, 'Shift', {
        modifierStates: { Shift: true },
      });

      expect(result.current.activeModifiers.shift).toBe(true);
      expect(result.current.lastEvent?.isModifier).toBe(true);

      await simulateKeyUp(window, 'Shift', {
        modifierStates: { Shift: false },
      });

      expect(result.current.activeModifiers.shift).toBe(false);
    });
  });
});