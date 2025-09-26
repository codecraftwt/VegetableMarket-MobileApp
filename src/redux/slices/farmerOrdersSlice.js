import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch all farmer orders
export const fetchFarmerOrders = createAsyncThunk(
  'farmerOrders/fetchFarmerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/farmer/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

// Async thunk to fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'farmerOrders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/farmer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order details'
      );
    }
  }
);

// Async thunk to update order item status
export const updateOrderItemStatus = createAsyncThunk(
  'farmerOrders/updateOrderItemStatus',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await api.post('/farmer/orders/item-status', itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order item status'
      );
    }
  }
);

const farmerOrdersSlice = createSlice({
  name: 'farmerOrders',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    loadingOrder: false,
    updatingItemStatus: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearFarmerOrdersError: (state) => {
      state.error = null;
    },
    clearFarmerOrdersSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchFarmerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(fetchFarmerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loadingOrder = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loadingOrder = false;
        state.selectedOrder = action.payload.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loadingOrder = false;
        state.error = action.payload;
      })
      
      // Update order item status
      .addCase(updateOrderItemStatus.pending, (state) => {
        state.updatingItemStatus = true;
        state.error = null;
      })
      .addCase(updateOrderItemStatus.fulfilled, (state, action) => {
        state.updatingItemStatus = false;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateOrderItemStatus.rejected, (state, action) => {
        state.updatingItemStatus = false;
        state.error = action.payload;
      });
  },
});

export const { clearFarmerOrdersError, clearFarmerOrdersSuccess, clearSelectedOrder } = farmerOrdersSlice.actions;
export default farmerOrdersSlice.reducer;
