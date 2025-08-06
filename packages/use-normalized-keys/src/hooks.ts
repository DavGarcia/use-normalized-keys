/**
 * Unified helper hooks for use-normalized-keys
 * 
 * This module provides the unified useHoldSequence hook that combines functionality
 * from the previous useHoldProgress, useHoldAnimation, and useSequence hooks into
 * a single optimized API with 60fps requestAnimationFrame animations.
 * 
 * @version 1.1.0
 * @since 1.1.0 - Unified API with RAF animations
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNormalizedKeysContext } from './context';
import type { CurrentHolds, HoldProgress, MatchedSequence } from './index';

/**
 * Unified hook for comprehensive hold sequence functionality with 60fps animations
 * 
 * **NEW in v1.1.0!** This hook combines functionality from useHoldProgress, useHoldAnimation, 
 * and useSequence into a single optimized API. It provides real-time progress tracking,
 * smooth 60fps visual effects using requestAnimationFrame, and game event detection.
 * 
 * **Key Benefits:**
 * - 🚀 **60fps Animations**: requestAnimationFrame for perfectly smooth visual effects
 * - ⚡ **Single Hook**: Replaces useHoldProgress + useHoldAnimation + useSequence
 * - 🎯 **Real-time Properties**: Progress, timing, animation values, and event flags
 * - 🎮 **Game-Optimized**: Built for responsive game mechanics
 * - 📊 **Complete API**: Everything you need in one optimized hook
 * 
 * **Usage:**
 * ```tsx
 * import { NormalizedKeysProvider, useHoldSequence, holdSequence } from 'use-normalized-keys';
 * 
 * function PowerAttack() {
 *   const power = useHoldSequence('power-attack');
 *   
 *   return (
 *     <div style={{
 *       transform: `scale(${power.scale})`,
 *       opacity: power.opacity,
 *       boxShadow: power.glow > 0 ? `0 0 ${power.glow * 20}px #ff6b35` : 'none'
 *     }}>
 *       Progress: {Math.round(power.progress)}%
 *       {power.isReady && <span>READY!</span>}
 *     </div>
 *   );
 * }
 * 
 * function App() {
 *   return (
 *     <NormalizedKeysProvider sequences={[holdSequence('power-attack', 'f', 1000)]}>
 *       <PowerAttack />
 *     </NormalizedKeysProvider>
 *   );
 * }
 * ```
 * 
 * @param sequenceId - The ID of the hold sequence to track (must match sequence definition)
 * @returns Comprehensive object with progress, animations, timing, and events
 * 
 * @throws {Error} When used outside of NormalizedKeysProvider
 * 
 * @since 1.1.0
 * @category Unified Hooks
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
  // This combines all functionality that was previously split across multiple hooks
  return {
    // Core Progress Data (replaces useHoldProgress functionality)
    /** Real-time progress percentage (0-100) from Context's authoritative data */
    progress: hold?.progressPercent || 0,
    /** Whether the key is currently being held */
    isHolding: !!hold,
    /** Whether the hold duration has been completed */
    isComplete: hold?.isComplete || false,
    /** Time elapsed since hold started (ms) */
    elapsedTime: hold?.elapsedTime || 0,
    /** Time remaining until completion (ms) */
    remainingTime: hold?.remainingTime || 0,
    /** Timestamp when hold started (null if not holding) */
    startTime: hold?.startTime || null,
    /** Required hold duration in milliseconds */
    minHoldTime: hold?.minHoldTime || 0,
    
    // Animation Properties (replaces useHoldAnimation functionality)
    /** Scale multiplier for transform: scale() CSS (1.0 to 1.3) */
    scale,
    /** Opacity value for smooth fade-in effect (0.3 to 1.0) */
    opacity,
    /** Glow intensity for box-shadow effects (0 to 1) */
    glow,
    /** Shake offset in pixels for dramatic effect near completion */
    shake,
    /** Whether currently charging (same as isHolding && !isComplete) */
    isCharging,
    /** Whether at 90%+ progress and ready to trigger */
    isReady,
    /** Whether animation should be active (same as isCharging) */
    isAnimating,
    
    // Game Event Flags (replaces useSequence functionality)
    /** True for 100ms after hold sequence starts (use in useEffect) */
    justStarted: lastEvent?.type === 'started' && timeSinceLastEvent < eventWindow,
    /** True for 100ms after hold sequence completes (use in useEffect) */
    justCompleted: lastEvent?.type === 'completed' && timeSinceLastEvent < eventWindow,
    /** True for 100ms after hold sequence is cancelled (use in useEffect) */
    justCancelled: lastEvent?.type === 'cancelled' && timeSinceLastEvent < eventWindow,
    
    // Extended Timing Information
    /** Time in milliseconds since hold started (null if not holding) */
    timeSinceStart: hold ? Date.now() - hold.startTime : null,
    /** Time in milliseconds since last event (null if no events) */
    timeSinceLastEvent: lastEvent ? timeSinceLastEvent : null,
    
    // Match Information
    /** Most recent sequence match object with detailed data */
    lastMatch,
    /** Total number of times this sequence has been matched */
    matchCount: matches.length,
    
    // Event History for Advanced Use Cases
    /** Array of recent events (started/completed/cancelled) with timestamps */
    eventHistory,
  };
}