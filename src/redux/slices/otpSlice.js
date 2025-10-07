import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to generate OTP
export const generateOTP = createAsyncThunk(
  'otp/generateOTP',
  async ({ orderId }, { rejectWithValue }) => {
    try {
      console.log('🚀 Generate OTP API Call:', {
        url: '/delivery/otp/generate',
        orderId: orderId,
        orderIdType: typeof orderId,
        requestBody: { order_id: orderId }
      });
      
      // Check if we have a valid token
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.default.getItem('token');
        console.log('🔑 Authentication Token:', {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });
      } catch (tokenError) {
        console.log('❌ Token Check Error:', tokenError);
      }
      
      const response = await api.post('/delivery/otp/generate', {
        order_id: orderId
      });
      
      console.log('✅ Generate OTP API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      // After generating OTP, fetch the OTP status to get the actual OTP value
      try {
        const statusResponse = await api.get(`/delivery/otp/status/${orderId}`);
        console.log('📊 OTP Status After Generation:', statusResponse.data);
        
        // Return both the generation response and the OTP status
        return {
          ...response.data,
          otpStatus: statusResponse.data,
          actualOTP: statusResponse.data.otp || null // Extract OTP if available
        };
      } catch (statusError) {
        console.log('⚠️ Could not fetch OTP status after generation:', statusError);
        return response.data;
      }
    } catch (error) {
      console.log('❌ Generate OTP API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      // Log the detailed error response
      if (error.response?.data) {
        console.log('🔍 Detailed Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Log the request that failed
      console.log('📤 Failed Request Details:', {
        url: '/delivery/otp/generate',
        method: 'POST',
        data: { order_id: orderId },
        headers: error.config?.headers
      });
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate OTP'
      );
    }
  }
);

// Async thunk to verify OTP
export const verifyOTP = createAsyncThunk(
  'otp/verifyOTP',
  async ({ orderId, otp }, { rejectWithValue }) => {
    try {
      console.log('🔐 Verify OTP API Call:', {
        url: '/delivery/otp/verify',
        orderId: orderId,
        otp: otp,
        requestBody: { order_id: orderId, otp: otp }
      });
      
      const response = await api.post('/delivery/otp/verify', {
        order_id: orderId,
        otp: otp
      });
      
      console.log('✅ Verify OTP API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return response.data;
    } catch (error) {
      console.log('❌ Verify OTP API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      // Log detailed error response for debugging
      if (error.response?.data) {
        console.log('🔍 Detailed Verify OTP Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify OTP'
      );
    }
  }
);

// Async thunk to get OTP status
export const getOTPStatus = createAsyncThunk(
  'otp/getOTPStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      console.log('📊 Get OTP Status API Call:', {
        url: `/delivery/otp/status/${orderId}`,
        orderId: orderId,
        orderIdType: typeof orderId
      });
      
      // Check if we have a valid token
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.default.getItem('token');
        console.log('🔑 OTP Status Token Check:', {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });
      } catch (tokenError) {
        console.log('❌ OTP Status Token Check Error:', tokenError);
      }
      
      const response = await api.get(`/delivery/otp/status/${orderId}`);
      
      console.log('✅ Get OTP Status API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return response.data;
    } catch (error) {
      console.log('❌ Get OTP Status API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      // Log the detailed error response
      if (error.response?.data) {
        console.log('🔍 OTP Status Detailed Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Log the request that failed
      console.log('📤 OTP Status Failed Request Details:', {
        url: `/delivery/otp/status/${orderId}`,
        method: 'GET',
        orderId: orderId,
        headers: error.config?.headers
      });
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get OTP status'
      );
    }
  }
);

const otpSlice = createSlice({
  name: 'otp',
  initialState: {
    loading: false,
  generateLoading: false,
  verifyLoading: false,
  statusLoading: false,
  error: null,
  success: false,
  message: '',
  otpGenerated: false,
  otpVerified: false,
  otpStatus: null,
  actualOTP: null, // Store the actual OTP value
  },
  reducers: {
    clearOTPError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearOTPSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetOTPState: (state) => {
      state.loading = false;
      state.generateLoading = false;
      state.verifyLoading = false;
      state.statusLoading = false;
      state.error = null;
      state.success = false;
      state.message = '';
      state.otpGenerated = false;
      state.otpVerified = false;
      state.otpStatus = null;
    },
    setOTPGenerated: (state, action) => {
      state.otpGenerated = action.payload;
    },
    setOTPVerified: (state, action) => {
      state.otpVerified = action.payload;
    },
    clearActualOTP: (state) => {
      state.actualOTP = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate OTP
      .addCase(generateOTP.pending, (state) => {
        state.generateLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateOTP.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.success = true;
        state.message = action.payload.message || 'OTP generated successfully';
        state.otpGenerated = true;
        state.error = null;
        state.actualOTP = action.payload.actualOTP;
        // Update otpStatus if available
        if (action.payload.otpStatus) {
          state.otpStatus = action.payload.otpStatus;
        }
      })
      .addCase(generateOTP.rejected, (state, action) => {
        state.generateLoading = false;
        state.error = action.payload;
        state.success = false;
        state.otpGenerated = false;
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.verifyLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.success = true;
        state.message = action.payload.message || 'OTP verified successfully';
        state.otpVerified = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.verifyLoading = false;
        state.error = action.payload;
        state.success = false;
        state.otpVerified = false;
      })
      
      // Get OTP Status
      .addCase(getOTPStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(getOTPStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.otpStatus = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(getOTPStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
        state.success = false;
        state.otpStatus = null;
      });
  },
});

export const { 
  clearOTPError, 
  clearOTPSuccess, 
  resetOTPState,
  setOTPGenerated,
  setOTPVerified,
  clearActualOTP
} = otpSlice.actions;

export default otpSlice.reducer;
