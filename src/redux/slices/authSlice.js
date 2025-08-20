import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    logout: state => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      // Clear AsyncStorage
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
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
        // Store token in AsyncStorage
        AsyncStorage.setItem('token', action.payload.data.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.data.user));
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
        // Store token in AsyncStorage
        AsyncStorage.setItem('token', action.payload.data.token);
        AsyncStorage.setItem('user', JSON.stringify(action.payload.data.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
