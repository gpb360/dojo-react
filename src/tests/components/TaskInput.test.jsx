import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskInput from '../../app/modules/components/TaskInput';

describe('TaskInput Component', () => {
  test('renders input and button', () => {
    render(<TaskInput onAddTask={() => {}} />);
    
    expect(screen.getByPlaceholderText('Enter a task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  test('calls onAddTask when form is submitted with input value', async () => {
    const mockAddTask = jest.fn();
    render(<TaskInput onAddTask={mockAddTask} />);
    
    const input = screen.getByPlaceholderText('Enter a task');
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    // Type in the input
    await userEvent.type(input, 'New test task');
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Check if onAddTask was called with the input value
    expect(mockAddTask).toHaveBeenCalledWith('New test task');
    
    // Check if input was cleared after submission
    expect(input).toHaveValue('');
  });

  test('does not call onAddTask when submitting empty input', async () => {
    const mockAddTask = jest.fn();
    render(<TaskInput onAddTask={mockAddTask} />);
    
    const submitButton = screen.getByRole('button', { name: /add task/i });
    
    // Submit the form without typing anything
    fireEvent.click(submitButton);
    
    // Check onAddTask was not called
    expect(mockAddTask).not.toHaveBeenCalled();
  });
}); 