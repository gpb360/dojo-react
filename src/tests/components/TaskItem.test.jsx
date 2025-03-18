import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../../app/modules/components/TaskItem';

// Mock the Dojo adapter since we want to test in isolation
jest.mock('../../app/modules/adapters/DojoCheckboxAdapter', () => {
  return function MockDojoCheckboxAdapter({ checked, onChange }) {
    return (
      <input 
        type="checkbox" 
        data-testid="dojo-checkbox" 
        checked={checked} 
        onChange={() => onChange(!checked)} 
      />
    );
  };
});

describe('TaskItem Component', () => {
  const mockTask = {
    id: '123',
    text: 'Test Task',
    completed: false
  };
  
  test('renders task with React checkbox when useDojo is false', () => {
    const mockDelete = jest.fn();
    render(<TaskItem task={mockTask} onDelete={mockDelete} useDojo={false} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    
    // Check if the style is applied correctly for non-completed task
    const taskText = screen.getByText('Test Task');
    expect(taskText).toHaveStyle('text-decoration: none');
  });
  
  test('renders task with Dojo checkbox when useDojo is true', () => {
    const mockDelete = jest.fn();
    render(<TaskItem task={mockTask} onDelete={mockDelete} useDojo={true} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByTestId('dojo-checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
  
  test('toggles completion state when checkbox is clicked', () => {
    const mockDelete = jest.fn();
    render(<TaskItem task={mockTask} onDelete={mockDelete} useDojo={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    const taskText = screen.getByText('Test Task');
    
    // Initial state - not completed
    expect(checkbox).not.toBeChecked();
    expect(taskText).toHaveStyle('text-decoration: none');
    
    // Toggle completion
    fireEvent.click(checkbox);
    
    // After toggle - should be completed
    expect(checkbox).toBeChecked();
    expect(taskText).toHaveStyle('text-decoration: line-through');
  });
  
  test('calls onDelete when delete button is clicked', () => {
    const mockDelete = jest.fn();
    render(<TaskItem task={mockTask} onDelete={mockDelete} useDojo={false} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    
    // Click delete button
    fireEvent.click(deleteButton);
    
    // Verify onDelete was called with the task id
    expect(mockDelete).toHaveBeenCalledWith('123');
  });
  
  test('initializes with completed state if task is completed', () => {
    const completedTask = {
      id: '456',
      text: 'Completed Task',
      completed: true
    };
    
    const mockDelete = jest.fn();
    render(<TaskItem task={completedTask} onDelete={mockDelete} useDojo={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    const taskText = screen.getByText('Completed Task');
    
    // Should be initialized as completed
    expect(checkbox).toBeChecked();
    expect(taskText).toHaveStyle('text-decoration: line-through');
  });
}); 