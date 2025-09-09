import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for placing order
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('API call: /place-order with data:', orderData);
      const response = await api.post('/place-order', orderData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Failed to place order:', error);
      return rejectWithValue(error.response?.data || 'Failed to place order');
    }
  }
);

// Async thunk for verifying Razorpay payment
export const verifyRazorpayPayment = createAsyncThunk(
  'orders/verifyRazorpayPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/verify-razorpay-payment', paymentData);
      return response.data;
    } catch (error) {
      console.warn('Failed to verify payment:', error);
      return rejectWithValue(error.response?.data || 'Failed to verify payment');
    }
  }
);

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
  // New order placement and Razorpay data
  orderData: null,
  razorpayOrderId: null,
  razorpayKey: null,
  razorpayAmount: null,
  razorpayCurrency: null,
  razorpayName: null,
  razorpayEmail: null,
  razorpayContact: null,
  
  // Existing order management data
  orders: [],
  
  // Loading states
  loading: false, // For fetchMyOrders
  placeOrderLoading: false, // For placeOrder
  paymentVerificationLoading: false,
  acceptPartialLoading: false,
  cancelOrderLoading: false,
  submitReviewLoading: false,
  
  // Error states
  error: null,
  paymentVerificationError: null,
  acceptPartialError: null,
  cancelOrderError: null,
  submitReviewError: null,
  
  // Success states
  success: false,
  paymentVerified: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      state.orderData = null;
      state.razorpayOrderId = null;
      state.razorpayKey = null;
      state.razorpayAmount = null;
      state.razorpayCurrency = null;
      state.razorpayName = null;
      state.razorpayEmail = null;
      state.razorpayContact = null;
      state.error = null;
      state.success = false;
      state.paymentVerified = false;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
    clearErrors: (state) => {
      state.error = null;
      state.paymentVerificationError = null;
      state.acceptPartialError = null;
      state.cancelOrderError = null;
      state.submitReviewError = null;
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
    setPaymentVerified: (state, action) => {
      state.paymentVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Place Order
    builder
      .addCase(placeOrder.pending, (state) => {
        state.placeOrderLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placeOrderLoading = false;
        state.orderData = action.payload;
        state.razorpayOrderId = action.payload.razorpay_order_id;
        state.razorpayKey = action.payload.key;
        state.razorpayAmount = action.payload.amount;
        state.razorpayCurrency = action.payload.currency;
        state.razorpayName = action.payload.name;
        state.razorpayEmail = action.payload.email;
        state.razorpayContact = action.payload.contact;
        state.success = true;
        state.error = null;
        
        console.log('Order placed successfully, Razorpay data stored:', {
          razorpayOrderId: state.razorpayOrderId,
          razorpayKey: state.razorpayKey ? 'Present' : 'Missing',
          razorpayAmount: state.razorpayAmount,
          razorpayCurrency: state.razorpayCurrency
        });
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placeOrderLoading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Verify Razorpay Payment
    builder
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.paymentVerificationLoading = true;
        state.paymentVerificationError = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.paymentVerificationLoading = false;
        state.paymentVerified = true;
        state.paymentVerificationError = null;
        
        // Store the verified order data if it's returned from the backend
        if (action.payload && action.payload.order) {
          state.orderData = action.payload.order;
        }
        
        console.log('Payment verification successful, order data updated:', action.payload);
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.paymentVerificationLoading = false;
        state.paymentVerificationError = action.payload;
        state.paymentVerified = false;
        
        console.error('Payment verification failed:', action.payload);
      });

    // Fetch Orders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        state.error = null;
        
        // Log the additional delivery_boy data if present
        if (action.payload.data && action.payload.data.length > 0) {
          console.log('Orders fetched with delivery_boy data:', action.payload.data);
        }
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      });

    // Accept Partial Order
    builder
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
      });

    // Cancel Order
    builder
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
      });

    // Submit Review
    builder
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
  clearOrderData, 
  clearOrders, 
  clearErrors, 
  clearAcceptPartialError, 
  clearCancelOrderError, 
  clearSubmitReviewError, 
  setPaymentVerified 
} = ordersSlice.actions;

// Selectors
export const selectOrderData = (state) => state.orders.orderData;
export const selectRazorpayData = (state) => ({
  orderId: state.orders.razorpayOrderId,
  key: state.orders.razorpayKey,
  amount: state.orders.razorpayAmount,
  currency: state.orders.razorpayCurrency,
  name: state.orders.razorpayName,
  email: state.orders.razorpayEmail,
  contact: state.orders.razorpayContact,
});

// Existing order management selectors
export const selectOrders = (state) => state.orders.orders;

// Loading state selectors
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectPlaceOrderLoading = (state) => state.orders.placeOrderLoading;
export const selectPaymentVerificationLoading = (state) => state.orders.paymentVerificationLoading;
export const selectAcceptPartialLoading = (state) => state.orders.acceptPartialLoading;
export const selectCancelOrderLoading = (state) => state.orders.cancelOrderLoading;
export const selectSubmitReviewLoading = (state) => state.orders.submitReviewLoading;

// Error state selectors
export const selectOrdersError = (state) => state.orders.error;
export const selectPaymentVerificationError = (state) => state.orders.paymentVerificationError;
export const selectAcceptPartialError = (state) => state.orders.acceptPartialError;
export const selectCancelOrderError = (state) => state.orders.cancelOrderError;
export const selectSubmitReviewError = (state) => state.orders.submitReviewError;

// Success state selectors
export const selectOrderSuccess = (state) => state.orders.success;
export const selectPaymentVerified = (state) => state.orders.paymentVerified;

export default ordersSlice.reducer;
