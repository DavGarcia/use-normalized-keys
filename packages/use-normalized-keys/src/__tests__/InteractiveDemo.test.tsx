import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import InteractiveDemo from '../../demo/InteractiveDemo';
import { NormalizedKeysProvider } from '../index';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Mock CSS import
vi.mock('../../demo/InteractiveDemo.css', () => ({}));

describe('InteractiveDemo', () => {
  const mockProps = {
    excludeInputs: true,
    setExcludeInputs: vi.fn(),
    debugMode: false,
    setDebugMode: vi.fn(),
    showSequences: true,
    setShowSequences: vi.fn(),
    preventDefault: false,
    setPreventDefault: vi.fn(),
    customHoldTime: 500,
    setCustomHoldTime: vi.fn(),
    customSequences: [],
    setCustomSequences: vi.fn(),
    matchedSequences: [],
    sequences: [],
  };

  const renderWithProvider = (props = mockProps) => {
    return render(
      <NormalizedKeysProvider>
        <InteractiveDemo {...props} />
      </NormalizedKeysProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all main sections', () => {
      renderWithProvider();
      
      expect(screen.getByText('useNormalizedKeys Interactive Demo')).toBeInTheDocument();
      expect(screen.getByText('Virtual Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Current State')).toBeInTheDocument();
      expect(screen.getByText('Event History')).toBeInTheDocument();
      expect(screen.getByText('Sequence Detection')).toBeInTheDocument();
      expect(screen.getByText('Platform-Specific Features')).toBeInTheDocument();
      expect(screen.getByText('Test Input Field')).toBeInTheDocument();
    });

    it('should show preventDefault checkbox control', () => {
      renderWithProvider();
      
      expect(screen.getByText('Prevent Default (Browser shortcuts like F5, Ctrl+S, etc.)')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Prevent Default (Browser shortcuts like F5, Ctrl+S, etc.)' })).toBeInTheDocument();
    });

    it('should display platform information', () => {
      renderWithProvider();
      
      expect(screen.getAllByText(/Platform:/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Events:/)[0]).toBeInTheDocument();
      expect(screen.getByText(/Avg Processing:/)).toBeInTheDocument();
      expect(screen.getByText(/Pressed Keys \(\d+\)/)).toBeInTheDocument();
    });

    it('should render virtual keyboard with keys', () => {
      renderWithProvider();
      
      // Check for some common keys
      expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Space' })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Enter' })).toHaveLength(2); // Main keyboard + numpad
      expect(screen.getAllByRole('button', { name: 'Shift' })).toHaveLength(2); // Left and right shift
      expect(screen.getAllByRole('button', { name: 'Control' })).toHaveLength(2); // Left and right control
    });

    it('should render numpad section', () => {
      renderWithProvider();
      
      expect(screen.getByText('Numpad')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: '0' })).toHaveLength(2); // Main keyboard + numpad (single wide 0)
      expect(screen.getAllByRole('button', { name: '1' })).toHaveLength(2); // Main keyboard + numpad
      expect(screen.getAllByRole('button', { name: '+' })).toHaveLength(1); // One + key in numpad (tall)
    });
  });

  describe('Control Toggles', () => {
    it('should show exclude input fields checkbox with correct state', () => {
      renderWithProvider();
      
      const checkbox = screen.getByRole('checkbox', { name: 'Exclude Input Fields' });
      expect(checkbox).toBeChecked(); // Default true
    });

    it('should show debug mode checkbox with correct state', () => {
      renderWithProvider();
      
      const checkbox = screen.getByRole('checkbox', { name: 'Debug Mode' });
      expect(checkbox).not.toBeChecked(); // Default false
    });

    it('should show sequence detection checkbox with correct state', () => {
      renderWithProvider();
      
      const checkbox = screen.getByRole('checkbox', { name: 'Enable Sequences' });
      expect(checkbox).toBeChecked(); // Default true
    });

    it('should show prevent default checkbox with correct state', () => {
      renderWithProvider();
      
      const checkbox = screen.getByRole('checkbox', { name: 'Prevent Default (Browser shortcuts like F5, Ctrl+S, etc.)' });
      expect(checkbox).not.toBeChecked(); // Default false
    });

    it('should call state setters when checkboxes are clicked', () => {
      const mockSetExcludeInputs = vi.fn();
      const mockSetDebugMode = vi.fn();
      const mockSetShowSequences = vi.fn();
      const mockSetPreventDefault = vi.fn();
      
      renderWithProvider({
        ...mockProps,
        setExcludeInputs: mockSetExcludeInputs,
        setDebugMode: mockSetDebugMode,
        setShowSequences: mockSetShowSequences,
        setPreventDefault: mockSetPreventDefault,
      });
      
      fireEvent.click(screen.getByRole('checkbox', { name: 'Exclude Input Fields' }));
      expect(mockSetExcludeInputs).toHaveBeenCalled();
      
      fireEvent.click(screen.getByRole('checkbox', { name: 'Debug Mode' }));
      expect(mockSetDebugMode).toHaveBeenCalled();
      
      fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Sequences' }));
      expect(mockSetShowSequences).toHaveBeenCalled();
      
      fireEvent.click(screen.getByRole('checkbox', { name: 'Prevent Default (Browser shortcuts like F5, Ctrl+S, etc.)' }));
      expect(mockSetPreventDefault).toHaveBeenCalled();
    });
  });

  describe('State Display Elements', () => {
    it('should show active modifiers section', () => {
      renderWithProvider();
      
      expect(screen.getByText('Active Modifiers')).toBeInTheDocument();
      expect(screen.getByText('shift')).toBeInTheDocument();
      expect(screen.getByText('ctrl')).toBeInTheDocument();
      expect(screen.getByText('alt')).toBeInTheDocument();
      expect(screen.getByText('meta')).toBeInTheDocument();
    });

    it('should show last event section with initial state', () => {
      renderWithProvider();
      
      expect(screen.getByText('Last Event')).toBeInTheDocument();
      expect(screen.getByText('Press any key to start')).toBeInTheDocument();
    });

    it('should show pressed keys section with initial state', () => {
      renderWithProvider();
      
      expect(screen.getByText(/Pressed Keys \(0\)/)).toBeInTheDocument();
      expect(screen.getByText('No keys pressed')).toBeInTheDocument();
    });
  });

  describe('Event History Controls', () => {
    it('should have copy and clear buttons', () => {
      renderWithProvider();
      
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
    });

    it('should show initial empty history state', () => {
      renderWithProvider();
      
      expect(screen.getByText('No events yet')).toBeInTheDocument();
    });

    it('should call clipboard API when copy button is clicked', async () => {
      renderWithProvider();
      
      const copyButton = screen.getByRole('button', { name: /Copy/i });
      
      await act(async () => {
        fireEvent.click(copyButton);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Sequence Detection UI', () => {
    it('should show available sequences when enabled', () => {
      renderWithProvider();
      
      expect(screen.getByText('Available Sequences')).toBeInTheDocument();
      // Since sequences prop is empty in mockProps, we just check the section exists
      // In a real scenario, these would be populated by the parent component
    });

    it('should have sequence type display structure', () => {
      renderWithProvider();
      
      // Check that the sequence list structure exists
      // Since we pass empty sequences array, we won't find specific types
      expect(screen.getByText('Available Sequences')).toBeInTheDocument();
    });

    it('should have sequence recording controls', () => {
      renderWithProvider();
      
      expect(screen.getByRole('button', { name: 'Record Custom Sequence' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Custom Sequences' })).toBeInTheDocument();
    });

    it('should toggle recording state when record button is clicked', () => {
      renderWithProvider();
      
      const recordButton = screen.getByRole('button', { name: 'Record Custom Sequence' });
      
      act(() => {
        fireEvent.click(recordButton);
      });
      
      expect(screen.getByRole('button', { name: /Stop Recording \(0 keys\)/ })).toBeInTheDocument();
    });

    it('should show matched sequences section', () => {
      renderWithProvider();
      
      expect(screen.getByText('Matched Sequences')).toBeInTheDocument();
      expect(screen.getByText('No sequences matched yet')).toBeInTheDocument();
    });
  });

  describe('Platform-Specific Features Section', () => {
    it('should show platform quirks information', () => {
      renderWithProvider();
      
      expect(screen.getByText('Platform-Specific Features')).toBeInTheDocument();
      expect(screen.getByText('Modifier Tap vs Hold')).toBeInTheDocument();
      expect(screen.getByText('NumLock State Detection')).toBeInTheDocument();
    });

    it('should show tap vs hold threshold information', () => {
      renderWithProvider();
      
      expect(screen.getByText(/threshold: 200ms/)).toBeInTheDocument();
    });
  });

  describe('Input Fields', () => {
    it('should show correct placeholder text based on exclude setting', () => {
      // Test with exclude enabled (default)
      renderWithProvider();
      expect(screen.getByPlaceholderText("Keys won't be captured while typing here")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Keyboard events excluded in textareas too')).toBeInTheDocument();
    });

    it('should show different placeholder text when exclude is disabled', () => {
      // Test with exclude disabled
      renderWithProvider({
        ...mockProps,
        excludeInputs: false,
      });
      expect(screen.getByPlaceholderText('Keys will still be captured')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Keyboard events still captured')).toBeInTheDocument();
    });

    it('should have input and textarea elements', () => {
      renderWithProvider();
      
      // Check for input and textarea by placeholder text since they don't have explicit labels
      expect(screen.getByPlaceholderText(/Keys won't be captured while typing here/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Keyboard events excluded in textareas too/)).toBeInTheDocument();
    });
  });

  describe('Visual Feedback Elements', () => {
    it('should have appropriate CSS classes for visual feedback', () => {
      renderWithProvider();
      
      // Check for key elements with expected classes
      const keyboard = screen.getByText('Virtual Keyboard').closest('.keyboard-section');
      expect(keyboard).toHaveClass('demo-section');
      
      const eventHistory = screen.getByText('Event History').closest('.history-section');
      expect(eventHistory).toHaveClass('demo-section');
      
      const stateSection = screen.getByText('Current State').closest('.state-section');
      expect(stateSection).toHaveClass('demo-section');
    });

    it('should show performance metrics in info bar', () => {
      renderWithProvider();
      
      // Check that the metrics labels are present (using getAllByText since they appear twice)
      expect(screen.getAllByText('Events:')[0]).toBeInTheDocument();
      expect(screen.getByText('Avg Processing:')).toBeInTheDocument();
      expect(screen.getByText(/Pressed Keys \(\d+\)/)).toBeInTheDocument();
      
      // Check that metrics have initial values
      const infoItem = screen.getAllByText('Events:')[0].closest('.info-item');
      expect(infoItem).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should show React version and debug information', () => {
      renderWithProvider();
      
      expect(screen.getByText(/Built with React/)).toBeInTheDocument();
      expect(screen.getByText(/Check console for debug output when debug mode is enabled/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProvider();
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for checkbox roles
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4); // Exclude, Debug, Sequences, Prevent Default
      
      // Check that we have text inputs
      const testInput = screen.getByPlaceholderText(/Keys won't be captured while typing here/);
      const testTextarea = screen.getByPlaceholderText(/Keyboard events excluded in textareas too/);
      expect(testInput).toBeInTheDocument();
      expect(testTextarea).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderWithProvider();
      
      // Main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Section headings
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);
      
      // Subsection headings
      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBeGreaterThan(0);
    });
  });
});