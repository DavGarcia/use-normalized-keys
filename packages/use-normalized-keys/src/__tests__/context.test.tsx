import { describe, it, expect, vi } from 'vitest';
import { renderHook, render, screen } from '@testing-library/react';
import React from 'react';
import { 
  NormalizedKeysContext, 
  NormalizedKeysProvider, 
  useNormalizedKeysContext 
} from '../context';
import type { NormalizedKeyState, UseNormalizedKeysOptions } from '../index';
import * as useNormalizedKeysModule from '../index';

// Mock useNormalizedKeys
vi.mock('../index', () => ({
  useNormalizedKeys: vi.fn(),
}));

describe('NormalizedKeysContext', () => {
  const mockNormalizedKeyState: NormalizedKeyState = {
    lastEvent: null,
    pressedKeys: new Set(),
    isKeyPressed: vi.fn(() => false),
    activeModifiers: {
      shift: false,
      ctrl: false,
      alt: false,
      meta: false,
      caps: false,
      numLock: false,
      scrollLock: false,
    },
    sequences: {
      matches: [],
      addSequence: vi.fn(),
      removeSequence: vi.fn(),
      clearSequences: vi.fn(),
      resetState: vi.fn(),
    },
    currentHolds: new Map(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(mockNormalizedKeyState);
  });

  describe('Context Creation', () => {
    it('should export NormalizedKeysContext', () => {
      expect(NormalizedKeysContext).toBeDefined();
      expect(NormalizedKeysContext).toHaveProperty('Provider');
      expect(NormalizedKeysContext).toHaveProperty('Consumer');
    });

    it('should have null as default value', () => {
      const TestComponent = () => {
        const context = React.useContext(NormalizedKeysContext);
        return <div data-testid="context-value">{context === null ? 'null' : 'not-null'}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('context-value')).toHaveTextContent('null');
    });
  });

  describe('NormalizedKeysProvider', () => {
    it('should accept children prop', () => {
      const TestChild = () => <div data-testid="test-child">Child Component</div>;
      
      render(
        <NormalizedKeysProvider>
          <TestChild />
        </NormalizedKeysProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should pass provider props to useNormalizedKeys correctly', () => {
      const sequences = [
        { id: 'test', keys: ['Space'], type: 'hold' as const }
      ];
      const onSequenceMatch = vi.fn();

      render(
        <NormalizedKeysProvider 
          debug={true}
          tapHoldThreshold={300}
          excludeInputFields={false}
          preventDefault={['Ctrl+S', 'Ctrl+A']}
          sequences={sequences}
          onSequenceMatch={onSequenceMatch}
        >
          <div>Test</div>
        </NormalizedKeysProvider>
      );

      expect(useNormalizedKeysModule.useNormalizedKeys).toHaveBeenCalledWith({
        debug: true,
        tapHoldThreshold: 300,
        excludeInputFields: false,
        preventDefault: ['Ctrl+S', 'Ctrl+A'],
        enabled: undefined,
        sequences: {
          sequences,
          onSequenceMatch,
          debug: true
        }
      });
    });

    it('should provide useNormalizedKeys state through context', () => {
      const TestComponent = () => {
        const context = useNormalizedKeysContext();
        return (
          <div>
            <div data-testid="context-exists">{context !== null ? 'exists' : 'null'}</div>
            <div data-testid="pressed-keys">{context?.pressedKeys.size || 0}</div>
          </div>
        );
      };

      render(
        <NormalizedKeysProvider>
          <TestComponent />
        </NormalizedKeysProvider>
      );

      expect(screen.getByTestId('context-exists')).toHaveTextContent('exists');
      expect(screen.getByTestId('pressed-keys')).toHaveTextContent('0');
    });

    it('should update context when useNormalizedKeys state changes', () => {
      // Create a mock with mutable state
      const mockState = { ...mockNormalizedKeyState };
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(mockState);

      const TestComponent = () => {
        const context = useNormalizedKeysContext();
        return <div data-testid="state">{JSON.stringify(context?.activeModifiers.shift)}</div>;
      };

      const { rerender } = render(
        <NormalizedKeysProvider>
          <TestComponent />
        </NormalizedKeysProvider>
      );

      expect(screen.getByTestId('state')).toHaveTextContent('false');

      // Update the mock state
      mockState.activeModifiers = { ...mockState.activeModifiers, shift: true };
      vi.mocked(useNormalizedKeysModule.useNormalizedKeys).mockReturnValue(mockState);

      rerender(
        <NormalizedKeysProvider>
          <TestComponent />
        </NormalizedKeysProvider>
      );

      expect(screen.getByTestId('state')).toHaveTextContent('true');
    });
  });

  describe('useNormalizedKeysContext', () => {
    it('should return null when used outside Provider', () => {
      const { result } = renderHook(() => useNormalizedKeysContext());
      expect(result.current).toBeNull();
    });

    it('should return context value when used inside Provider', () => {
      const { result } = renderHook(() => useNormalizedKeysContext(), {
        wrapper: ({ children }) => (
          <NormalizedKeysProvider>{children}</NormalizedKeysProvider>
        ),
      });

      expect(result.current).not.toBeNull();
      expect(result.current).toEqual(mockNormalizedKeyState);
    });

    it('should have correct TypeScript types', () => {
      const TestComponent = () => {
        const context = useNormalizedKeysContext();
        
        if (context) {
          // These should all be type-safe
          const _lastEvent: typeof context.lastEvent = context.lastEvent;
          const _pressedKeys: typeof context.pressedKeys = context.pressedKeys;
          const _isKeyPressed: typeof context.isKeyPressed = context.isKeyPressed;
          const _activeModifiers: typeof context.activeModifiers = context.activeModifiers;
          const _sequences: typeof context.sequences = context.sequences;
          const _currentHolds: typeof context.currentHolds = context.currentHolds;
        }

        return <div>Type Test</div>;
      };

      expect(() => render(
        <NormalizedKeysProvider>
          <TestComponent />
        </NormalizedKeysProvider>
      )).not.toThrow();
    });
  });

  describe('Provider Configuration', () => {
    it('should handle all configuration options', () => {
      const fullOptions: UseNormalizedKeysOptions = {
        enabled: false,
        debug: true,
        excludeInputFields: false,
        tapHoldThreshold: 500,
        sequences: {
          sequences: [],
          options: {
            orderMatters: true,
            maxSequenceLength: 10,
          },
        },
        preventDefault: true,
      };

      render(
        <NormalizedKeysProvider {...fullOptions}>
          <div>Test</div>
        </NormalizedKeysProvider>
      );

      expect(useNormalizedKeysModule.useNormalizedKeys).toHaveBeenCalledWith(fullOptions);
    });

    it('should work with no options (defaults)', () => {
      render(
        <NormalizedKeysProvider>
          <div>Test</div>
        </NormalizedKeysProvider>
      );

      expect(useNormalizedKeysModule.useNormalizedKeys).toHaveBeenCalledWith({});
    });
  });
});