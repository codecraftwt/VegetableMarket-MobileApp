import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching wishlist items
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    try {      
      // Get the current state to access the token
      const state = getState();
      const token = state.auth.token;
      
      // For GET requests, we can include the token as a query parameter
      // or the Bearer token in headers should be sufficient
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch wishlist');
    }
  }
);

// Async thunk for fetching popular items
export const fetchPopularItems = createAsyncThunk(
  'wishlist/fetchPopularItems',
  async (_, { rejectWithValue, getState }) => {
    try {      
      // Get the current state to access the token
      const state = getState();
      const token = state.auth.token;
      
      const response = await api.get('/popular-items');
      return response.data;
    } catch (error) {
      console.error('Fetch popular items error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch popular items');
    }
  }
);

// Async thunk for toggling wishlist item (add/remove)
export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (vegetableId, { rejectWithValue, getState }) => {
    try {      
      // Get the current state to access the token
      const state = getState();
      const token = state.auth.token;
      
      // Prepare the payload with both vegetable_id and _token
      const payload = {
        vegetable_id: vegetableId,
        _token: token
      };
            
      const response = await api.post('/wishlist/toggle', payload);
      return { ...response.data, vegetableId };
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      return rejectWithValue(error.response?.data || 'Failed to toggle wishlist item');
    }
  }
);

// Async thunk for removing wishlist item
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (vegetableId, { rejectWithValue, getState }) => {
    try {      
      // Get the current state to access the token
      const state = getState();
      const token = state.auth.token;
      
      // For DELETE requests, we'll use the Bearer token in headers
      // and include the _token in the request body if needed
      const response = await api.delete(`/wishlist/${vegetableId}`, {
        data: {
          _token: token
        }
      });
      return { ...response.data, vegetableId };
    } catch (error) {
      console.error('Remove wishlist error:', error);
      return rejectWithValue(error.response?.data || 'Failed to remove wishlist item');
    }
  }
);

const initialState = {
  items: [],
  popularItems: [],
  itemStatus: {}, // Track wishlist status for items across the app
  loading: false,
  error: null,
  popularLoading: false,
  popularError: null,
  toggleLoading: false,
  toggleError: null,
  removeLoading: false,
  removeError: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
      state.toggleError = null;
      state.removeError = null;
    },
    updateWishlistStatus: (state, action) => {
      const { vegetableId, isWishlisted } = action.payload;
      // This is used to update the wishlist status in other components
      // without making API calls
      state.items = state.items.map(item => 
        item.id === vegetableId 
          ? { ...item, isWishlisted }
          : item
      );
    },
    setWishlistItemStatus: (state, action) => {
      const { vegetableId, isWishlisted } = action.payload;
      // This is used to track wishlist status for items displayed in other screens
      // It doesn't modify the items array but creates a separate tracking mechanism
      if (!state.itemStatus) {
        state.itemStatus = {};
      }
      state.itemStatus[vegetableId] = isWishlisted;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Fetch Popular Items
      .addCase(fetchPopularItems.pending, (state) => {
        state.popularLoading = true;
        state.popularError = null;
      })
      .addCase(fetchPopularItems.fulfilled, (state, action) => {
        state.popularLoading = false;
        state.popularItems = action.payload.data || [];
        state.popularError = null;
      })
      .addCase(fetchPopularItems.rejected, (state, action) => {
        state.popularLoading = false;
        state.popularError = action.payload;
      })

    // Toggle Wishlist Item
      .addCase(toggleWishlistItem.pending, (state) => {
        state.toggleLoading = true;
        state.toggleError = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.toggleLoading = false;
        const { vegetableId, wishlisted } = action.payload;
        
        // Update the item status tracking
        if (!state.itemStatus) {
          state.itemStatus = {};
        }
        state.itemStatus[vegetableId] = wishlisted;
        
        if (wishlisted) {
          // Item was added to wishlist - add it to our state
          // Check if item already exists to avoid duplicates
          const existingItem = state.items.find(item => item.id === vegetableId);
          if (!existingItem) {
            // Create a minimal item object for the wishlist
            // The full item data will be available when the wishlist is fetched
            state.items.push({
              id: vegetableId,
              isWishlisted: true,
              // Add other minimal required fields
              name: `Item ${vegetableId}`, // This will be updated when full data is fetched
            });
          }
        } else {
          // Item was removed from wishlist - remove it from our state
          state.items = state.items.filter(item => item.id !== vegetableId);
        }
        
        state.toggleError = null;
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.toggleLoading = false;
        state.toggleError = action.payload;
      })

    // Remove Wishlist Item
      .addCase(removeWishlistItem.pending, (state) => {
        state.removeLoading = true;
        state.removeError = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.removeLoading = false;
        const { vegetableId } = action.payload;
        state.items = state.items.filter(item => item.id !== vegetableId);
        state.removeError = null;
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.removeLoading = false;
        state.removeError = action.payload;
      });
  },
});

export const { clearWishlist, updateWishlistStatus, setWishlistItemStatus } = wishlistSlice.actions;
export default wishlistSlice.reducer;
