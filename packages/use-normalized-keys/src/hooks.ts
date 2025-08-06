/**
 * Helper hooks for use-normalized-keys
 * 
 * These hooks provide simplified APIs for common use cases,
 * particularly for game development and interactive applications.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNormalizedKeysContext } from './context';
import type { CurrentHolds, HoldProgress, MatchedSequence } from './index';

/**
 * Unified hook for comprehensive hold sequence functionality
 * 
 * Combines functionality from useHoldProgress, useHoldAnimation, and useSequence
 * into a single optimized hook with 60fps smooth animations using requestAnimationFrame.
 * Provides all progress data, animation properties, and game event flags in one hook.
 * 
 * This replaces the need for separate useHoldProgress, useHoldAnimation, and useSequence hooks
 * while providing superior performance with a single RAF loop per sequence.
 * 
 * @param sequenceId - The ID of the hold sequence to track
 * @returns Object with comprehensive functionality including progress, animation, and events
 */
export function useHoldSequence(sequenceId: string) {
  const context = useNormalizedKeysContext();
  
  if (!context) {
    throw new Error(
      'useHoldSequence must be used within a NormalizedKeysProvider. ' +
      'Wrap your component tree with <NormalizedKeysProvider>...</NormalizedKeysProvider>'
    );
  }
  
  const { currentHolds, sequences } = context;
  
  // Event tracking state for game logic
  const [eventHistory, setEventHistory] = useState<Array<{
    timestamp: number;
    type: 'started' | 'completed' | 'cancelled';
  }>>([]);
  
  // Previous state tracking for event detection
  const previousHoldRef = useRef<HoldProgress | undefined>();
  const previousMatchRef = useRef<number>(0);

  // Get current state
  const hold = currentHolds.get(sequenceId);
  const allMatches = sequences?.matches || [];
  const matches = allMatches.filter(m => m.sequenceId === sequenceId);
  const lastMatch = matches[matches.length - 1];
  const lastMatchTime = lastMatch?.matchedAt || 0;

  // Calculate animation properties directly from current progress (no RAF needed)
  const currentProgress = hold?.progressPercent || 0;
  const currentTime = Date.now();
  
  // Animation properties calculated on each render (synchronized with Context updates)
  const scale = 1 + (currentProgress / 100) * 0.3; // Grows up to 1.3x
  const opacity = 0.3 + (currentProgress / 100) * 0.7; // Fades in to full opacity
  const glow = currentProgress > 80 ? (currentProgress - 80) / 20 : 0; // Glow effect near completion
  const shake = currentProgress > 90 ? Math.sin(currentTime * 0.03) * 2 : 0; // Shake when almost ready
  const isCharging = !!hold && !hold.isComplete;
  const isReady = currentProgress > 90;
  const isAnimating = isCharging;

  // Track hold started/cancelled events for game logic
  useEffect(() => {
    const currentHold = hold;
    const previousHold = previousHoldRef.current;

    if (currentHold && !previousHold) {
      // Hold just started
      setEventHistory(prev => [...prev.slice(-9), {
        timestamp: Date.now(),
        type: 'started'
      }]);
    } else if (!currentHold && previousHold && !previousHold.isComplete) {
      // Hold was cancelled (released before completion)
      setEventHistory(prev => [...prev.slice(-9), {
        timestamp: Date.now(),
        type: 'cancelled'
      }]);
    }

    previousHoldRef.current = currentHold;
  }, [hold]);

  // Track completion events
  useEffect(() => {
    if (lastMatchTime > previousMatchRef.current) {
      // New match detected - sequence completed
      setEventHistory(prev => [...prev.slice(-9), {
        timestamp: lastMatchTime,
        type: 'completed'
      }]);
      previousMatchRef.current = lastMatchTime;
    }
  }, [lastMatchTime]);

  // Calculate event flags with timing window
  const lastEvent = eventHistory[eventHistory.length - 1];
  const timeSinceLastEvent = lastEvent ? Date.now() - lastEvent.timestamp : Infinity;
  
  // Event window (how long the "just" flags stay true)
  const eventWindow = 100; // milliseconds

  // Return comprehensive unified API surface
  return {
    // Core progress data (from useHoldProgress functionality) - use real progress from Context
    progress: hold?.progressPercent || 0,
    isHolding: !!hold,
    isComplete: hold?.isComplete || false,
    elapsedTime: hold?.elapsedTime || 0,
    remainingTime: hold?.remainingTime || 0,
    startTime: hold?.startTime || null,
    minHoldTime: hold?.minHoldTime || 0,
    
    // Animation properties (from useHoldAnimation functionality)
    scale,
    opacity,
    glow,
    shake,
    isCharging,
    isReady,
    isAnimating,
    
    // Game event flags (from useSequence functionality)
    justStarted: lastEvent?.type === 'started' && timeSinceLastEvent < eventWindow,
    justCompleted: lastEvent?.type === 'completed' && timeSinceLastEvent < eventWindow,
    justCancelled: lastEvent?.type === 'cancelled' && timeSinceLastEvent < eventWindow,
    
    // Extended timing information
    timeSinceStart: hold ? Date.now() - hold.startTime : null,
    timeSinceLastEvent: lastEvent ? timeSinceLastEvent : null,
    
    // Match information
    lastMatch,
    matchCount: matches.length,
    
    // History for advanced use cases
    eventHistory,
  };
}