import { act } from '@testing-library/react';

/**
 * Creates a mock KeyboardEvent with customizable properties
 */
export function createKeyboardEvent(
  type: 'keydown' | 'keyup',
  options: Partial<KeyboardEvent> & {
    key: string;
    code?: string;
    modifierStates?: Record<string, boolean>;
    timeStamp?: number;
  }
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    key: options.key,
    code: options.code || `Key${options.key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  // Mock getModifierState since happy-dom doesn't implement it fully
  if (options.modifierStates) {
    event.getModifierState = (key: string) => {
      return options.modifierStates?.[key] || false;
    };
  }

  // Mock timeStamp if provided since it's readonly
  if (options.timeStamp !== undefined) {
    Object.defineProperty(event, 'timeStamp', {
      value: options.timeStamp,
      writable: false,
      configurable: true
    });
  }

  return event;
}

/**
 * Simulates a complete key press (down + up)
 */
export async function simulateKeyPress(
  element: HTMLElement | Window,
  key: string,
  options?: Partial<KeyboardEvent>
) {
  await act(async () => {
    const downEvent = createKeyboardEvent('keydown', { key, ...options });
    element.dispatchEvent(downEvent);
  });

  await act(async () => {
    const upEvent = createKeyboardEvent('keyup', { key, ...options });
    element.dispatchEvent(upEvent);
  });
}

/**
 * Simulates a key being held down
 */
export async function simulateKeyDown(
  element: HTMLElement | Window,
  key: string,
  options?: Partial<KeyboardEvent>
) {
  await act(async () => {
    const event = createKeyboardEvent('keydown', { key, ...options });
    element.dispatchEvent(event);
  });
}

/**
 * Simulates a key being released
 */
export async function simulateKeyUp(
  element: HTMLElement | Window,
  key: string,
  options?: Partial<KeyboardEvent>
) {
  await act(async () => {
    const event = createKeyboardEvent('keyup', { key, ...options });
    element.dispatchEvent(event);
  });
}

/**
 * Creates a sequence of keyboard events for testing
 */
export interface KeyEventSequence {
  type: 'keydown' | 'keyup';
  key: string;
  code?: string;
  delay?: number;
  modifierStates?: Record<string, boolean>;
  repeat?: boolean;
}

/**
 * Simulates a sequence of keyboard events
 */
export async function simulateKeySequence(
  element: HTMLElement | Window,
  sequence: KeyEventSequence[]
) {
  for (const step of sequence) {
    if (step.delay) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    await act(async () => {
      const event = createKeyboardEvent(step.type, {
        key: step.key,
        code: step.code,
        modifierStates: step.modifierStates,
        repeat: step.repeat,
      });
      element.dispatchEvent(event);
    });
  }
}

/**
 * Simulates the Windows Shift+Numpad phantom event sequence
 */
export async function simulateWindowsShiftNumpadPhantom(
  element: HTMLElement | Window,
  numpadKey: string = 'Numpad1'
) {
  const sequence: KeyEventSequence[] = [
    // Real Shift down
    {
      type: 'keydown',
      key: 'Shift',
      code: 'ShiftLeft',
      modifierStates: { Shift: true },
    },
    // Phantom Shift up (should be suppressed)
    {
      type: 'keyup',
      key: 'Shift',
      code: 'ShiftLeft',
      modifierStates: { Shift: true }, // Still physically held!
    },
    // Numpad key down
    {
      type: 'keydown',
      key: 'End',
      code: numpadKey,
      modifierStates: { Shift: true },
    },
    // Numpad key up
    {
      type: 'keyup',
      key: 'End',
      code: numpadKey,
      modifierStates: { Shift: true },
    },
    // Phantom Shift down (should be suppressed)
    {
      type: 'keydown',
      key: 'Shift',
      code: 'ShiftLeft',
      modifierStates: { Shift: true },
    },
    // Real Shift up
    {
      type: 'keyup',
      key: 'Shift',
      code: 'ShiftLeft',
      modifierStates: { Shift: false }, // Actually released now
    },
  ];

  await simulateKeySequence(element, sequence);
}

/**
 * Mock platform detection for testing
 */
export function mockPlatform(platform: 'Windows' | 'Mac' | 'Linux') {
  const platformMap = {
    Windows: 'Win32',
    Mac: 'MacIntel',
    Linux: 'Linux',
  };

  Object.defineProperty(window.navigator, 'platform', {
    writable: true,
    configurable: true,
    value: platformMap[platform],
  });

  const userAgentMap = {
    Windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    Linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  };

  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: userAgentMap[platform],
  });
}

/**
 * Wait for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}