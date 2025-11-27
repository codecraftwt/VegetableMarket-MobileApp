import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import { 
  saveGuestCart, 
  getGuestCart, 
  clearGuestCart,
  mergeGuestCartWithUserCart 
} from '../../utils/guestStorage';

// Async thunks
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ vegetable_id, quantity }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, just return success (guest mode - stored locally)
      if (!isLoggedIn) {
        return { success: true, guestMode: true };
      }
      
      // If logged in, make API call
      const response = await api.post('/add-cart', {
        vegetable_id,
        quantity
      });
      return response.data;
    } catch (error) {
      // If 401, user might have logged out, allow guest mode
      if (error.response?.status === 401) {
        return { success: true, guestMode: true };
      }
      return rejectWithValue(error.response?.data || 'Failed to add item to cart');
    }
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, fetch guest cart from AsyncStorage
      if (!isLoggedIn) {
        const guestCart = await getGuestCart();
        const totalAmount = guestCart.reduce((sum, item) => 
          sum + (parseFloat(item.subtotal) || 0), 0
        );
        return {
          success: true,
          data: {
            cart_items: guestCart,
            addresses: [],
            payment_settings: [],
            total_amount: totalAmount
          },
          guestMode: true
        };
      }
      
      // If logged in, fetch from API
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      // If 401, user might have logged out, fetch guest cart
      if (error.response?.status === 401) {
        const guestCart = await getGuestCart();
        const totalAmount = guestCart.reduce((sum, item) => 
          sum + (parseFloat(item.subtotal) || 0), 0
        );
        return {
          success: true,
          data: {
            cart_items: guestCart,
            addresses: [],
            payment_settings: [],
            total_amount: totalAmount
          },
          guestMode: true
        };
      }
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }, { rejectWithValue, getState }) => {
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
      
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, just return success (guest mode - stored locally)
      if (!isLoggedIn) {
        return { id, success: true, guestMode: true };
      }
      
      // If logged in, make API call
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
      } else if (error.response?.status === 401) {
        // User logged out, allow guest mode
        return { id, success: true, guestMode: true };
      }
      
      return rejectWithValue({ message: errorMessage, error: errorMessage });
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, just return success (guest mode - stored locally)
      if (!isLoggedIn) {
        return { id, success: true, guestMode: true };
      }
      
      // If logged in, make API call
      const response = await api.delete(`/cart/${id}`);
      
      // Return the removed item ID for local state update
      return { id };
    } catch (error) {
      // If 401, user might have logged out, allow guest mode
      if (error.response?.status === 401) {
        return { id, success: true, guestMode: true };
      }
      return rejectWithValue(error.response?.data || 'Failed to remove item from cart');
    }
  }
);

// Load guest cart from AsyncStorage
export const loadGuestCart = createAsyncThunk(
  'cart/loadGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      const guestCart = await getGuestCart();
      const totalAmount = guestCart.reduce((sum, item) => 
        sum + (parseFloat(item.subtotal) || 0), 0
      );
      return {
        cartItems: guestCart,
        totalAmount
      };
    } catch (error) {
      return rejectWithValue('Failed to load guest cart');
    }
  }
);

// Sync guest cart to server after login
export const syncGuestCartToServer = createAsyncThunk(
  'cart/syncGuestCartToServer',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const guestCart = await getGuestCart();

      // Check if user is logged in and has role_id 3 (customer)
      const userRoleId = state.auth.user?.role_id;

      if (userRoleId !== 3) {
        // If role_id is not 3, don't sync data and return early
        return { success: true, synced: false, message: 'User is not a customer' };
      }

      if (guestCart.length === 0) {
        return { success: true, synced: false };
        // return { success: true, synced: false, reason: 'empty_cart' };
      }
      
      // Add each guest cart item to server
      const syncPromises = guestCart.map(async (item) => {
        try {
          await api.post('/add-cart', {
            vegetable_id: item.vegetable_id,
            quantity: item.quantity_kg || item.quantity || 1
          });
        } catch (error) {
          console.error(`Failed to sync cart item ${item.vegetable_id}:`, error);
        }
      });
      
      await Promise.all(syncPromises);
      
      // Clear guest cart after successful sync
      await clearGuestCart();
      
      // Fetch updated cart from server
      const response = await api.get('/cart');
      
      return {
        success: true,
        synced: true,
        data: response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to sync guest cart');
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
        // Handle images - preserve both formats for compatibility
        let veg_images = [];
        let images = [];
        
        if (vegetable?.images && Array.isArray(vegetable.images)) {
          // Store images array as is (with image_path structure)
          images = vegetable.images;
          // Also create veg_images array with full URLs for backward compatibility
          veg_images = vegetable.images.map(img => {
            if (typeof img === 'string') {
              return img.startsWith('http') ? img : `https://kisancart.in/storage/${img}`;
            } else if (img?.image_path) {
              return `https://kisancart.in/storage/${img.image_path}`;
            }
            return img;
          });
        } else if (vegetable?.veg_images && Array.isArray(vegetable.veg_images)) {
          veg_images = vegetable.veg_images;
        }
        
        // Create new item with all vegetable data, ensuring images are properly stored
        const newItem = {
          ...vegetable, // Spread all vegetable properties first
          id: Date.now(), // Temporary ID (overwrite if exists)
          vegetable_id: vegetable_id || vegetable?.id, // Ensure vegetable_id is set
          quantity_kg: quantity,
          price_per_kg: vegetable?.price_per_kg || 0,
          subtotal: (vegetable?.price_per_kg || 0) * quantity,
          name: vegetable?.name || 'Unknown Item',
          unit_type: vegetable?.unit_type || 'kg',
          // Ensure images are stored in both formats for compatibility
          images: images.length > 0 ? images : (vegetable?.images || []),
          veg_images: veg_images.length > 0 ? veg_images : (vegetable?.veg_images || []),
        };
        state.cartItems.push(newItem);
      }
      
      // Recalculate total amount
      state.totalAmount = state.cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.subtotal) || 0), 0
      );
    },
    // Save cart to AsyncStorage (for guest mode)
    saveCartToStorage: (state) => {
      // This will be called after state updates to save to AsyncStorage
      saveGuestCart(state.cartItems).catch(err => {
        console.error('Failed to save guest cart:', err);
      });
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
        
        // Save to AsyncStorage if in guest mode
        if (action.payload.guestMode) {
          saveGuestCart(state.cartItems).catch(err => {
            console.error('Failed to save guest cart:', err);
          });
        }
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
        if (action.payload.data) {
          console.log('CartSlice: Action payload.data keys:', Object.keys(action.payload.data));
        }
        
        // Update the specific item's quantity and subtotal
        const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
        if (itemIndex !== -1) {
          
          // Try different possible field names for quantity
          const newQuantity = action.payload.data?.quantity || action.payload.data?.quantity_kg || action.payload.quantity;
          const newSubtotal = action.payload.data?.subtotal || action.payload.subtotal;
                    
          if (newQuantity !== undefined) {
            state.cartItems[itemIndex].quantity_kg = newQuantity;
          } else {
            // If no quantity in response, use the quantity from the request
            // This ensures the Redux state stays in sync with what was sent
            const requestedQuantity = action.meta.arg.quantity;
            if (requestedQuantity !== undefined) {
              state.cartItems[itemIndex].quantity_kg = requestedQuantity;
            } else {
              console.log('CartSlice: No quantity found in API response or request, keeping current value');
            }
          }
          
          if (newSubtotal !== undefined) {
            state.cartItems[itemIndex].subtotal = newSubtotal;
          } else {
            // If no subtotal in response, calculate it manually
            const pricePerKg = parseFloat(state.cartItems[itemIndex].price_per_kg);
            const quantity = state.cartItems[itemIndex].quantity_kg;
            const calculatedSubtotal = (pricePerKg * quantity).toFixed(2);
            state.cartItems[itemIndex].subtotal = calculatedSubtotal;
          }
          
          // Recalculate total amount
          state.totalAmount = state.cartItems.reduce((sum, item) => 
            sum + parseFloat(item.subtotal), 0
          );
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

    // Load guest cart
    builder
      .addCase(loadGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.error = null;
      })
      .addCase(loadGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Sync guest cart to server
    builder
      .addCase(syncGuestCartToServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncGuestCartToServer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.synced && action.payload.data) {
          state.cartItems = action.payload.data.data.cart_items || [];
          state.addresses = action.payload.data.data.addresses || [];
          state.paymentSettings = action.payload.data.data.payment_settings || [];
          state.totalAmount = action.payload.data.data.total_amount || 0;
        }
        state.error = null;
      })
      .addCase(syncGuestCartToServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearCartErrors, 
  clearCart, 
  updateLocalQuantity, 
  addItemToCart, 
  removeItemFromCart, 
  updateItemQuantity,
  saveCartToStorage 
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
