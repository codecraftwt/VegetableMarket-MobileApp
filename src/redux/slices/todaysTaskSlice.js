import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch today's tasks
export const fetchTodaysTasks = createAsyncThunk(
  'todaysTask/fetchTodaysTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/todays-task');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch today\'s tasks'
      );
    }
  }
);

// Async thunk to update order status
export const updateOrderStatus = createAsyncThunk(
  'todaysTask/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('status', status);
      
      const response = await api.post('/delivery/update-order-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

// Async thunk to update assignment status
export const updateAssignmentStatus = createAsyncThunk(
  'todaysTask/updateAssignmentStatus',
  async ({ assignmentId, status }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('assignment_id', assignmentId);
      formData.append('status', status);
      
      const response = await api.post('/delivery/update-assignment-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update assignment status'
      );
    }
  }
);

// Async thunk to update payment status
export const updatePaymentStatus = createAsyncThunk(
  'todaysTask/updatePaymentStatus',
  async ({ orderId, paymentStatus }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('payment_status', paymentStatus);
      
      const response = await api.post('/delivery/update-payment-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update payment status'
      );
    }
  }
);

const todaysTaskSlice = createSlice({
  name: 'todaysTask',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearTodaysTaskError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearTodaysTaskSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetTodaysTaskState: (state) => {
      state.tasks = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(task => task.id === taskId);
      if (task) {
        task.delivery_status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaysTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchTodaysTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Order status updated successfully';
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateAssignmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Assignment status updated successfully';
        state.error = null;
      })
      .addCase(updateAssignmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Payment status updated successfully';
        state.error = null;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearTodaysTaskError, 
  clearTodaysTaskSuccess, 
  resetTodaysTaskState,
  updateTaskStatus 
} = todaysTaskSlice.actions;

export default todaysTaskSlice.reducer;
