import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch user orders
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/my-orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Async thunk to accept partial order
export const acceptPartialOrder = createAsyncThunk(
  'orders/acceptPartialOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/accept-partial`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept partial order');
    }
  }
);

// Async thunk to cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// Async thunk to submit review
export const submitReview = createAsyncThunk(
  'orders/submitReview',
  async ({ orderId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/review`, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

const initialState = {
  orders: [],
  loading: false,
  error: null,
  acceptPartialLoading: false,
  acceptPartialError: null,
  cancelOrderLoading: false,
  cancelOrderError: null,
  submitReviewLoading: false,
  submitReviewError: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearAcceptPartialError: (state) => {
      state.acceptPartialError = null;
    },
    clearCancelOrderError: (state) => {
      state.cancelOrderError = null;
    },
    clearSubmitReviewError: (state) => {
      state.submitReviewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        console.log('fetchMyOrders-------------',action.payload.data)
        state.error = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      // Accept Partial Order
      .addCase(acceptPartialOrder.pending, (state) => {
        state.acceptPartialLoading = true;
        state.acceptPartialError = null;
      })
      .addCase(acceptPartialOrder.fulfilled, (state, action) => {
        state.acceptPartialLoading = false;
        state.acceptPartialError = null;
        // Update the specific order status if needed
        // You can add logic here to update the order status
      })
      .addCase(acceptPartialOrder.rejected, (state, action) => {
        state.acceptPartialLoading = false;
        state.acceptPartialError = action.payload || 'Failed to accept partial order';
      })
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.cancelOrderLoading = true;
        state.cancelOrderError = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelOrderLoading = false;
        state.cancelOrderError = null;
        // Update the specific order status to cancelled
        const orderIndex = state.orders.findIndex(order => order.order_id === action.meta.arg);
        if (orderIndex !== -1) {
          state.orders[orderIndex].is_canceled = true;
          state.orders[orderIndex].delivery_status = 'cancelled';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelOrderLoading = false;
        state.cancelOrderError = action.payload || 'Failed to cancel order';
      })
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.submitReviewLoading = true;
        state.submitReviewError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitReviewLoading = false;
        state.submitReviewError = null;
        // Update the specific order to mark it as reviewed
        const orderIndex = state.orders.findIndex(order => order.order_id === action.meta.arg.orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].is_reviewed = true;
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitReviewLoading = false;
        state.submitReviewError = action.payload || 'Failed to submit review';
      });
  },
});

export const { 
  clearOrders, 
  clearOrdersError, 
  clearAcceptPartialError, 
  clearCancelOrderError,
  clearSubmitReviewError
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectAcceptPartialLoading = (state) => state.orders.acceptPartialLoading;
export const selectAcceptPartialError = (state) => state.orders.acceptPartialError;
export const selectCancelOrderLoading = (state) => state.orders.cancelOrderLoading;
export const selectCancelOrderError = (state) => state.orders.cancelOrderError;
export const selectSubmitReviewLoading = (state) => state.orders.submitReviewLoading;
export const selectSubmitReviewError = (state) => state.orders.submitReviewError;

export default ordersSlice.reducer;
