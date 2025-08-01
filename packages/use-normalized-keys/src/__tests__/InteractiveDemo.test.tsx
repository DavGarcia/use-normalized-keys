import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InteractiveDemo from '../../demo/InteractiveDemo';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

describe('InteractiveDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all main sections', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('useNormalizedKeys Interactive Demo')).toBeInTheDocument();
      expect(screen.getByText('Virtual Keyboard')).toBeInTheDocument();
      expect(screen.getByText('Current State')).toBeInTheDocument();
      expect(screen.getByText('Event History')).toBeInTheDocument();
      expect(screen.getByText('Sequence Detection')).toBeInTheDocument();
      expect(screen.getByText('Platform-Specific Features')).toBeInTheDocument();
      expect(screen.getByText('Test Input Field')).toBeInTheDocument();
    });

    it('should show preventDefault status indicator', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('preventDefault:')).toBeInTheDocument();
      expect(screen.getByText('✓ Enabled')).toBeInTheDocument();
      expect(screen.getByText('(Browser shortcuts like F5, Ctrl+S, etc. are prevented)')).toBeInTheDocument();
    });

    it('should display platform information', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText(/Platform:/)).toBeInTheDocument();
      expect(screen.getByText(/Events:/)).toBeInTheDocument();
      expect(screen.getByText(/Avg Process:/)).toBeInTheDocument();
      expect(screen.getByText(/Pressed Keys:/)).toBeInTheDocument();
    });

    it('should render virtual keyboard with keys', () => {
      render(<InteractiveDemo />);
      
      // Check for some common keys
      expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Space' })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Enter' })).toHaveLength(3); // Main keyboard + numpad entries
      expect(screen.getAllByRole('button', { name: 'Shift' })).toHaveLength(2); // Left and right shift
      expect(screen.getAllByRole('button', { name: 'Control' })).toHaveLength(2); // Left and right control
    });

    it('should render numpad section', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Numpad')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: '0' })).toHaveLength(3); // Main keyboard + numpad (double 0)
      expect(screen.getAllByRole('button', { name: '1' })).toHaveLength(2); // Main keyboard + numpad
      expect(screen.getAllByRole('button', { name: '+' })).toHaveLength(2); // Two + keys in numpad
    });
  });

  describe('Control Toggles', () => {
    it('should toggle exclude input fields option', () => {
      render(<InteractiveDemo />);
      
      const checkbox = screen.getByRole('checkbox', { name: 'Exclude Input Fields' });
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle debug mode option', () => {
      render(<InteractiveDemo />);
      
      const checkbox = screen.getByRole('checkbox', { name: 'Debug Mode' });
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle sequence detection option', () => {
      render(<InteractiveDemo />);
      
      const checkbox = screen.getByRole('checkbox', { name: 'Enable Sequences' });
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      
      // Sequence section should be hidden when disabled
      expect(screen.queryByText('Sequence Detection')).not.toBeInTheDocument();
    });
  });

  describe('State Display Elements', () => {
    it('should show active modifiers section', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Active Modifiers')).toBeInTheDocument();
      expect(screen.getByText('shift')).toBeInTheDocument();
      expect(screen.getByText('ctrl')).toBeInTheDocument();
      expect(screen.getByText('alt')).toBeInTheDocument();
      expect(screen.getByText('meta')).toBeInTheDocument();
    });

    it('should show last event section with initial state', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Last Event')).toBeInTheDocument();
      expect(screen.getByText('Press any key to start')).toBeInTheDocument();
    });

    it('should show pressed keys section with initial state', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText(/Pressed Keys \(0\)/)).toBeInTheDocument();
      expect(screen.getByText('No keys pressed')).toBeInTheDocument();
    });
  });

  describe('Event History Controls', () => {
    it('should have copy and clear buttons', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
    });

    it('should show initial empty history state', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('No events yet')).toBeInTheDocument();
    });

    it('should call clipboard API when copy button is clicked', () => {
      render(<InteractiveDemo />);
      
      const copyButton = screen.getByRole('button', { name: /Copy/i });
      
      act(() => {
        fireEvent.click(copyButton);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Sequence Detection UI', () => {
    it('should show available sequences when enabled', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Available Sequences')).toBeInTheDocument();
      expect(screen.getByText('Konami Code:')).toBeInTheDocument();
      expect(screen.getByText('Save (Ctrl+S):')).toBeInTheDocument();
      expect(screen.getByText('Vim Escape (jk):')).toBeInTheDocument();
      expect(screen.getByText('Type "hello":')).toBeInTheDocument();
    });

    it('should show sequence types correctly', () => {
      render(<InteractiveDemo />);
      
      // Check for sequence type badges
      const sequenceTypes = screen.getAllByText('sequence');
      expect(sequenceTypes.length).toBeGreaterThan(0);
      
      const chordTypes = screen.getAllByText('chord');
      expect(chordTypes.length).toBeGreaterThan(0);
      
      const holdTypes = screen.getAllByText('hold');
      expect(holdTypes.length).toBeGreaterThan(0);
    });

    it('should have sequence recording controls', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByRole('button', { name: 'Record Custom Sequence' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Sequences' })).toBeInTheDocument();
    });

    it('should toggle recording state when record button is clicked', () => {
      render(<InteractiveDemo />);
      
      const recordButton = screen.getByRole('button', { name: 'Record Custom Sequence' });
      
      act(() => {
        fireEvent.click(recordButton);
      });
      
      expect(screen.getByRole('button', { name: /Stop Recording \(0 keys\)/ })).toBeInTheDocument();
    });

    it('should show matched sequences section', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Matched Sequences')).toBeInTheDocument();
      expect(screen.getByText('Try typing one of the sequences above!')).toBeInTheDocument();
    });
  });

  describe('Platform-Specific Features Section', () => {
    it('should show platform quirks information', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText('Platform-Specific Features')).toBeInTheDocument();
      expect(screen.getByText('Modifier Tap vs Hold')).toBeInTheDocument();
      expect(screen.getByText('NumLock State Detection')).toBeInTheDocument();
    });

    it('should show tap vs hold threshold information', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText(/threshold: 200ms/)).toBeInTheDocument();
    });
  });

  describe('Input Fields', () => {
    it('should show correct placeholder text based on exclude setting', () => {
      render(<InteractiveDemo />);
      
      // With exclude enabled (default)
      expect(screen.getByPlaceholderText('Keys typed here are NOT tracked')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Text area input is NOT tracked')).toBeInTheDocument();
      
      // Disable exclude
      const checkbox = screen.getByRole('checkbox', { name: 'Exclude Input Fields' });
      fireEvent.click(checkbox);
      
      expect(screen.getByPlaceholderText('Keys typed here ARE tracked')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Text area input IS tracked')).toBeInTheDocument();
    });

    it('should have input and textarea elements', () => {
      render(<InteractiveDemo />);
      
      // Check for input and textarea by placeholder text since they don't have explicit labels
      expect(screen.getByPlaceholderText(/Keys typed here are NOT tracked/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Text area input is NOT tracked/)).toBeInTheDocument();
    });
  });

  describe('Visual Feedback Elements', () => {
    it('should have appropriate CSS classes for visual feedback', () => {
      render(<InteractiveDemo />);
      
      // Check for key elements with expected classes
      const keyboard = screen.getByText('Virtual Keyboard').closest('.keyboard-section');
      expect(keyboard).toHaveClass('demo-section');
      
      const eventHistory = screen.getByText('Event History').closest('.history-section');
      expect(eventHistory).toHaveClass('demo-section');
      
      const stateSection = screen.getByText('Current State').closest('.state-section');
      expect(stateSection).toHaveClass('demo-section');
    });

    it('should show performance metrics in info bar', () => {
      render(<InteractiveDemo />);
      
      // Check that the metrics labels are present
      expect(screen.getByText('Events:')).toBeInTheDocument();
      expect(screen.getByText('Avg Process:')).toBeInTheDocument();
      expect(screen.getByText('Pressed Keys:')).toBeInTheDocument();
      
      // Check that metrics have initial values
      const infoBar = screen.getByText('Events:').closest('.demo-info-bar');
      expect(infoBar).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should show React version and debug information', () => {
      render(<InteractiveDemo />);
      
      expect(screen.getByText(/Built with React/)).toBeInTheDocument();
      expect(screen.getByText(/Check console for debug output when debug mode is enabled/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<InteractiveDemo />);
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for checkbox roles
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4); // Exclude, Debug, Sequences, Show Debug Panel
      
      // Check that we have text inputs
      const testInput = screen.getByPlaceholderText(/Keys typed here are NOT tracked/);
      const testTextarea = screen.getByPlaceholderText(/Text area input is NOT tracked/);
      expect(testInput).toBeInTheDocument();
      expect(testTextarea).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<InteractiveDemo />);
      
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