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
  // Email verification related state
  emailVerified: null,
  verificationLoading: false,
  verificationError: null,
  resendLoading: false,
  resendMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearVerificationState: state => {
      state.verificationLoading = false;
      state.verificationError = null;
      state.resendLoading = false;
      state.resendMessage = null;
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      state.emailVerified = null;
      state.verificationLoading = false;
      state.verificationError = null;
      state.resendLoading = false;
      state.resendMessage = null;
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
      state.emailVerified = null;
      state.verificationLoading = false;
      state.verificationError = null;
      state.resendLoading = false;
      state.resendMessage = null;
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
        // Do not mark logged-in until email verified
        state.isLoggedIn = false;
        state.emailVerified = false;
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
        // Tentatively logged in; will be gated by emailVerified check in UI
        state.isLoggedIn = true;
        state.emailVerified = action.payload.data.user?.email_verified ?? state.emailVerified;
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
          state.emailVerified = action.payload.user?.email_verified ?? state.emailVerified;
          state.error = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Check email verified
    builder
      .addCase(checkEmailVerified.pending, state => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(checkEmailVerified.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.emailVerified = action.payload.email_verified === true;
        // Don't set isLoggedIn to true here - let EmailVerificationScreen handle navigation
      })
      .addCase(checkEmailVerified.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload || 'Failed to check verification status';
      });

    // Resend verification email
    builder
      .addCase(resendVerificationEmail.pending, state => {
        state.resendLoading = true;
        state.resendMessage = null;
        state.verificationError = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.resendLoading = false;
        state.resendMessage = action.payload.message || 'Verification email resent.';
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.resendLoading = false;
        state.verificationError = action.payload || 'Failed to resend verification email';
      });
  },
});

export const { clearError, clearAuth, logout, clearVerificationState } = authSlice.actions;
export default authSlice.reducer;

// New thunks for email verification flow
export const checkEmailVerified = createAsyncThunk(
  'auth/checkEmailVerified',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const tokenFromState = state.auth?.token;
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = tokenFromState || (await AsyncStorage.default.getItem('token'));
      if (!token) {
        return rejectWithValue('Missing auth token');
      }
      const response = await api.get('email/verified', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification check failed');
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const tokenFromState = state.auth?.token;
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = tokenFromState || (await AsyncStorage.default.getItem('token'));
      if (!token) {
        return rejectWithValue('Missing auth token');
      }
      const response = await api.post('email/resend', null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Resend failed');
    }
  }
);
