import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching all addresses
export const fetchAllAddresses = createAsyncThunk(
  'addresses/fetchAllAddresses',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching addresses from API...');
      const response = await api.get('/addresses');
      console.log('Addresses API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch addresses error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch addresses');
    }
  }
);

// Async thunk for adding new address
export const addAddress = createAsyncThunk(
  'addresses/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add address');
    }
  }
);

// Async thunk for updating address
export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      console.log('Updating address with ID:', addressId);
      console.log('Update address data:', addressData);
      const response = await api.put(`/addresses/${addressId}`, addressData);
      console.log('Update address API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update address error:', error);
      return rejectWithValue(error.response?.data || 'Failed to update address');
    }
  }
);

// Async thunk for deleting address
export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      console.log('Deleting address with ID:', addressId);
      const response = await api.delete(`/addresses/${addressId}`);
      console.log('Delete address API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete address error:', error);
      return rejectWithValue(error.response?.data || 'Failed to delete address');
    }
  }
);

// Async thunk for setting primary address - FIXED ENDPOINT (SINGULAR)
export const setPrimaryAddress = createAsyncThunk(
  'addresses/setPrimaryAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      console.log('Setting primary address with ID:', addressId);
      console.log('CORRECT API endpoint: /address/' + addressId + '/set-primary');
      // Using SINGULAR 'address' not 'addresses' as per API spec
      const response = await api.post(`/address/${addressId}/set-primary`);
      console.log('Set primary address API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Set primary address error:', error);
      console.error('Error details:', error.response?.data);
      return rejectWithValue(error.response?.data || 'Failed to set primary address');
    }
  }
);

const initialState = {
  addresses: [],
  primaryAddress: null,
  loading: false,
  error: null,
  addLoading: false,
  addError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  setPrimaryLoading: false,
  setPrimaryError: null,
};

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearAddresses: (state) => {
      state.addresses = [];
      state.primaryAddress = null;
      state.error = null;
      state.addError = null;
      state.updateError = null;
      state.deleteError = null;
      state.setPrimaryError = null;
    },
    setPrimaryAddressLocal: (state, action) => {
      // Update the primary address locally without API call
      const addressId = action.payload;
      state.primaryAddress = state.addresses.find(addr => addr.id === addressId) || null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Addresses
    builder
      .addCase(fetchAllAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.data || [];
        // Set the first address as primary if no primary is set
        if (state.addresses.length > 0 && !state.primaryAddress) {
          state.primaryAddress = state.addresses[0];
        }
        state.error = null;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Address
    builder
      .addCase(addAddress.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addLoading = false;
        if (action.payload.data) {
          state.addresses.push(action.payload.data);
          // If this is the first address, set it as primary
          if (state.addresses.length === 1) {
            state.primaryAddress = action.payload.data;
          }
        }
        state.addError = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload;
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (action.payload.data) {
          const index = state.addresses.findIndex(addr => addr.id === action.payload.data.id);
          if (index !== -1) {
            state.addresses[index] = action.payload.data;
          }
          // Update primary address if it was the one being updated
          if (state.primaryAddress && state.primaryAddress.id === action.payload.data.id) {
            state.primaryAddress = action.payload.data;
          }
        }
        state.updateError = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // Delete Address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const addressId = action.meta.arg;
        state.addresses = state.addresses.filter(addr => addr.id !== addressId);
        // If the deleted address was primary, set the first remaining address as primary
        if (state.primaryAddress && state.primaryAddress.id === addressId) {
          state.primaryAddress = state.addresses.length > 0 ? state.addresses[0] : null;
        }
        state.deleteError = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

    // Set Primary Address
      .addCase(setPrimaryAddress.pending, (state) => {
        state.setPrimaryLoading = true;
        state.setPrimaryError = null;
      })
      .addCase(setPrimaryAddress.fulfilled, (state, action) => {
        state.setPrimaryLoading = false;
        const addressId = action.meta.arg;
        state.primaryAddress = state.addresses.find(addr => addr.id === addressId) || null;
        state.setPrimaryError = null;
      })
      .addCase(setPrimaryAddress.rejected, (state, action) => {
        state.setPrimaryLoading = false;
        state.setPrimaryError = action.payload;
      });
  },
});

export const { clearAddresses, setPrimaryAddressLocal } = addressesSlice.actions;
export default addressesSlice.reducer;
