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
  
  // Unified animation state combining all visual properties
  const [animationState, setAnimationState] = useState({
    // Progress data
    progress: 0,
    
    // Animation properties
    scale: 1,
    opacity: 0.3,
    glow: 0,
    shake: 0,
    isAnimating: false,
    isCharging: false,
    isReady: false,
  });
  
  // Event tracking state for game logic
  const [eventHistory, setEventHistory] = useState<Array<{
    timestamp: number;
    type: 'started' | 'completed' | 'cancelled';
  }>>([]);
  
  // Animation frame management - optimized for single RAF loop
  const animationFrameRef = useRef<number>();
  const progressRef = useRef(0);
  const releaseAnimationRef = useRef(false);
  
  // Previous state tracking for event detection
  const previousHoldRef = useRef<HoldProgress | undefined>();
  const previousMatchRef = useRef<number>(0);

  // Get current state
  const hold = currentHolds.get(sequenceId);
  const allMatches = sequences?.matches || [];
  const matches = allMatches.filter(m => m.sequenceId === sequenceId);
  const lastMatch = matches[matches.length - 1];
  const lastMatchTime = lastMatch?.matchedAt || 0;

  // Single optimized RAF animation loop for 60fps performance
  useEffect(() => {
    let lastUpdateTime = Date.now();
    
    const animate = () => {
      const currentHold = currentHolds.get(sequenceId);
      const currentTime = Date.now();
      lastUpdateTime = currentTime;
      
      if (currentHold && !releaseAnimationRef.current) {
        // Calculate target progress using direct timestamp calculations for smoothness
        const elapsed = currentTime - currentHold.startTime;
        const targetProgress = Math.min(100, (elapsed / currentHold.minHoldTime) * 100);
        
        // Smooth interpolation with easing for 60fps smoothness
        const smoothingFactor = 0.12;
        const currentProgress = progressRef.current + (targetProgress - progressRef.current) * smoothingFactor;
        progressRef.current = currentProgress;
        
        // Calculate all animation properties based on progress
        const scale = 1 + (currentProgress / 100) * 0.3; // Grows up to 1.3x
        const opacity = 0.3 + (currentProgress / 100) * 0.7; // Fades in to full opacity
        const glow = currentProgress > 80 ? (currentProgress - 80) / 20 : 0; // Glow effect near completion
        const shake = currentProgress > 90 ? Math.sin(currentTime * 0.03) * 2 : 0; // Shake when almost ready
        
        setAnimationState({
          progress: currentProgress,
          scale,
          opacity,
          glow,
          shake,
          isAnimating: true,
          isCharging: true,
          isReady: currentProgress > 90,
        });
        
        if (!currentHold.isComplete) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      } else if (progressRef.current > 0.1) {
        // Release animation - smooth transition back to idle state
        releaseAnimationRef.current = true;
        const decayFactor = 0.88;
        const currentProgress = progressRef.current * decayFactor;
        progressRef.current = currentProgress;
        
        // Quick fade out animation
        const scale = 1 + (currentProgress / 100) * 0.1;
        const opacity = 0.3 + (currentProgress / 100) * 0.2;
        
        setAnimationState({
          progress: currentProgress,
          scale,
          opacity,
          glow: 0,
          shake: 0,
          isAnimating: currentProgress > 1,
          isCharging: false,
          isReady: false,
        });
        
        if (currentProgress > 0.1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          releaseAnimationRef.current = false;
        }
      } else {
        // Reset to idle state - animation complete
        progressRef.current = 0;
        releaseAnimationRef.current = false;
        setAnimationState({
          progress: 0,
          scale: 1,
          opacity: 0.3,
          glow: 0,
          shake: 0,
          isAnimating: false,
          isCharging: false,
          isReady: false,
        });
      }
    };

    // Optimize: start animation only when needed
    const shouldAnimate = hold || progressRef.current > 0.1;
    if (shouldAnimate) {
      lastUpdateTime = Date.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hold, currentHolds, sequenceId]);

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
    // Core progress data (from useHoldProgress functionality)
    progress: animationState.progress,
    isHolding: !!hold,
    isComplete: hold?.isComplete || false,
    elapsedTime: hold?.elapsedTime || 0,
    remainingTime: hold?.remainingTime || 0,
    startTime: hold?.startTime || null,
    minHoldTime: hold?.minHoldTime || 0,
    
    // Animation properties (from useHoldAnimation functionality)
    scale: animationState.scale,
    opacity: animationState.opacity,
    glow: animationState.glow,
    shake: animationState.shake,
    isCharging: animationState.isCharging,
    isReady: animationState.isReady,
    isAnimating: animationState.isAnimating,
    
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