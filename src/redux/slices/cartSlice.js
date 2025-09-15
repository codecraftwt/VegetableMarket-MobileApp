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
      
      return { id, ...response.data };
    } catch (error) {
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
      const response = await api.delete(`/cart/${id}`);
      
      // Return the removed item ID for local state update
      return { id };
    } catch (error) {
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
    // Add item to cart immediately for badge updates
    addItemToCart: (state, action) => {
      const { vegetable_id, quantity, vegetable } = action.payload;
      const existingItem = state.cartItems.find(item => item.vegetable_id === vegetable_id);
      
      if (existingItem) {
        existingItem.quantity_kg = (existingItem.quantity_kg || 0) + quantity;
        existingItem.subtotal = parseFloat(existingItem.price_per_kg) * existingItem.quantity_kg;
      } else {
        const newItem = {
          id: Date.now(), // Temporary ID
          vegetable_id,
          quantity_kg: quantity,
          price_per_kg: vegetable?.price_per_kg || 0,
          subtotal: (vegetable?.price_per_kg || 0) * quantity,
          name: vegetable?.name || 'Unknown Item',
          unit_type: vegetable?.unit_type || 'kg',
          veg_images: vegetable?.veg_images || [],
          ...vegetable
        };
        state.cartItems.push(newItem);
      }
      
      // Recalculate total amount
      state.totalAmount = state.cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.subtotal) || 0), 0
      );
    },
    // Remove item from cart immediately for badge updates
    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter(item => item.id !== itemId);
      
      // Recalculate total amount
      state.totalAmount = state.cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.subtotal) || 0), 0
      );
    },
    // Update item quantity immediately for badge updates
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.cartItems.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        state.cartItems[itemIndex].quantity_kg = quantity;
        state.cartItems[itemIndex].subtotal = parseFloat(state.cartItems[itemIndex].price_per_kg) * quantity;
        
        // Recalculate total amount
        state.totalAmount = state.cartItems.reduce((sum, item) => 
          sum + (parseFloat(item.subtotal) || 0), 0
        );
      }
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
        state.error = null;
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
        console.log('CartSlice: updateCartQuantity.fulfilled - Full payload:', JSON.stringify(action.payload, null, 2));
        console.log('CartSlice: Action payload keys:', Object.keys(action.payload));
        if (action.payload.data) {
          console.log('CartSlice: Action payload.data keys:', Object.keys(action.payload.data));
        }
        
        // Update the specific item's quantity and subtotal
        const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
        if (itemIndex !== -1) {
          console.log('CartSlice: Found item at index:', itemIndex, 'Current item:', state.cartItems[itemIndex]);
          
          // Try different possible field names for quantity
          const newQuantity = action.payload.data?.quantity || action.payload.data?.quantity_kg || action.payload.quantity;
          const newSubtotal = action.payload.data?.subtotal || action.payload.subtotal;
          
          console.log('CartSlice: New quantity:', newQuantity, 'New subtotal:', newSubtotal);
          
          if (newQuantity !== undefined) {
            state.cartItems[itemIndex].quantity_kg = newQuantity;
            console.log('CartSlice: Updated quantity_kg to:', newQuantity);
          } else {
            // If no quantity in response, use the quantity from the request
            // This ensures the Redux state stays in sync with what was sent
            const requestedQuantity = action.meta.arg.quantity;
            if (requestedQuantity !== undefined) {
              state.cartItems[itemIndex].quantity_kg = requestedQuantity;
              console.log('CartSlice: Using requested quantity as fallback:', requestedQuantity);
            } else {
              console.log('CartSlice: No quantity found in API response or request, keeping current value');
            }
          }
          
          if (newSubtotal !== undefined) {
            state.cartItems[itemIndex].subtotal = newSubtotal;
            console.log('CartSlice: Updated subtotal to:', newSubtotal);
          } else {
            // If no subtotal in response, calculate it manually
            const pricePerKg = parseFloat(state.cartItems[itemIndex].price_per_kg);
            const quantity = state.cartItems[itemIndex].quantity_kg;
            const calculatedSubtotal = (pricePerKg * quantity).toFixed(2);
            state.cartItems[itemIndex].subtotal = calculatedSubtotal;
            console.log('CartSlice: Calculated subtotal:', calculatedSubtotal);
          }
          
          // Recalculate total amount
          state.totalAmount = state.cartItems.reduce((sum, item) => 
            sum + parseFloat(item.subtotal), 0
          );
          
          console.log('CartSlice: Updated item:', state.cartItems[itemIndex]);
          console.log('CartSlice: New total amount:', state.totalAmount);
        } else {
          console.log('CartSlice: Item not found with id:', action.payload.id);
        }
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
        // Cart will be refreshed automatically by the thunk
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload;
      });
  },
});

export const { clearCartErrors, clearCart, updateLocalQuantity, addItemToCart, removeItemFromCart, updateItemQuantity } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
