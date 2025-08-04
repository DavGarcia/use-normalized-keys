/**
 * Platform-Specific Quirks and Edge Case Handling
 * 
 * This module handles platform-specific keyboard input quirks and edge cases
 * to ensure consistent behavior across different operating systems and browsers.
 * 
 * Sources:
 * - Windows Shift+Numpad: https://stackoverflow.com/questions/55339015/shift-key-released-when-pressing-numpad
 * - macOS Meta key timeout: https://github.com/xyflow/xyflow/issues/4895
 * - Focus loss recovery: https://forum.playcanvas.com/t/no-key-up-when-focus-lost-character-keeps-moving/14125
 */

// Platform detection utilities
export const Platform = {
  isWindows: () => navigator.platform.startsWith('Win'),
  isMacOS: () => navigator.platform.startsWith('Mac'),
  isLinuxPlatform: () => navigator.platform.startsWith('Linux'),
  
  // User agent-based detection as fallback
  isWindowsUA: () => /Windows/.test(navigator.userAgent),
  isMacOSUA: () => /Mac OS X|macOS/.test(navigator.userAgent),
  isLinuxUA: () => /Linux/.test(navigator.userAgent),
  
  // Combined detection
  get isWin() { return this.isWindows() || this.isWindowsUA(); },
  get isMac() { return this.isMacOS() || this.isMacOSUA(); },
  get isLinux() { return this.isLinuxPlatform() || this.isLinuxUA(); },
};


// Numpad codes to watch (covers digits and common operators; include nav aliases if NumLock can be off)
const NUMPAD_CODES = new Set([
  'Numpad0','Numpad1','Numpad2','Numpad3','Numpad4','Numpad5','Numpad6','Numpad7','Numpad8','Numpad9',
  'NumpadAdd','NumpadSubtract','NumpadMultiply','NumpadDivide','NumpadDecimal','NumpadEnter'
]);

type BufferedEvent = {
  event: KeyboardEvent;
  timestamp: number;
  timeoutId: number | null;
};


type QuirkState = {
  // Buffering state
  bufferedShiftUp: BufferedEvent | null;  // Buffered Shift keyup waiting for numpad check
  numpadUpTime: number;                    // Last numpad keyup timestamp for phantom keydown detection
  shiftIsDown: boolean;                    // Track if Shift is currently down
  
  // Event callback
  emitEvent: ((event: KeyboardEvent) => void) | null;
  
  // Event tracking for debugging
  recentEvents: Array<{
    type: 'keydown' | 'keyup';
    key: string;
    code: string;
    timestamp: number;
  }>;
};

/**
 * Interface for tracking platform-specific state
 */
interface PlatformQuirkState {
  // Windows Shift+Numpad handling - new simplified approach
  windowsShiftQuirks: QuirkState;
  
  // macOS Meta key timeout handling  
  macOSMetaTimeoutId: number | null;
  macOSMetaLastActivity: number;
  
  // General stuck key detection
  suspiciousKeyStates: Map<string, number>; // key -> timestamp when became suspicious
}

/**
 * Creates a new platform quirk state tracker
 */
export function createPlatformQuirkState(): PlatformQuirkState {
  return {
    windowsShiftQuirks: {
      bufferedShiftUp: null,
      numpadUpTime: 0,
      shiftIsDown: false,
      emitEvent: null,
      recentEvents: [],
    },
    macOSMetaTimeoutId: null,
    macOSMetaLastActivity: 0,
    suspiciousKeyStates: new Map(),
  };
}

function addEventToHistory(e: KeyboardEvent, quirks: QuirkState) {
  const now = e.timeStamp ?? performance.now();
  quirks.recentEvents.push({
    type: e.type as 'keydown' | 'keyup',
    key: e.key,
    code: e.code,
    timestamp: now
  });
  
  // Keep only last 100ms of events
  const cutoff = now - 100;
  quirks.recentEvents = quirks.recentEvents.filter(evt => evt.timestamp >= cutoff);
}

/**
 * Sets up the event emission callback for buffered events
 * 
 * @param quirkState - Platform quirk state tracker
 * @param emitter - Function to call when events should be emitted
 */
export function setEventEmitter(
  quirkState: PlatformQuirkState, 
  emitter: (event: KeyboardEvent) => void
): void {
  quirkState.windowsShiftQuirks.emitEvent = emitter;
}

/**
 * Processes keyboard events for Windows Shift+Numpad phantom suppression with proper buffering
 * 
 * @param e - The keyboard event to check
 * @param keyStates - Map of current key states (your internal tracker)
 * @param quirkStateContainer - Platform quirk state tracker
 * @returns 'emit' | 'buffer' | 'suppress' to indicate how to handle the event
 */
export function shouldSuppressWindowsShiftPhantom(
  e: KeyboardEvent,
  keyStates: Map<string, { isDown: boolean }>,
  quirkStateContainer: PlatformQuirkState
): 'emit' | 'buffer' | 'suppress' {
  if (!Platform.isWin) return 'emit';

  const quirks = quirkStateContainer.windowsShiftQuirks;
  const now = e.timeStamp ?? performance.now();
  const BUFFER_WINDOW_MS = 10;
  
  // Debug logging
  if (e.key === 'Shift' || NUMPAD_CODES.has(e.code)) {
    console.log(`[platformQuirks] ${e.type} ${e.key} ${e.code} at ${now.toFixed(1)}`);
  }
  
  // Track all events for debugging
  addEventToHistory(e, quirks);

  // Handle Shift events
  if (e.key === 'Shift') {
    if (e.type === 'keydown') {
      // Check if this is a phantom keydown (within 10ms of numpad keyup)
      if (quirks.shiftIsDown && quirks.numpadUpTime > 0) {
        const timeSinceNumpadUp = now - quirks.numpadUpTime;
        if (timeSinceNumpadUp <= BUFFER_WINDOW_MS) {
          console.log(`[platformQuirks] Suppressing phantom Shift keydown (${timeSinceNumpadUp.toFixed(1)}ms after numpad keyup)`);
          return 'suppress';
        }
      }
      
      // Track real Shift keydown
      quirks.shiftIsDown = true;
      console.log('[platformQuirks] Real Shift keydown');
      return 'emit';
      
    } else if (e.type === 'keyup') {
      // Check if this event was already buffered and is being re-emitted
      // We use a custom property to track this
      if ((e as any).__useNormalizedKeys_processed) {
        console.log('[platformQuirks] Emitting already-processed Shift keyup');
        quirks.shiftIsDown = false;
        return 'emit';
      }
      
      // Clear any existing buffered event (sliding window extension)
      if (quirks.bufferedShiftUp && quirks.bufferedShiftUp.timeoutId) {
        clearTimeout(quirks.bufferedShiftUp.timeoutId);
        console.log('[platformQuirks] Extending Shift keyup buffer window');
      }
      
      // Buffer this Shift keyup
      console.log('[platformQuirks] Buffering Shift keyup for 10ms to check for phantom');
      
      const timeoutId = setTimeout(() => {
        // No numpad arrived, this is a real Shift keyup
        console.log('[platformQuirks] No numpad detected, emitting real Shift keyup');
        quirks.shiftIsDown = false;
        quirks.bufferedShiftUp = null;
        
        // Emit the event if we have an emitter
        if (quirks.emitEvent) {
          // Mark the event as processed to prevent re-buffering
          (e as any).__useNormalizedKeys_processed = true;
          quirks.emitEvent(e);
        }
      }, BUFFER_WINDOW_MS);
      
      quirks.bufferedShiftUp = {
        event: e,
        timestamp: now,
        timeoutId: timeoutId as any
      };
      
      return 'buffer';
    }
  }
  
  // Handle Numpad events
  else if (NUMPAD_CODES.has(e.code)) {
    if (e.type === 'keydown') {
      // Check if there's a buffered Shift keyup that should be suppressed
      if (quirks.bufferedShiftUp) {
        const timeSinceBuffer = now - quirks.bufferedShiftUp.timestamp;
        if (timeSinceBuffer <= BUFFER_WINDOW_MS) {
          console.log(`[platformQuirks] Numpad keydown confirms phantom Shift keyup (${timeSinceBuffer.toFixed(1)}ms after)`);
          
          // Cancel the timeout and clear the buffer
          if (quirks.bufferedShiftUp.timeoutId) {
            clearTimeout(quirks.bufferedShiftUp.timeoutId);
          }
          quirks.bufferedShiftUp = null;
        }
      }
    } else if (e.type === 'keyup') {
      // Check if there's a buffered Shift keyup that should be cleared (rapid typing fix)
      if (quirks.bufferedShiftUp) {
        const timeSinceBuffer = now - quirks.bufferedShiftUp.timestamp;
        if (timeSinceBuffer <= BUFFER_WINDOW_MS) {
          console.log(`[platformQuirks] Numpad keyup confirms phantom Shift keyup (${timeSinceBuffer.toFixed(1)}ms after)`);
          
          // Cancel the timeout and clear the buffer
          if (quirks.bufferedShiftUp.timeoutId) {
            clearTimeout(quirks.bufferedShiftUp.timeoutId);
          }
          quirks.bufferedShiftUp = null;
        }
      }
      
      // Record numpad keyup time for phantom Shift keydown detection
      quirks.numpadUpTime = now;
      console.log(`[platformQuirks] Recording numpad keyup at ${now.toFixed(1)}`);
    }
  }

  return 'emit';
}

/**
 * Handles macOS Meta key timeout issues
 * 
 * @param event - The keyboard event
 * @param quirkState - Platform quirk state tracker
 * @param onMetaTimeout - Callback to execute when Meta key times out
 */
export function handleMacOSMetaTimeout(
  event: KeyboardEvent,
  quirkState: PlatformQuirkState,
  onMetaTimeout: () => void
): void {
  // Only apply on macOS
  if (!Platform.isMac) return;
  
  const now = Date.now();
  const META_TIMEOUT_MS = 1000; // 1 second timeout for stuck Meta key
  
  // Update activity timestamp for any key event
  quirkState.macOSMetaLastActivity = now;
  
  // If Meta key is involved, setup/reset timeout
  if (event.key === 'Meta' || event.metaKey) {
    // Clear existing timeout
    if (quirkState.macOSMetaTimeoutId) {
      clearTimeout(quirkState.macOSMetaTimeoutId);
    }
    
    // Set up new timeout if Meta is active
    if (event.getModifierState('Meta')) {
      quirkState.macOSMetaTimeoutId = window.setTimeout(() => {
        // Check if there's been recent activity
        const timeSinceActivity = Date.now() - quirkState.macOSMetaLastActivity;
        
        if (timeSinceActivity >= META_TIMEOUT_MS) {
          console.log('[platformQuirks] macOS Meta key timeout - forcing reset');
          onMetaTimeout();
          quirkState.macOSMetaTimeoutId = null;
        }
      }, META_TIMEOUT_MS);
    } else {
      quirkState.macOSMetaTimeoutId = null;
    }
  }
  
  // If any non-Meta key is released while Meta was potentially stuck,
  // it's a good time to check and clean up Meta state
  if (event.type === 'keyup' && event.key !== 'Meta' && quirkState.macOSMetaTimeoutId) {
    // Check if Meta is still reported as active but shouldn't be
    if (!event.getModifierState('Meta')) {
      if (quirkState.macOSMetaTimeoutId) {
        clearTimeout(quirkState.macOSMetaTimeoutId);
        quirkState.macOSMetaTimeoutId = null;
      }
    }
  }
}

/**
 * Performs cross-platform consistency checks on key events
 * 
 * @param event - The keyboard event to validate
 * @param quirkState - Platform quirk state tracker
 * @returns Object with validation results and any necessary corrections
 */
export function validateKeyEventConsistency(
  event: KeyboardEvent,
  quirkState: PlatformQuirkState
): {
  isValid: boolean;
  corrections: string[];
  warnings: string[];
} {
  const corrections: string[] = [];
  const warnings: string[] = [];
  let isValid = true;
  
  // Check for modifier state consistency
  const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta'];
  modifierKeys.forEach(modifier => {
    const eventHasModifier = event.key === modifier;
    const modifierStateActive = event.getModifierState(modifier);
    
    // For keydown events, the modifier should be active
    if (event.type === 'keydown' && eventHasModifier && !modifierStateActive) {
      warnings.push(`${modifier} keydown but getModifierState reports inactive`);
    }
    
    // For keyup events, timing might vary
    if (event.type === 'keyup' && eventHasModifier) {
      // This is normal variation, don't flag as issue
    }
  });
  
  // Check for suspicious repeat patterns
  if (event.repeat && event.type === 'keyup') {
    warnings.push('Keyup event marked as repeat (unusual)');
    isValid = false;
  }
  
  // Check for empty key values
  if (!event.key || event.key.length === 0) {
    corrections.push('Empty key value detected');
    isValid = false;
  }
  
  // Check for inconsistent numpad detection
  if (event.code.startsWith('Numpad') && event.location !== 3) {
    warnings.push('Numpad code without numpad location');
  }
  
  return { isValid, corrections, warnings };
}

/**
 * Cleans up platform quirk state and timers
 * 
 * @param quirkState - Platform quirk state tracker to clean up
 */
export function cleanupPlatformQuirks(quirkState: PlatformQuirkState): void {
  // Clear buffered events
  const quirks = quirkState.windowsShiftQuirks;
  if (quirks.bufferedShiftUp && quirks.bufferedShiftUp.timeoutId) {
    clearTimeout(quirks.bufferedShiftUp.timeoutId);
  }
  
  // Reset Windows quirk state
  quirks.bufferedShiftUp = null;
  quirks.numpadUpTime = 0;
  quirks.shiftIsDown = false;
  quirks.recentEvents = [];
  
  // Clear macOS Meta timeout
  if (quirkState.macOSMetaTimeoutId) {
    clearTimeout(quirkState.macOSMetaTimeoutId);
    quirkState.macOSMetaTimeoutId = null;
  }
  
  // Clear suspicious key states
  quirkState.suspiciousKeyStates.clear();
  
  console.log('[platformQuirks] Platform quirk state cleaned up');
}

/**
 * Gets platform-specific debugging information
 * 
 * @param quirkState - Platform quirk state tracker
 * @returns Object with debugging information
 */
export function getPlatformDebugInfo(quirkState: PlatformQuirkState) {
  return {
    platform: {
      detected: Platform.isWin ? 'Windows' : Platform.isMac ? 'macOS' : Platform.isLinux ? 'Linux' : 'Unknown',
      navigator: {
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 100) + '...'
      }
    },
    quirks: {
      windowsShiftBuffered: quirkState.windowsShiftQuirks.bufferedShiftUp !== null,
      windowsShiftIsDown: quirkState.windowsShiftQuirks.shiftIsDown,
      windowsRecentEvents: quirkState.windowsShiftQuirks.recentEvents.length,
      macOSMetaTimeoutActive: quirkState.macOSMetaTimeoutId !== null,
      suspiciousKeys: quirkState.suspiciousKeyStates.size
    }
  };
}