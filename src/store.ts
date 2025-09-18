import { configureStore, createSlice } from '@reduxjs/toolkit';
import taskCreationReducer from './taskCreationSlice';

// Example: UI state for sidebar size
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarSize: 180,
    isResizing: false,
    startX: 0,
    startWidth: 180,
    showTaskCreation: false,
  },
  reducers: {
    setSidebarSize(state, action) {
      state.sidebarSize = action.payload;
    },
    setIsResizing(state, action) {
      state.isResizing = action.payload;
    },
    setStartX(state, action) {
      state.startX = action.payload;
    },
    setStartWidth(state, action) {
      state.startWidth = action.payload;
    },
    showTaskCreation(state) {
      state.showTaskCreation = true;
    },
    hideTaskCreation(state) {
      state.showTaskCreation = false;
    },
    toggleTaskCreation(state) {
      state.showTaskCreation = !state.showTaskCreation;
    },
  },
});

export const { setSidebarSize, setIsResizing, setStartX, setStartWidth, showTaskCreation, hideTaskCreation, toggleTaskCreation } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    taskCreation: taskCreationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
