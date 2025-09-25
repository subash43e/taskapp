import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { signOut } from 'firebase/auth';
import { auth } from './Firebase/firebase';
import { formatAuthError } from './utils/authErrors';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, clearError, logout } = authSlice.actions;

// Thunk for logout
export const logoutUser = () => async (dispatch: any) => {
  try {
    await signOut(auth);
    dispatch(logout());
  } catch (error: any) {
    const formattedError = formatAuthError(error);
    dispatch(setError(formattedError));
  }
};

export default authSlice.reducer;