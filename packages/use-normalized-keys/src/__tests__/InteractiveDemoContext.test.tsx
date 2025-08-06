import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InteractiveDemo from '../../demo/InteractiveDemo';
import { NormalizedKeysProvider, useHoldSequence } from '../index';

// Mock CSS import
vi.mock('../../demo/InteractiveDemo.css', () => ({}));

describe('InteractiveDemo with Context Provider', () => {
  it('should render successfully when wrapped with NormalizedKeysProvider', () => {
    // Create minimal mock props for rendering
    const mockProps = {
      excludeInputs: true,
      setExcludeInputs: vi.fn(),
      debugMode: false,
      setDebugMode: vi.fn(),
      showSequences: false, // Don't need sequences for basic render test
      setShowSequences: vi.fn(),
      customHoldTime: 500,
      setCustomHoldTime: vi.fn(),
      customSequences: [],
      setCustomSequences: vi.fn(),
      matchedSequences: [],
      sequences: []
    };

    render(
      <NormalizedKeysProvider>
        <InteractiveDemo {...mockProps} />
      </NormalizedKeysProvider>
    );

    expect(screen.getByText('useNormalizedKeys Interactive Demo')).toBeInTheDocument();
  });

  it('should maintain all demo functionality with Provider', () => {
    // Create mock props similar to what DemoApp provides
    const mockProps = {
      excludeInputs: true,
      setExcludeInputs: vi.fn(),
      debugMode: false,
      setDebugMode: vi.fn(),
      showSequences: true,
      setShowSequences: vi.fn(),
      customHoldTime: 500,
      setCustomHoldTime: vi.fn(),
      customSequences: [],
      setCustomSequences: vi.fn(),
      matchedSequences: [],
      sequences: []
    };

    render(
      <NormalizedKeysProvider debug={false} tapHoldThreshold={200}>
        <InteractiveDemo {...mockProps} />
      </NormalizedKeysProvider>
    );

    // Check main sections exist
    expect(screen.getByText('Virtual Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Current State')).toBeInTheDocument();
    expect(screen.getByText('Hold Detection Examples')).toBeInTheDocument();
    expect(screen.getByText('Sequence Detection')).toBeInTheDocument();
  });

  it('should pass configuration options through Provider', () => {
    // Create mock props for testing
    const mockProps = {
      excludeInputs: true,
      setExcludeInputs: vi.fn(),
      debugMode: false,
      setDebugMode: vi.fn(),
      showSequences: false,
      setShowSequences: vi.fn(),
      customHoldTime: 500,
      setCustomHoldTime: vi.fn(),
      customSequences: [],
      setCustomSequences: vi.fn(),
      matchedSequences: [],
      sequences: []
    };

    const { container } = render(
      <NormalizedKeysProvider 
        debug={true}
        tapHoldThreshold={300}
        excludeInputFields={false}
        preventDefault={['Ctrl+S', 'Ctrl+A']}
      >
        <InteractiveDemo {...mockProps} />
      </NormalizedKeysProvider>
    );

    // Check that the demo is rendered with Provider configuration
    expect(container.querySelector('.demo-container')).toBeInTheDocument();
  });

  it('should allow demo to access Context if needed', () => {
    // This test verifies that if the demo were to use helper hooks,
    // they would work correctly with the Provider
    const TestComponent = () => {
      try {
        const holdSequence = useHoldSequence('test');
        return <div data-testid="progress">{holdSequence.progress}</div>;
      } catch (error) {
        return <div data-testid="error">{(error as Error).message}</div>;
      }
    };

    const { rerender } = render(<TestComponent />);
    
    // Without Provider, should show error
    expect(screen.getByTestId('error')).toHaveTextContent('useHoldSequence must be used within a NormalizedKeysProvider');

    // With Provider, should work
    rerender(
      <NormalizedKeysProvider>
        <TestComponent />
      </NormalizedKeysProvider>
    );
    
    expect(screen.getByTestId('progress')).toHaveTextContent('0');
  });

  it('should handle nested component structure with Provider', () => {
    // Create mock props for nested testing
    const mockProps = {
      excludeInputs: true,
      setExcludeInputs: vi.fn(),
      debugMode: false,
      setDebugMode: vi.fn(),
      showSequences: false,
      setShowSequences: vi.fn(),
      customHoldTime: 500,
      setCustomHoldTime: vi.fn(),
      customSequences: [],
      setCustomSequences: vi.fn(),
      matchedSequences: [],
      sequences: []
    };

    const NestedDemo = () => (
      <div>
        <h2>Parent Component</h2>
        <InteractiveDemo {...mockProps} />
      </div>
    );

    render(
      <NormalizedKeysProvider>
        <NestedDemo />
      </NormalizedKeysProvider>
    );

    expect(screen.getByText('Parent Component')).toBeInTheDocument();
    expect(screen.getByText('useNormalizedKeys Interactive Demo')).toBeInTheDocument();
  });
});