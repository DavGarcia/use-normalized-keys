import React, { createContext, useContext } from 'react';
import { useNormalizedKeys } from '../index';
import type { NormalizedKeyState, UseNormalizedKeysOptions } from '../index';

/**
 * Context type for sharing useNormalizedKeys state
 */
export type NormalizedKeysContextType = NormalizedKeyState;

/**
 * React Context for sharing keyboard state across component tree
 * Default value is null to enable proper detection of Provider presence
 */
export const NormalizedKeysContext = createContext<NormalizedKeysContextType | null>(null);

/**
 * Props for NormalizedKeysProvider component
 */
export interface NormalizedKeysProviderProps extends UseNormalizedKeysOptions {
  children: React.ReactNode;
}

/**
 * Provider component that creates and shares a single useNormalizedKeys instance
 * 
 * @param props - Provider props including all UseNormalizedKeysOptions and children
 * @returns Provider component wrapping children with shared keyboard state
 * 
 * @example
 * ```tsx
 * <NormalizedKeysProvider debug={true} tapHoldThreshold={200}>
 *   <App />
 * </NormalizedKeysProvider>
 * ```
 */
export function NormalizedKeysProvider({ 
  children, 
  ...options 
}: NormalizedKeysProviderProps): JSX.Element {
  // Create single instance of useNormalizedKeys with provided options
  const normalizedKeysState = useNormalizedKeys(options);

  return (
    <NormalizedKeysContext.Provider value={normalizedKeysState}>
      {children}
    </NormalizedKeysContext.Provider>
  );
}

/**
 * Hook for accessing shared keyboard state from NormalizedKeysContext
 * 
 * @returns NormalizedKeysContextType when inside Provider, null otherwise
 * 
 * @example
 * ```tsx
 * const context = useNormalizedKeysContext();
 * if (context) {
 *   console.log('Pressed keys:', context.pressedKeys);
 * }
 * ```
 */
export function useNormalizedKeysContext(): NormalizedKeysContextType | null {
  return useContext(NormalizedKeysContext);
}