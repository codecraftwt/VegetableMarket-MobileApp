import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch delivery dashboard data
export const fetchDeliveryDashboard = createAsyncThunk(
  'deliveryDashboard/fetchDeliveryDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

const deliveryDashboardSlice = createSlice({
  name: 'deliveryDashboard',
  initialState: {
    dashboardData: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearDeliveryDashboardError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearDeliveryDashboardSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetDeliveryDashboardState: (state) => {
      state.dashboardData = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch delivery dashboard
      .addCase(fetchDeliveryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload.data || null;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchDeliveryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearDeliveryDashboardError, 
  clearDeliveryDashboardSuccess, 
  resetDeliveryDashboardState 
} = deliveryDashboardSlice.actions;

export default deliveryDashboardSlice.reducer;
