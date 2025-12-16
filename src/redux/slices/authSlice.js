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
        password_confirmation: userData.confirmPassword,
        // Remove confirmPassword as it's not needed by API
        confirmPassword: undefined,
      };

      const response = await api.post('register', apiData);
      return response.data;
    } catch (error) {
      // Comprehensive error logging
      // console.error('❌ [REGISTER] Error Details:', {
      //   message: error.message,
      //   response: error.response ? {
      //     status: error.response.status,
      //     statusText: error.response.statusText,
      //     data: error.response.data,
      //     headers: error.response.headers,
      //   } : 'No response object',
      //   request: error.request ? {
      //     url: error.config?.url,
      //     method: error.config?.method,
      //     baseURL: error.config?.baseURL,
      //     data: error.config?.data,
      //   } : 'No request object',
      //   config: error.config ? {
      //     url: error.config.url,
      //     method: error.config.method,
      //     baseURL: error.config.baseURL,
      //   } : 'No config object',
      //   stack: error.stack,
      // });

      // Extract error message with fallbacks
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle Laravel validation errors (errors object with field-specific messages)
        if (errorData.errors && typeof errorData.errors === 'object') {
          const validationErrors = [];
          Object.keys(errorData.errors).forEach(field => {
            if (Array.isArray(errorData.errors[field])) {
              validationErrors.push(...errorData.errors[field]);
            } else {
              validationErrors.push(errorData.errors[field]);
            }
          });
          errorMessage = validationErrors.length > 0 
            ? validationErrors.join(', ') 
            : 'Validation failed. Please check your input.';
        }
        // Try different possible error message formats
        else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error.request) {
        errorMessage = 'Network error: Unable to reach server. Please check your internet connection.';
        console.error('❌ [REGISTER] Network Error - Request made but no response received');
      } else {
        errorMessage = error.message || 'Registration failed';
        console.error('❌ [REGISTER] Request setup error');
      }

      console.error('❌ [REGISTER] Final Error Message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Get device token from AsyncStorage if available
      // let deviceToken = null;
      // let deviceType = 'android'; // Default to android

      // try {
      //   const AsyncStorage = await import('@react-native-async-storage/async-storage');
      //   deviceToken = await AsyncStorage.default.getItem('fcm_token');

      //   // Determine device type
      //   const Platform = await import('react-native');
      //   deviceType = Platform.default.OS === 'ios' ? 'ios' : 'android';

      // } catch (tokenError) {
      //   console.log('⚠️ Could not get device token for login:', tokenError);
      // }

      // Prepare login data without device token
      const loginData = {
        ...credentials,
        // device_token: deviceToken, // Commented out
        // device_type: deviceType // Commented out
      };

      const response = await api.post('login', loginData);
      return response.data;
    } catch (error) {
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
  // Forgot password related state
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordMessage: null,
  resendPasswordResetLoading: false,
  resendPasswordResetMessage: null,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordMessage: null,
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
    clearForgotPasswordState: state => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordMessage = null;
      state.resendPasswordResetLoading = false;
      state.resendPasswordResetMessage = null;
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordMessage = null;
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

    // Forgot password
    builder
      .addCase(forgotPassword.pending, state => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordMessage = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordMessage = action.payload.message || 'Password reset link sent to your email.';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload || 'Failed to send password reset link';
      });

    // Resend password reset link
    builder
      .addCase(resendPasswordReset.pending, state => {
        state.resendPasswordResetLoading = true;
        state.forgotPasswordError = null;
        state.resendPasswordResetMessage = null;
      })
      .addCase(resendPasswordReset.fulfilled, (state, action) => {
        state.resendPasswordResetLoading = false;
        state.resendPasswordResetMessage = action.payload.message || 'Password reset link sent.';
      })
      .addCase(resendPasswordReset.rejected, (state, action) => {
        state.resendPasswordResetLoading = false;
        state.forgotPasswordError = action.payload || 'Failed to resend password reset link';
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, state => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordMessage = action.payload.message || 'Password reset successfully.';
        
        // If user data and token are returned, store them and mark as logged in
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isLoggedIn = true;
          state.emailVerified = action.payload.user?.email_verified ?? state.emailVerified;
          state.error = null;
          
          // Store token in AsyncStorage
          import('@react-native-async-storage/async-storage').then(AsyncStorage => {
            try {
              AsyncStorage.default.setItem('token', action.payload.token);
              AsyncStorage.default.setItem('user', JSON.stringify(action.payload.user));
            } catch (error) {
              console.warn('Failed to store data in AsyncStorage:', error);
            }
          });
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload || 'Failed to reset password';
      });
  },
});

export const { clearError, clearAuth, logout, clearVerificationState, clearForgotPasswordState } = authSlice.actions;
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

// Forgot password thunks
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to send password reset link'
      );
    }
  }
);

export const resendPasswordReset = createAsyncThunk(
  'auth/resendPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('resend-password-reset', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to resend password reset link'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await api.post('reset-password', resetData);

      if (response.data.data && response.data.data.user && response.data.data.token) {
        return {
          ...response.data,
          user: response.data.data.user,
          token: response.data.data.token,
        };
      } else {
        // Auto-login after password reset
        try {
          const loginResponse = await api.post('login', {
            email: resetData.email.trim(),
            password: resetData.password,
          });
          
          if (loginResponse.data.data && loginResponse.data.data.user && loginResponse.data.data.token) {
            return {
              ...response.data,
              user: loginResponse.data.data.user,
              token: loginResponse.data.data.token,
            };
          }
        } catch (loginError) {
          // If auto-login fails, still return success but without user data
          console.log('Auto-login after password reset failed:', loginError);
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to reset password'
      );
    }
  }
);
