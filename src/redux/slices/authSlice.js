import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Role mapping with IDs
export const ROLES = {
  FARMER: { id: 2, name: 'Farmer' },
  CUSTOMER: { id: 3, name: 'Customer' },
  DELIVERY_BOY: { id: 4, name: 'Delivery Boy' },
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Map role name to role ID before sending to API
      const roleId = Object.values(ROLES).find(
        role => role.name === userData.role,
      )?.id;

      const apiData = {
        ...userData,
        role_id: roleId,
        password_confirmation: userData.confirmPassword, // API expects password_confirmation
        // Remove confirmPassword as it's not needed by API
        confirmPassword: undefined,
      };

      const response = await api.post('register', apiData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed',
      );
    }
  },
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Login error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

// Async thunk to check authentication status on app launch
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Lazy import AsyncStorage to avoid blocking initialization
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      
      // Check if token and user exist in AsyncStorage
      const token = await AsyncStorage.default.getItem('token');
      const userData = await AsyncStorage.default.getItem('user');
      
      if (token && userData) {
        // Parse user data
        const user = JSON.parse(userData);
        
        // Validate token with server
        try {
          const response = await api.get('profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            // Token is valid, return the stored data
            return {
              user,
              token,
            };
          } else {
            // Token is invalid, clear storage
            await AsyncStorage.default.removeItem('token');
            await AsyncStorage.default.removeItem('user');
            return null;
          }
        } catch (error) {
          // Token validation failed, clear storage
          await AsyncStorage.default.removeItem('token');
          await AsyncStorage.default.removeItem('user');
          return null;
        }
      } else {
        // No stored data, user is not logged in
        return null;
      }
    } catch (error) {
      return rejectWithValue('Failed to check authentication status');
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      // Clear AsyncStorage with lazy import
      import('@react-native-async-storage/async-storage').then(AsyncStorage => {
        try {
          AsyncStorage.default.removeItem('token');
          AsyncStorage.default.removeItem('user');
        } catch (error) {
          console.warn('Failed to clear AsyncStorage:', error);
        }
      });
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      // Clear AsyncStorage with lazy import
      import('@react-native-async-storage/async-storage').then(AsyncStorage => {
        try {
          AsyncStorage.default.removeItem('token');
          AsyncStorage.default.removeItem('user');
        } catch (error) {
          console.warn('Failed to clear AsyncStorage:', error);
        }
      });
    },
  },
  extraReducers: builder => {
    // Register user
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Access user and token from the nested data structure
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isLoggedIn = true;
        state.error = null;
        // Store token in AsyncStorage with lazy import
        import('@react-native-async-storage/async-storage').then(AsyncStorage => {
          try {
            AsyncStorage.default.setItem('token', action.payload.data.token);
            AsyncStorage.default.setItem('user', JSON.stringify(action.payload.data.user));
          } catch (error) {
            console.warn('Failed to store data in AsyncStorage:', error);
          }
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login user
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // Access user and token from the nested data structure
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isLoggedIn = true;
        state.error = null;
        // Store token in AsyncStorage with lazy import
        import('@react-native-async-storage/async-storage').then(AsyncStorage => {
          try {
            AsyncStorage.default.setItem('token', action.payload.data.token);
            AsyncStorage.default.setItem('user', JSON.stringify(action.payload.data.user));
          } catch (error) {
            console.warn('Failed to store data in AsyncStorage:', error);
          }
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Check auth status on app launch
    builder
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isLoggedIn = true;
          state.error = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAuth, logout } = authSlice.actions;
export default authSlice.reducer;
