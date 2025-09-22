import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseMessagingService from '../../services/firebaseMessaging';

// Async thunk to initialize FCM
export const initializeFCM = createAsyncThunk(
  'notification/initializeFCM',
  async (_, { rejectWithValue }) => {
    try {
      const token = await firebaseMessagingService.initialize();
      return { token, initialized: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get FCM token
export const getFCMToken = createAsyncThunk(
  'notification/getFCMToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await firebaseMessagingService.getCurrentToken();
      if (!token) {
        const newToken = await firebaseMessagingService.refreshToken();
        return newToken;
      }
      return token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  fcmToken: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  permissionGranted: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Set permission status
    setPermissionStatus: (state, action) => {
      state.permissionGranted = action.payload;
    },

    // Set FCM token
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize FCM
      .addCase(initializeFCM.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeFCM.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.fcmToken = action.payload.token;
        state.permissionGranted = true;
      })
      .addCase(initializeFCM.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.permissionGranted = false;
      })

      // Get FCM Token
      .addCase(getFCMToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFCMToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fcmToken = action.payload;
      })
      .addCase(getFCMToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPermissionStatus,
  setFCMToken,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
