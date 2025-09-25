import { createSlice } from '@reduxjs/toolkit';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

const initialState: NotificationState = {
  message: '',
  type: 'info',
  show: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
      state.show = true;
    },
    hideNotification: (state) => {
      state.show = false;
    },
    clearNotification: (state) => {
      state.message = '';
      state.type = 'info';
      state.show = false;
    },
  },
});

export const { showNotification, hideNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;