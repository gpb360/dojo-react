import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DojoButtonAdapter from '../../app/modules/adapters/DojoButtonAdapter';
import { ensureDojo } from '../../app/modules/adapters/DojoUtils';

// Mock the DojoUtils module
jest.mock('../../app/modules/adapters/DojoUtils', () => ({
  ensureDojo: jest.fn().mockResolvedValue(true),
  safeDestroyWidget: jest.fn()
}));

describe('DojoButtonAdapter Component', () => {
  let mockButton;
  let dojoRequireMock;

  beforeEach(() => {
    // Create a mock Button implementation
    mockButton = {
      startup: jest.fn(),
      set: jest.fn(),
      on: jest.fn(),
      destroy: jest.fn()
    };

    // Create a mock for the dojoRequire function
    dojoRequireMock = jest.fn((modules, callback) => {
      // Simulate loading dijit/form/Button
      callback(function MockButton(props) {
        Object.assign(this, mockButton, props);
        return this;
      });
    });

    // Add the mock to the window
    window.dojoRequire = dojoRequireMock;
  });

  afterEach(() => {
    // Clean up
    jest.clearAllMocks();
  });

  test('renders fallback button initially', () => {
    render(<DojoButtonAdapter label="Test Button" />);
    
    // Should show the fallback button first
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toHaveClass('dojo-fallback-button');
  });

  test('initializes Dojo button when ensureDojo resolves', async () => {
    const handleClick = jest.fn();
    
    render(<DojoButtonAdapter 
      label="Dojo Button" 
      onClick={handleClick} 
      disabled={false} 
    />);
    
    // Wait for dojoRequire to be called
    await waitFor(() => {
      expect(ensureDojo).toHaveBeenCalled();
      expect(dojoRequireMock).toHaveBeenCalledWith(
        ['dijit/form/Button'], 
        expect.any(Function)
      );
    });
    
    // Check that the button was created
    expect(mockButton.startup).toHaveBeenCalled();
    
    // Check that label was set
    expect(mockButton.set).toHaveBeenCalledWith('label', 'Dojo Button');
    
    // Check that disabled state was set
    expect(mockButton.set).toHaveBeenCalledWith('disabled', false);
    
    // Check that the click handler was connected
    expect(mockButton.on).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('updates button props when they change', async () => {
    const { rerender } = render(
      <DojoButtonAdapter label="Initial Label" disabled={false} />
    );
    
    // Wait for initialization
    await waitFor(() => {
      expect(ensureDojo).toHaveBeenCalled();
    });
    
    // Update props
    rerender(<DojoButtonAdapter label="Updated Label" disabled={true} />);
    
    // Check that props were updated
    expect(mockButton.set).toHaveBeenCalledWith('label', 'Updated Label');
    expect(mockButton.set).toHaveBeenCalledWith('disabled', true);
  });

  test('cleans up the widget on unmount', async () => {
    const { unmount } = render(<DojoButtonAdapter label="Test Button" />);
    
    // Wait for initialization
    await waitFor(() => {
      expect(ensureDojo).toHaveBeenCalled();
    });
    
    // Unmount the component
    unmount();
    
    // Check that the widget was properly destroyed
    await waitFor(() => {
      expect(mockButton.destroy).toHaveBeenCalled();
    });
  });
}); 