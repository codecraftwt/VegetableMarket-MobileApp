import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch delivery history
export const fetchDeliveryHistory = createAsyncThunk(
  'deliveryHistory/fetchDeliveryHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/delivery-history');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch delivery history'
      );
    }
  }
);

const deliveryHistorySlice = createSlice({
  name: 'deliveryHistory',
  initialState: {
    deliveries: [],
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearDeliveryHistoryError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearDeliveryHistorySuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetDeliveryHistoryState: (state) => {
      state.deliveries = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchDeliveryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearDeliveryHistoryError, 
  clearDeliveryHistorySuccess, 
  resetDeliveryHistoryState 
} = deliveryHistorySlice.actions;

export default deliveryHistorySlice.reducer;
