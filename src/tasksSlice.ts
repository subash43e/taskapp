import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from './Firebase/taskService';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  lastUpdated: 0,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.lastUpdated = Date.now();
      state.error = null;
    },
    
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload); // Add to beginning
      state.lastUpdated = Date.now();
    },
    
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
        state.lastUpdated = Date.now();
      }
    },
    
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    
    setTasksLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setTasksError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearTasks: (state) => {
      state.tasks = [];
      state.lastUpdated = 0;
      state.error = null;
    },
    
    // Force refresh trigger
    triggerTasksRefresh: (state) => {
      state.lastUpdated = Date.now();
    }
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setTasksLoading,
  setTasksError,
  clearTasks,
  triggerTasksRefresh
} = taskSlice.actions;

export default taskSlice.reducer;