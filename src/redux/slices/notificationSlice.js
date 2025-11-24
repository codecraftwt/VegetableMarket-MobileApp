import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseMessagingService from '../../services/firebaseMessaging';
import axiosInstance from '../../api/axiosInstance';

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

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return { notificationId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to send test notification (for testing purposes)
export const sendTestNotification = createAsyncThunk(
  'notification/sendTestNotification',
  async (notificationData, { rejectWithValue }) => {
    try {      
      // For now, we'll just add it to local state
      // In a real app, this would send to your backend which would then send FCM
      const testNotification = {
        id: Date.now(),
        title: notificationData.title || 'Test Notification',
        message: notificationData.message || 'This is a test notification',
        type: notificationData.type || 'test',
        is_read: false,
        created_at: new Date().toISOString(),
        ...notificationData
      };
      
      return testNotification;
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
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
  markAsReadLoading: false,
  markAllAsReadLoading: false,
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

    // Clear notifications error
    clearNotificationsError: (state) => {
      state.notificationsError = null;
    },

    // Add new notification (for real-time updates)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },

    // Update notification (for real-time updates)
    updateNotification: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.notifications.findIndex(notification => notification.id === id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...updates };
      }
    },

    // Mark notification as read locally
    markNotificationAsReadLocal: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.is_read = true;
      }
    },

    // Mark all notifications as read locally
    markAllNotificationsAsReadLocal: (state) => {
      state.notifications.forEach(notification => {
        notification.is_read = true;
      });
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
      })

      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.notifications = action.payload.data || action.payload || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError = action.payload;
      })

      // Mark Notification As Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.markAsReadLoading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.markAsReadLoading = false;
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.is_read = true;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.markAsReadLoading = false;
        state.notificationsError = action.payload;
      })

      // Mark All Notifications As Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.markAllAsReadLoading = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.markAllAsReadLoading = false;
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.markAllAsReadLoading = false;
        state.notificationsError = action.payload;
      })

      // Send Test Notification
      .addCase(sendTestNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      });
  },
});

export const {
  setPermissionStatus,
  setFCMToken,
  clearError,
  clearNotificationsError,
  addNotification,
  updateNotification,
  markNotificationAsReadLocal,
  markAllNotificationsAsReadLocal,
} = notificationSlice.actions;

export default notificationSlice.reducer;
