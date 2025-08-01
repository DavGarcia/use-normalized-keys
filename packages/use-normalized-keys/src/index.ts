import { useEffect, useState, useCallback } from 'react';

// Type definitions for the hook
export interface NormalizedKeyState {
  lastKey: string | null;
  pressedKeys: Set<string>;
  isKeyPressed: (key: string) => boolean;
}

export interface UseNormalizedKeysOptions {
  // Configuration options will be defined here in future iterations
  enabled?: boolean;
}

/**
 * A React hook for normalized keyboard input handling
 * Optimized for games and interactive applications
 * 
 * @param options Configuration options for the hook
 * @returns Object containing normalized keyboard state and utilities
 */
export function useNormalizedKeys(options: UseNormalizedKeysOptions = {}): NormalizedKeyState {
  const { enabled = true } = options;
  
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const isKeyPressed = useCallback((key: string): boolean => {
    return pressedKeys.has(key);
  }, [pressedKeys]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key; // Basic normalization - will be enhanced later
      
      setLastKey(normalizedKey);
      setPressedKeys(prev => new Set(prev).add(normalizedKey));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = event.key; // Basic normalization - will be enhanced later
      
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedKey);
        return newSet;
      });
    };

    // Add event listeners to document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  return {
    lastKey,
    pressedKeys,
    isKeyPressed
  };
}

// Types are already exported above with the interface declarations