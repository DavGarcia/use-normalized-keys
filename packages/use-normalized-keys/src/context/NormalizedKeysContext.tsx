import React, { createContext, useContext } from 'react';
import { useNormalizedKeys } from '../index';
import type { NormalizedKeyState, UseNormalizedKeysOptions } from '../index';
import type { SequenceDefinition, MatchedSequence } from '../sequenceDetection';

/**
 * Context type for sharing useNormalizedKeys state across component tree
 * 
 * Enables the unified `useHoldSequence` hook to access keyboard state without
 * requiring each component to call `useNormalizedKeys` directly.
 * 
 * @since 1.1.0 - Enhanced for unified hook architecture
 */
export type NormalizedKeysContextType = NormalizedKeyState;

/**
 * React Context for sharing keyboard state across component tree
 * 
 * **Default value is null** to enable proper detection of Provider presence.
 * The `useHoldSequence` hook will throw a helpful error if used outside of a Provider.
 * 
 * @since 1.0.0
 */
export const NormalizedKeysContext = createContext<NormalizedKeysContextType | null>(null);

/**
 * Props for the NormalizedKeysProvider component
 * 
 * Simplified API for the Provider component with clean, intuitive props.
 * 
 * @since 1.1.0
 */
export interface NormalizedKeysProviderProps {
  /** React children to wrap with keyboard context */
  children: React.ReactNode;
  /** Array of sequence definitions */
  sequences?: SequenceDefinition[];
  /** Callback when sequences are matched */
  onSequenceMatch?: (match: MatchedSequence) => void;
  /** Enable debug logging */
  debug?: boolean;
  /** Whether hook is enabled */
  enabled?: boolean;
  /** Exclude input fields from keyboard handling */
  excludeInputFields?: boolean;
  /** Threshold in ms for tap vs hold detection */
  tapHoldThreshold?: number;
  /** Prevent default for keys - true for all, array for specific combinations */
  preventDefault?: boolean | string[];
}

/**
 * Provider component for unified hook architecture with simplified API
 * 
 * **NEW in v1.1.0!** Creates and shares a single `useNormalizedKeys` instance across
 * your component tree, enabling the `useHoldSequence` hook to work seamlessly.
 * 
 * **Key Benefits:**
 * - 🔄 **Simplified Setup**: One Provider, multiple `useHoldSequence` hooks
 * - ⚡ **Performance**: Single keyboard event listener for entire app
 * - 🎯 **Unified API**: Clean separation between setup and usage
 * - 🛠️ **Configuration**: All useNormalizedKeys options supported
 * 
 * @param props - Provider props including all UseNormalizedKeysOptions and children
 * @returns Provider component wrapping children with shared keyboard state
 * 
 * @example
 * ```tsx
 * import { NormalizedKeysProvider, useHoldSequence, holdSequence } from 'use-normalized-keys';
 * 
 * function GameComponent() {
 *   const powerAttack = useHoldSequence('power-attack');
 *   return <div>Power: {powerAttack.progress}%</div>;
 * }
 * 
 * function App() {
 *   return (
 *     <NormalizedKeysProvider 
 *       sequences={[
 *         holdSequence('power-attack', 'f', 1000)
 *       ]}
 *       debug={true}
 *       tapHoldThreshold={200}
 *       preventDefault={['Tab', 'F5']}
 *     >
 *       <GameComponent />
 *     </NormalizedKeysProvider>
 *   );
 * }
 * ```
 * 
 * @since 1.1.0
 * @category Context Provider
 */
export function NormalizedKeysProvider({ 
  children,
  sequences,
  onSequenceMatch,
  debug,
  enabled,
  excludeInputFields,
  tapHoldThreshold,
  preventDefault
}: NormalizedKeysProviderProps): JSX.Element {
  // Convert clean props to useNormalizedKeys format
  const sequenceOptions = sequences ? {
    sequences,
    ...(onSequenceMatch && { onSequenceMatch }),
    ...(debug !== undefined && { debug })
  } : undefined;

  // Create single instance of useNormalizedKeys
  const normalizedKeysState = useNormalizedKeys({
    enabled,
    debug,
    excludeInputFields,
    tapHoldThreshold,
    preventDefault,
    sequences: sequenceOptions
  });

  return (
    <NormalizedKeysContext.Provider value={normalizedKeysState}>
      {children}
    </NormalizedKeysContext.Provider>
  );
}

/**
 * Hook for accessing shared keyboard state from NormalizedKeysContext
 * 
 * **Low-level hook** used internally by `useHoldSequence`. Most users should prefer
 * the `useHoldSequence` hook which provides a more convenient API for hold sequences.
 * 
 * **When to use this hook:**
 * - Accessing basic keyboard state (pressedKeys, lastEvent, etc.)
 * - Building custom sequence hooks
 * - Advanced use cases requiring direct Context access
 * 
 * **When to use `useHoldSequence` instead:**
 * - Tracking hold progress with visual animations
 * - Game mechanics with charging/power-up effects
 * - Any sequence-based interactions
 * 
 * @returns NormalizedKeysContextType when inside Provider, null otherwise
 * @throws Does not throw - returns null if used outside Provider
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const context = useNormalizedKeysContext();
 * if (context) {
 *   console.log('Pressed keys:', Array.from(context.pressedKeys));
 *   console.log('Last event:', context.lastEvent?.key);
 * }
 * 
 * // Custom sequence hook
 * function useCustomSequence(id: string) {
 *   const context = useNormalizedKeysContext();
 *   if (!context) return null;
 *   
 *   return context.sequences?.matches.find(m => m.sequenceId === id);
 * }
 * ```
 * 
 * @since 1.1.0 - Enhanced documentation
 * @category Context Hooks
 */
export function useNormalizedKeysContext(): NormalizedKeysContextType | null {
  return useContext(NormalizedKeysContext);
}