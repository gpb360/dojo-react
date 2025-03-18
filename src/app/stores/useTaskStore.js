import { create } from 'zustand';

/**
 * Task store using Zustand
 * This demonstrates how to manage state centrally in a more modern way
 * compared to component-level useState hooks
 */
const useTaskStore = create((set, get) => ({
  // Initial state
  tasks: [],
  completedTaskIds: new Set(),
  
  // Actions
  
  // Load tasks from localStorage
  loadTasks: () => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      const savedCompletedIds = localStorage.getItem('completedTaskIds');
      
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        set({ tasks });
      }
      
      if (savedCompletedIds) {
        const completedArray = JSON.parse(savedCompletedIds);
        set({ completedTaskIds: new Set(completedArray) });
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
    }
  },
  
  // Save current state to localStorage
  saveTasks: () => {
    try {
      const { tasks, completedTaskIds } = get();
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('completedTaskIds', JSON.stringify([...completedTaskIds]));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  },
  
  // Add a new task
  addTask: (text) => {
    if (!text.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date()
    };
    
    set(state => {
      const newState = { 
        tasks: [...state.tasks, newTask]
      };
      return newState;
    });
    
    // Save to localStorage after state update
    setTimeout(() => get().saveTasks(), 0);
  },
  
  // Delete a task
  deleteTask: (taskId) => {
    set(state => {
      // Remove the task
      const tasks = state.tasks.filter(task => task.id !== taskId);
      
      // Also remove from completedTaskIds if it exists
      const completedTaskIds = new Set(state.completedTaskIds);
      if (completedTaskIds.has(taskId)) {
        completedTaskIds.delete(taskId);
      }
      
      return { tasks, completedTaskIds };
    });
    
    // Save to localStorage after state update
    setTimeout(() => get().saveTasks(), 0);
  },
  
  // Toggle task completion state
  toggleTaskCompletion: (taskId) => {
    set(state => {
      const completedTaskIds = new Set(state.completedTaskIds);
      
      if (completedTaskIds.has(taskId)) {
        completedTaskIds.delete(taskId);
      } else {
        completedTaskIds.add(taskId);
      }
      
      return { completedTaskIds };
    });
    
    // Save to localStorage after state update
    setTimeout(() => get().saveTasks(), 0);
  },
  
  // Get sorted tasks (completed at bottom, then by creation date)
  getSortedTasks: () => {
    const { tasks, completedTaskIds } = get();
    
    return [...tasks].sort((a, b) => {
      // Completed tasks at the bottom
      const aCompleted = completedTaskIds.has(a.id);
      const bCompleted = completedTaskIds.has(b.id);
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // Otherwise sort by creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  }
}));

export default useTaskStore; 