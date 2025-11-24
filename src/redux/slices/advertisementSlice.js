import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch all advertisements for the farmer
export const fetchAdvertisements = createAsyncThunk(
  'advertisement/fetchAdvertisements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/farmer/advertisements/all');
      return response.data;
    } catch (error) {
      console.error('Fetch advertisements error:', error);
      console.error('Error response:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch advertisements'
      );
    }
  }
);

// Async thunk to create a new advertisement
export const createAdvertisement = createAsyncThunk(
  'advertisement/createAdvertisement',
  async (advertisementData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', advertisementData.title);
      formData.append('message', advertisementData.message);
      formData.append('from', advertisementData.from);
      formData.append('to', advertisementData.to);

      const response = await api.post('/farmer/advertisements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create advertisement error:', error);
      console.error('Error response:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create advertisement'
      );
    }
  }
);

// Async thunk to fetch advertisement by ID
export const fetchAdvertisementById = createAsyncThunk(
  'advertisement/fetchAdvertisementById',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/farmer/advertisements/${advertisementId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch advertisement by ID error:', error);
      console.error('Error response:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch advertisement'
      );
    }
  }
);

// Async thunk to update advertisement
export const updateAdvertisement = createAsyncThunk(
  'advertisement/updateAdvertisement',
  async ({ advertisementId, advertisementData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', advertisementData.title);
      formData.append('message', advertisementData.message);
      formData.append('from', advertisementData.from);
      formData.append('to', advertisementData.to);

      const response = await api.post(`/farmer/advertisements/${advertisementId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update advertisement error:', error);
      console.error('Error response:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update advertisement'
      );
    }
  }
);

// Async thunk to delete advertisement
export const deleteAdvertisement = createAsyncThunk(
  'advertisement/deleteAdvertisement',
  async (advertisementId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/farmer/advertisements/${advertisementId}`);
      return { advertisementId, ...response.data };
    } catch (error) {
      console.error('Delete advertisement error:', error);
      console.error('Error response:', error.response?.data);
      
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete advertisement'
      );
    }
  }
);

const advertisementSlice = createSlice({
  name: 'advertisement',
  initialState: {
    advertisements: [],
    currentAdvertisement: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearAdvertisementError: (state) => {
      state.error = null;
    },
    clearAdvertisementSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearAdvertisements: (state) => {
      state.advertisements = [];
      state.error = null;
    },
    clearCurrentAdvertisement: (state) => {
      state.currentAdvertisement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch advertisements reducers
      .addCase(fetchAdvertisements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        state.advertisements = action.payload?.data || [];
        state.error = null;
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create advertisement reducers
      .addCase(createAdvertisement.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAdvertisement.fulfilled, (state, action) => {
        state.creating = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Advertisement created successfully';
        state.error = null;
        // Add the new advertisement to the beginning of the advertisements array
        if (action.payload?.data) {
          state.advertisements.unshift(action.payload.data);
        }
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch advertisement by ID reducers
      .addCase(fetchAdvertisementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisementById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdvertisement = action.payload?.data || null;
        state.error = null;
      })
      .addCase(fetchAdvertisementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update advertisement reducers
      .addCase(updateAdvertisement.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.updating = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Advertisement updated successfully';
        state.error = null;
        // Update the advertisement in the advertisements array
        if (action.payload?.data) {
          const index = state.advertisements.findIndex(ad => ad.id === action.payload.data.id);
          if (index !== -1) {
            state.advertisements[index] = action.payload.data;
          }
        }
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete advertisement reducers
      .addCase(deleteAdvertisement.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.deleting = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Advertisement deleted successfully';
        state.error = null;
        // Remove the advertisement from the advertisements array
        state.advertisements = state.advertisements.filter(ad => ad.id !== action.payload.advertisementId);
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearAdvertisementError, 
  clearAdvertisementSuccess,
  clearAdvertisements,
  clearCurrentAdvertisement
} = advertisementSlice.actions;

export default advertisementSlice.reducer;
