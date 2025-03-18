const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const DojoButtonAdapter = require('../../app/modules/adapters/DojoButtonAdapter').default;

// Mock the DojoUtils module
jest.mock('../../app/modules/adapters/DojoUtils', () => ({
  ensureDojo: jest.fn().mockResolvedValue(true),
  safeDestroyWidget: jest.fn()
}));

// Basic test without complex mocks - focusing on the fallback UI
describe('DojoButtonAdapter Component', () => {
  test('renders fallback button with correct label', () => {
    render(<DojoButtonAdapter label="Test Button" />);
    
    // Should show the button with the correct label
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
  });
  
  test('calls onClick when fallback button is clicked', () => {
    const handleClick = jest.fn();
    render(<DojoButtonAdapter label="Click Me" onClick={handleClick} />);
    
    // Get the button and click it
    const button = screen.getByRole('button', { name: 'Click Me' });
    fireEvent.click(button);
    
    // Check if onClick was called
    expect(handleClick).toHaveBeenCalled();
  });
  
  test('respects disabled prop when set to true', () => {
    render(<DojoButtonAdapter label="Disabled Button" disabled={true} />);
    
    // Get the button and check if it's disabled
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
  });
}); 