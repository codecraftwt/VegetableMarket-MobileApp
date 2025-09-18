import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch all advertisements for the farmer
export const fetchAdvertisements = createAsyncThunk(
  'advertisement/fetchAdvertisements',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching advertisements...');
      const response = await api.get('/farmer/advertisements/all');
      console.log('Advertisements response:', response.data);
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

const advertisementSlice = createSlice({
  name: 'advertisement',
  initialState: {
    advertisements: [],
    loading: false,
    creating: false,
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
      });
  },
});

export const { 
  clearAdvertisementError, 
  clearAdvertisementSuccess,
  clearAdvertisements
} = advertisementSlice.actions;

export default advertisementSlice.reducer;
