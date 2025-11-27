import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import { 
  saveGuestWishlist, 
  getGuestWishlist, 
  clearGuestWishlist 
} from '../../utils/guestStorage';

// Async thunk for fetching wishlist items
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    try {      
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, fetch guest wishlist from AsyncStorage
      if (!isLoggedIn) {
        const guestWishlist = await getGuestWishlist();
        return {
          success: true,
          data: guestWishlist,
          guestMode: true
        };
      }
      
      // If logged in, fetch from API
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      // If 401, user might have logged out, fetch guest wishlist
      if (error.response?.status === 401) {
        const guestWishlist = await getGuestWishlist();
        return {
          success: true,
          data: guestWishlist,
          guestMode: true
        };
      }
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
  async (vegetableIdOrObject, { rejectWithValue, getState }) => {
    // Handle both cases: just ID or object with { vegetableId, vegetable }
    const vegetableId = typeof vegetableIdOrObject === 'object' 
      ? vegetableIdOrObject.vegetableId 
      : vegetableIdOrObject;
    const vegetable = typeof vegetableIdOrObject === 'object' 
      ? vegetableIdOrObject.vegetable 
      : null;
    try {      
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, handle locally (guest mode)
      if (!isLoggedIn) {
        const guestWishlist = await getGuestWishlist();
        const existingItem = guestWishlist.find(item => 
          (item.id === vegetableId) || (item.vegetable_id === vegetableId)
        );
        
        let wishlisted;
        if (existingItem) {
          // Remove from wishlist
          const updatedWishlist = guestWishlist.filter(item => 
            (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
          );
          await saveGuestWishlist(updatedWishlist);
          wishlisted = false;
        } else {
          // Add to wishlist - ensure complete vegetable data is stored
          const newItem = {
            ...vegetable, // Spread all vegetable properties first
            id: vegetableId, // Ensure id is set correctly
            vegetable_id: vegetableId || vegetable?.id, // Ensure vegetable_id is set
            // Ensure essential fields are present
            name: vegetable?.name || 'Unknown Item',
            price_per_kg: vegetable?.price_per_kg,
            unit_type: vegetable?.unit_type || 'kg',
            images: vegetable?.images || [],
          };
          guestWishlist.push(newItem);
          await saveGuestWishlist(guestWishlist);
          wishlisted = true;
        }
        
        // Reload guest wishlist to get complete data
        const updatedGuestWishlist = await getGuestWishlist();
        
        return { 
          success: true, 
          vegetableId, 
          wishlisted,
          vegetable: vegetable, // Return vegetable data for display
          guestWishlist: updatedGuestWishlist, // Return updated wishlist with complete data
          guestMode: true
        };
      }
      
      // If logged in, make API call
      const token = state.auth.token;
      const payload = {
        vegetable_id: vegetableId,
        _token: token
      };
            
      const response = await api.post('/wishlist/toggle', payload);
      return { ...response.data, vegetableId };
    } catch (error) {
      // If 401, user might have logged out, handle in guest mode
      if (error.response?.status === 401) {
        const guestWishlist = await getGuestWishlist();
        const existingItem = guestWishlist.find(item => 
          (item.id === vegetableId) || (item.vegetable_id === vegetableId)
        );
        
        let wishlisted;
        if (existingItem) {
          const updatedWishlist = guestWishlist.filter(item => 
            (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
          );
          await saveGuestWishlist(updatedWishlist);
          wishlisted = false;
        } else {
          // Try to get vegetable data from state if available
          const state = getState();
          const vegetables = state.vegetables?.vegetables || [];
          const vegetable = vegetables.find(v => v.id === vegetableId);
          
          const newItem = {
            id: vegetableId,
            vegetable_id: vegetableId,
            name: vegetable?.name || 'Unknown Item',
            price_per_kg: vegetable?.price_per_kg,
            unit_type: vegetable?.unit_type || 'kg',
            images: vegetable?.images || [],
            description: vegetable?.description,
            category_id: vegetable?.category_id,
            category: vegetable?.category,
            farmer_id: vegetable?.farmer_id,
            farmer: vegetable?.farmer,
            stock_kg: vegetable?.stock_kg,
            quantity_available: vegetable?.quantity_available,
            is_organic: vegetable?.is_organic,
            ...vegetable
          };
          guestWishlist.push(newItem);
          await saveGuestWishlist(guestWishlist);
          wishlisted = true;
        }
        
        // Reload guest wishlist to get complete data
        const updatedGuestWishlist = await getGuestWishlist();
        
        return { 
          success: true, 
          vegetableId, 
          wishlisted,
          vegetable: vegetable, // Return vegetable data
          guestWishlist: updatedGuestWishlist, // Return updated wishlist with complete data
          guestMode: true
        };
      }
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
      const state = getState();
      const isLoggedIn = state.auth.isLoggedIn;
      
      // If not logged in, handle locally (guest mode)
      if (!isLoggedIn) {
        const guestWishlist = await getGuestWishlist();
        const updatedWishlist = guestWishlist.filter(item => 
          (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
        );
        await saveGuestWishlist(updatedWishlist);
        return { 
          success: true, 
          vegetableId,
          guestMode: true
        };
      }
      
      // If logged in, make API call
      const token = state.auth.token;
      const response = await api.delete(`/wishlist/${vegetableId}`, {
        data: {
          _token: token
        }
      });
      return { ...response.data, vegetableId };
    } catch (error) {
      // If 401, user might have logged out, handle in guest mode
      if (error.response?.status === 401) {
        const guestWishlist = await getGuestWishlist();
        const updatedWishlist = guestWishlist.filter(item => 
          (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
        );
        await saveGuestWishlist(updatedWishlist);
        return { 
          success: true, 
          vegetableId,
          guestMode: true
        };
      }
      console.error('Remove wishlist error:', error);
      return rejectWithValue(error.response?.data || 'Failed to remove wishlist item');
    }
  }
);

// Load guest wishlist from AsyncStorage
export const loadGuestWishlist = createAsyncThunk(
  'wishlist/loadGuestWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const guestWishlist = await getGuestWishlist();
      return {
        items: guestWishlist
      };
    } catch (error) {
      return rejectWithValue('Failed to load guest wishlist');
    }
  }
);

// Sync guest wishlist to server after login
export const syncGuestWishlistToServer = createAsyncThunk(
  'wishlist/syncGuestWishlistToServer',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const guestWishlist = await getGuestWishlist();

      // Check if user is logged in and has role_id 3 (customer)2
      const userRoleId = state.auth.user?.role_id;

      if (userRoleId !== 3) {
        // If role_id is not 3, don't sync data and return early
        return { success: true, synced: false, message: 'User is not a customer' };
      }


      if (guestWishlist.length === 0) {
        return { success: true, synced: false };
        // return { success: true, synced: false, reason: 'empty_wishlist' };
      }
      
      // Add each guest wishlist item to server
      const token = state.auth.token;
      const syncPromises = guestWishlist.map(async (item) => {
        try {
          const vegetableId = item.id || item.vegetable_id;
          await api.post('/wishlist/toggle', {
            vegetable_id: vegetableId,
            _token: token
          });
        } catch (error) {
          console.error(`Failed to sync wishlist item ${item.id || item.vegetable_id}:`, error);
        }
      });
      
      await Promise.all(syncPromises);
      
      // Clear guest wishlist after successful sync
      await clearGuestWishlist();
      
      // Fetch updated wishlist from server
      const response = await api.get('/wishlist');
      
      return {
        success: true,
        synced: true,
        data: response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to sync guest wishlist');
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
    addWishlistItemLocally: (state, action) => {
      const { vegetableId, vegetable } = action.payload;
      const existingItem = state.items.find(item => 
        (item.id === vegetableId) || (item.vegetable_id === vegetableId)
      );
      
      if (!existingItem) {
        state.items.push({
          id: vegetableId,
          vegetable_id: vegetableId,
          ...vegetable
        });
      }
      
      // Update item status
      if (!state.itemStatus) {
        state.itemStatus = {};
      }
      state.itemStatus[vegetableId] = true;
    },
    removeWishlistItemLocally: (state, action) => {
      const { vegetableId } = action.payload;
      state.items = state.items.filter(item => 
        (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
      );
      
      // Update item status
      if (!state.itemStatus) {
        state.itemStatus = {};
      }
      state.itemStatus[vegetableId] = false;
    },
    // Save wishlist to AsyncStorage (for guest mode)
    saveWishlistToStorage: (state) => {
      // This will be called after state updates to save to AsyncStorage
      saveGuestWishlist(state.items).catch(err => {
        console.error('Failed to save guest wishlist:', err);
      });
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
        let items = action.payload.data || [];
        
        // Normalize wishlist items - handle nested vegetable structure from API
        items = items.map(item => {
          // If item has nested vegetable object (API structure), flatten it
          if (item.vegetable) {
            return {
              ...item.vegetable,
              id: item.vegetable.id || item.vegetable_id || item.id,
              vegetable_id: item.vegetable_id || item.vegetable.id || item.id,
              // Preserve wishlist-specific fields
              wishlist_id: item.id,
            };
          }
          // If item is already flat, use it as is
          return {
            ...item,
            id: item.id || item.vegetable_id,
            vegetable_id: item.vegetable_id || item.id,
          };
        });
        
        state.items = items;
        state.error = null;
        
        // Save to AsyncStorage if in guest mode
        if (action.payload.guestMode) {
          saveGuestWishlist(state.items).catch(err => {
            console.error('Failed to save guest wishlist:', err);
          });
        }
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
        const { vegetableId, wishlisted, vegetable, guestMode } = action.payload;
        
        // Update the item status tracking
        if (!state.itemStatus) {
          state.itemStatus = {};
        }
        state.itemStatus[vegetableId] = wishlisted;
        
        // If in guest mode, use the complete guest wishlist data
        if (guestMode && action.payload.guestWishlist) {
          // Use the complete guest wishlist data returned from the action
          state.items = action.payload.guestWishlist || [];
        } else if (guestMode) {
          // If guest mode but no wishlist data in payload, reload from AsyncStorage
          getGuestWishlist().then(guestWishlist => {
            state.items = guestWishlist || [];
          }).catch(err => {
            console.error('Failed to reload guest wishlist in reducer:', err);
          });
        } else {
          // For logged-in users, handle state updates normally
          if (wishlisted) {
            // Item was added - for logged-in users, wait for fetchWishlist
            // Don't add minimal item here
          } else {
            // Item was removed from wishlist - remove it from our state
            state.items = state.items.filter(item => 
              (item.id !== vegetableId) && (item.vegetable_id !== vegetableId)
            );
          }
        }
        
        // If in guest mode, refresh from AsyncStorage to get complete data
        if (guestMode) {
          // Load guest wishlist to ensure we have complete data
          getGuestWishlist().then(guestWishlist => {
            state.items = guestWishlist || [];
          }).catch(err => {
            console.error('Failed to refresh guest wishlist:', err);
          });
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

    // Load guest wishlist
    builder
      .addCase(loadGuestWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGuestWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        // Clear itemStatus when loading guest wishlist to reset wishlist indicators
        state.itemStatus = {};
        state.error = null;
      })
      .addCase(loadGuestWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Sync guest wishlist to server
    builder
      .addCase(syncGuestWishlistToServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncGuestWishlistToServer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.synced && action.payload.data) {
          // Normalize wishlist items - handle nested vegetable structure from API
          let items = action.payload.data.data || [];
          items = items.map(item => {
            // If item has nested vegetable object (API structure), flatten it
            if (item.vegetable) {
              return {
                ...item.vegetable,
                id: item.vegetable.id || item.vegetable_id || item.id,
                vegetable_id: item.vegetable_id || item.vegetable.id || item.id,
                wishlist_id: item.id,
              };
            }
            return {
              ...item,
              id: item.id || item.vegetable_id,
              vegetable_id: item.vegetable_id || item.id,
            };
          });
          state.items = items;

          // Rebuild itemStatus from synced items
          state.itemStatus = {};
          items.forEach(item => {
            const vegetableId = item.id || item.vegetable_id;
            if (vegetableId) {
              state.itemStatus[vegetableId] = true;
            }
          });
        }
        state.error = null;
      })
      .addCase(syncGuestWishlistToServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear wishlist when user logs out
    builder
      .addMatcher(
        (action) => action.type === 'auth/logout' || action.type === 'auth/clearAuth',
        (state) => {
          // Clear wishlist items and item status when user logs out
          state.items = [];
          state.itemStatus = {};
          state.error = null;
          state.toggleError = null;
          state.removeError = null;
          // Note: Don't clear guest wishlist from AsyncStorage on logout
          // It should only be cleared when successfully synced (in syncGuestWishlistToServer)
          // This preserves guest wishlist when logging in with non-customer roles
        }
      );
  },
});

export const { 
  clearWishlist, 
  updateWishlistStatus, 
  setWishlistItemStatus,
  addWishlistItemLocally,
  removeWishlistItemLocally,
  saveWishlistToStorage
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
