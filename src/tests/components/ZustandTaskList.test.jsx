import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ZustandTaskList from '../../app/modules/components/ZustandTaskList.jsx';
import useTaskStore from '../../app/stores/useTaskStore';

// Create a reset function to clear the store between tests
const resetStore = () => {
  useTaskStore.setState({ 
    tasks: [],
    loadTasks: jest.fn(),
    addTask: useTaskStore.getState().addTask,
    deleteTask: useTaskStore.getState().deleteTask,
    toggleTask: useTaskStore.getState().toggleTask,
    saveTasks: jest.fn()
  });
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ZustandTaskList Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetStore();
  });

  test('renders the task list with header', () => {
    render(<ZustandTaskList />);
    
    expect(screen.getByText('Tasks (Zustand)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  test('shows empty state when no tasks', () => {
    render(<ZustandTaskList />);
    
    expect(screen.getByText('No tasks added yet. Add your first task above!')).toBeInTheDocument();
  });

  test('can add a new task', async () => {
    const user = userEvent.setup();
    render(<ZustandTaskList />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'New Task{enter}');
    
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('task(s)')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  test('can add multiple tasks', async () => {
    const user = userEvent.setup();
    render(<ZustandTaskList />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Task 1{enter}');
    await user.type(input, 'Task 2{enter}');
    await user.type(input, 'Task 3{enter}');
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('task(s)')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  test('can toggle task completion', async () => {
    const user = userEvent.setup();
    render(<ZustandTaskList />);
    
    // Add a task
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Toggle Task{enter}');
    
    // Complete the task
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('task(s)')).toBeInTheDocument();
    expect(screen.getByText('1', { selector: 'span:last-child > :first-child' })).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    
    // Uncomplete the task
    await user.click(checkbox);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('task(s)')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  test('can delete a task', async () => {
    const user = userEvent.setup();
    render(<ZustandTaskList />);
    
    // Add a task
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Delete Me{enter}');
    
    // Delete the task
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);
    
    expect(screen.queryByText('Delete Me')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks added yet. Add your first task above!')).toBeInTheDocument();
  });

  test('loads tasks from store on mount', async () => {
    // Manually set initial tasks in the store
    useTaskStore.setState({
      tasks: [{ id: '1', text: 'Preloaded Task', completed: false }]
    });
    
    render(<ZustandTaskList />);
    
    expect(screen.getByText('Preloaded Task')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('task(s)')).toBeInTheDocument();
  });
}); 