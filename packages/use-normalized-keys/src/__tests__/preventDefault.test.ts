import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNormalizedKeys } from '../index';
import { createKeyboardEvent } from './testUtils';

describe('preventDefault API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic preventDefault functionality', () => {
    it('should prevent default for single key when preventDefault is true', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: true,
          debug: true 
        })
      );

      const mockEvent = createKeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab'
      });
      
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      // Simulate the event
      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(true);
    });

    it('should not prevent default when preventDefault is false or undefined', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: false,
          debug: true 
        })
      );

      const mockEvent = createKeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab'
      });
      
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      // Simulate the event
      act(() => {
        window.dispatchEvent(mockEvent);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(false);
    });
  });

  describe('Key combination preventDefault', () => {
    it('should prevent default for specific key combinations', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: ['Ctrl+S', 'Alt+F4', 'Ctrl+Tab'],
          debug: true 
        })
      );

      // Test Ctrl+S
      const ctrlSEvent = createKeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS',
        ctrlKey: true
      });
      
      const preventDefaultSpy = vi.spyOn(ctrlSEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(ctrlSEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(true);
    });

    it('should not prevent default for non-matching combinations', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: ['Ctrl+S', 'Alt+F4'],
          debug: true 
        })
      );

      // Test Ctrl+A (not in the list)
      const ctrlAEvent = createKeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        ctrlKey: true
      });
      
      const preventDefaultSpy = vi.spyOn(ctrlAEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(ctrlAEvent);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(false);
    });

    it('should handle complex modifier combinations', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: ['Ctrl+Shift+N', 'Ctrl+Alt+Delete'],
          debug: true 
        })
      );

      // Test Ctrl+Shift+N
      const complexEvent = createKeyboardEvent('keydown', {
        key: 'n',
        code: 'KeyN',
        ctrlKey: true,
        shiftKey: true
      });
      
      const preventDefaultSpy = vi.spyOn(complexEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(complexEvent);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(true);
    });

    it('should handle function keys and special keys', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: ['F5', 'F12', 'Escape'],
          debug: true 
        })
      );

      // Test F5
      const f5Event = createKeyboardEvent('keydown', {
        key: 'F5',
        code: 'F5'
      });
      
      const preventDefaultSpy = vi.spyOn(f5Event, 'preventDefault');

      act(() => {
        window.dispatchEvent(f5Event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(result.current.lastEvent?.preventedDefault).toBe(true);
    });
  });

  describe('preventDefault edge cases', () => {
    it('should work with both keydown and keyup events', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: ['Space'],
          debug: true 
        })
      );

      // Test keydown
      const keydownEvent = createKeyboardEvent('keydown', {
        key: ' ',
        code: 'Space'
      });
      
      const keydownSpy = vi.spyOn(keydownEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(keydownEvent);
      });

      expect(keydownSpy).toHaveBeenCalled();

      // Test keyup
      const keyupEvent = createKeyboardEvent('keyup', {
        key: ' ',
        code: 'Space'
      });
      
      const keyupSpy = vi.spyOn(keyupEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(keyupEvent);
      });

      expect(keyupSpy).toHaveBeenCalled();
    });

    it('should not prevent default in input fields when excludeInputFields is true', () => {
      const { result } = renderHook(() => 
        useNormalizedKeys({ 
          preventDefault: true,
          excludeInputFields: true,
          debug: true 
        })
      );

      // Create a mock input element
      const mockInput = document.createElement('input');
      
      const mockEvent = createKeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab'
      });
      
      // Mock the target to be the input element
      Object.defineProperty(mockEvent, 'target', {
        value: mockInput,
        configurable: true
      });
      
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');

      act(() => {
        window.dispatchEvent(mockEvent);
      });

      // Should not prevent default in input fields
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});