import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PureReactTaskList from '../../app/modules/components/PureReactTaskList';

describe('PureReactTaskList Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders the task list header and input form', () => {
    render(<PureReactTaskList />);
    
    // Header elements
    expect(screen.getByText('Task List')).toBeInTheDocument();
    expect(screen.getByText('Pure React Implementation')).toBeInTheDocument();
    
    // Input form elements
    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('displays empty state message when no tasks exist', () => {
    render(<PureReactTaskList />);
    
    expect(screen.getByText('No tasks yet!')).toBeInTheDocument();
    expect(screen.getByText('Add a task to get started.')).toBeInTheDocument();
  });

  test('allows adding a new task', async () => {
    render(<PureReactTaskList />);
    
    // Get the input and button
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: /add/i });
    
    // Type in the task and add it
    await userEvent.type(input, 'New test task');
    fireEvent.click(addButton);
    
    // Check if task was added
    expect(screen.getByText('New test task')).toBeInTheDocument();
    
    // Input should be cleared
    expect(input).toHaveValue('');
    
    // No empty state should be shown
    expect(screen.queryByText('No tasks yet!')).not.toBeInTheDocument();
  });

  test('allows completing a task', async () => {
    render(<PureReactTaskList />);
    
    // Add a task first
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await userEvent.type(input, 'Task to complete');
    fireEvent.click(addButton);
    
    // Find the task checkbox
    const taskItem = screen.getByText('Task to complete').closest('li');
    const checkbox = within(taskItem).getByRole('checkbox');
    
    // Check the task as completed
    fireEvent.click(checkbox);
    
    // Verify it's checked
    expect(checkbox).toBeChecked();
  });

  test('allows deleting a task', async () => {
    render(<PureReactTaskList />);
    
    // Add a task first
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await userEvent.type(input, 'Task to delete');
    fireEvent.click(addButton);
    
    // Find the delete button
    const taskItem = screen.getByText('Task to delete').closest('li');
    const deleteButton = within(taskItem).getByRole('button', { name: /delete/i });
    
    // Delete the task
    fireEvent.click(deleteButton);
    
    // Verify task is removed
    expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
    
    // Empty state should be shown again
    expect(screen.getByText('No tasks yet!')).toBeInTheDocument();
  });

  test('persists tasks to localStorage', async () => {
    // First render to add task
    const { unmount } = render(<PureReactTaskList />);
    
    // Add a task
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await userEvent.type(input, 'Persistent task');
    fireEvent.click(addButton);
    
    // Unmount and remount component
    unmount();
    render(<PureReactTaskList />);
    
    // Task should still be there from localStorage
    expect(screen.getByText('Persistent task')).toBeInTheDocument();
  });
}); 