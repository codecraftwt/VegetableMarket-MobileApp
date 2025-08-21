import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunks
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ vegetable_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post('/add-cart', {
        vegetable_id,
        quantity
      });
      
      // Return the response data for local state management
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add item to cart');
    }
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      console.log('Updating cart quantity for ID:', id, 'to:', quantity);
      
      // Validate quantity before API call
      if (quantity < 1) {
        throw new Error('Quantity cannot be less than 1');
      }
      if (quantity > 99) {
        throw new Error('Quantity cannot be more than 99');
      }
      
      // Check if quantity is a valid number
      if (isNaN(quantity) || !Number.isInteger(quantity)) {
        throw new Error('Quantity must be a valid whole number');
      }
      
      const response = await api.patch(`/cart/${id}`, { quantity });
      console.log('Update quantity response:', response.data);
      
      return { id, ...response.data };
    } catch (error) {
      console.error('Update quantity error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to update quantity';
      
      if (error.message) {
        // Custom validation error
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        // API error message
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 422) {
        // Validation error from API
        errorMessage = 'Invalid quantity value. Please try again.';
      } else if (error.response?.status === 400) {
        // Bad request error
        errorMessage = 'Invalid request. Please check the quantity value.';
      }
      
      return rejectWithValue({ message: errorMessage, error: errorMessage });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Removing cart item with ID:', id);
      const response = await api.delete(`/cart/${id}`);
      console.log('Delete cart response:', response.data);
      
      // Return the removed item ID for local state update
      return { id };
    } catch (error) {
      console.error('Delete cart error:', error);
      return rejectWithValue(error.response?.data || 'Failed to remove item from cart');
    }
  }
);

const initialState = {
  cartItems: [],
  addresses: [],
  paymentSettings: [],
  totalAmount: 0,
  loading: false,
  error: null,
  addLoading: false,
  addError: null,
  updateLoading: false,
  updateError: null,
  removeLoading: false,
  removeError: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartErrors: (state) => {
      state.error = null;
      state.addError = null;
      state.updateError = null;
      state.removeError = null;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.addresses = [];
      state.paymentSettings = [];
      state.totalAmount = 0;
    },
    updateLocalQuantity: (state, action) => {
      state.cartItems = action.payload.cartItems;
      state.totalAmount = action.payload.totalAmount;
    },
  },
  extraReducers: (builder) => {
    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.addLoading = false;
        // Cart will be refreshed automatically by the thunk
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload;
      });

    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.data.cart_items || [];
        state.addresses = action.payload.data.addresses || [];
        state.paymentSettings = action.payload.data.payment_settings || [];
        state.totalAmount = action.payload.data.total_amount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update quantity
    builder
      .addCase(updateCartQuantity.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the specific item's quantity and subtotal
        const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
        if (itemIndex !== -1) {
          state.cartItems[itemIndex].quantity_kg = action.payload.data.quantity;
          state.cartItems[itemIndex].subtotal = action.payload.data.subtotal;
          // Recalculate total amount
          state.totalAmount = state.cartItems.reduce((sum, item) => 
            sum + parseFloat(item.subtotal), 0
          );
        }
        console.log('Cart state updated after quantity change:', state.cartItems.length, 'items, total:', state.totalAmount);
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.removeLoading = true;
        state.removeError = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.removeLoading = false;
        console.log('Cart state after remove:', state.cartItems.length, 'items');
        // Cart will be refreshed automatically by the thunk
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload;
        console.error('Remove from cart rejected:', action.payload);
      });
  },
});

export const { clearCartErrors, clearCart, updateLocalQuantity } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
