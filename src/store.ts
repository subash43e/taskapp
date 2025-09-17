import { configureStore, createSlice } from '@reduxjs/toolkit';

// Example: UI state for sidebar size
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarSize: 180,
    isResizing: false,
    startX: 0,
    startWidth: 180,
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
  },
});

export const { setSidebarSize, setIsResizing, setStartX, setStartWidth } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
