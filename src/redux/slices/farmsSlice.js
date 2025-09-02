import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch all farms for the farmer
export const fetchFarms = createAsyncThunk(
  'farms/fetchFarms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/farmer/farms');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch farms'
      );
    }
  }
);

// Async thunk to fetch a specific farm by ID
export const fetchFarmById = createAsyncThunk(
  'farms/fetchFarmById',
  async (farmId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/farmer/farms/${farmId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch farm details'
      );
    }
  }
);

// Async thunk to add a new farm
export const addFarm = createAsyncThunk(
  'farms/addFarm',
  async (farmData, { rejectWithValue }) => {
    try {
      const response = await api.post('/farmer/farms', farmData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add farm'
      );
    }
  }
);

// Async thunk to update a farm
export const updateFarm = createAsyncThunk(
  'farms/updateFarm',
  async ({ farmId, farmData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/farmer/farms/${farmId}`, farmData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update farm'
      );
    }
  }
);

// Async thunk to delete a farm
export const deleteFarm = createAsyncThunk(
  'farms/deleteFarm',
  async (farmId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/farmer/farms/${farmId}`);
      return { ...response.data, farmId }; // Include farmId in response for state update
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete farm'
      );
    }
  }
);

// Async thunk to delete a farm image
export const deleteFarmImage = createAsyncThunk(
  'farms/deleteFarmImage',
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/farmer/farms/images/${imageId}`);
      return { ...response.data, imageId }; // Include imageId in response for state update
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete image'
      );
    }
  }
);

// Async thunk to add caption to farm image
export const addImageCaption = createAsyncThunk(
  'farms/addImageCaption',
  async ({ imageId, caption }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/farmer/farms/images/${imageId}/caption`, {
        caption: caption
      });
      return { ...response.data, imageId, caption }; // Include imageId and caption in response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update caption'
      );
    }
  }
);

// Async thunk to set main farm image
export const setMainImage = createAsyncThunk(
  'farms/setMainImage',
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/farmer/farms/images/${imageId}/main`);
      return { ...response.data, imageId }; // Include imageId in response for state update
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to set main image'
      );
    }
  }
);

const farmsSlice = createSlice({
  name: 'farms',
  initialState: {
    farms: [],
    selectedFarm: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearFarmsError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearFarmsSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetFarmsState: (state) => {
      state.farms = [];
      state.selectedFarm = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearSelectedFarm: (state) => {
      state.selectedFarm = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch farms
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch farm by ID
      .addCase(fetchFarmById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFarm = action.payload.data || null;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchFarmById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Add farm
      .addCase(addFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFarm.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.farms.push(action.payload.data);
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Farm added successfully';
        state.error = null;
      })
      .addCase(addFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update farm
      .addCase(updateFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.farms.findIndex(
            farm => farm.id === action.payload.data.id
          );
          if (index !== -1) {
            state.farms[index] = action.payload.data;
          }
          // Update selected farm if it's the same farm being updated
          if (state.selectedFarm && state.selectedFarm.id === action.payload.data.id) {
            state.selectedFarm = action.payload.data;
          }
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Farm updated successfully';
        state.error = null;
      })
      .addCase(updateFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete farm
      .addCase(deleteFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFarm.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted farm from the farms array
        state.farms = state.farms.filter(
          farm => farm.id !== action.payload.farmId
        );
        // Clear selected farm if it was the deleted one
        if (state.selectedFarm && state.selectedFarm.id === action.payload.farmId) {
          state.selectedFarm = null;
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Farm deleted successfully';
        state.error = null;
      })
      .addCase(deleteFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete farm image
      .addCase(deleteFarmImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFarmImage.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted image from farms array
        state.farms = state.farms.map(farm => ({
          ...farm,
          images: farm.images.filter(image => image.id !== action.payload.imageId)
        }));
        // Remove the deleted image from selected farm if it exists
        if (state.selectedFarm && state.selectedFarm.images) {
          state.selectedFarm = {
            ...state.selectedFarm,
            images: state.selectedFarm.images.filter(image => image.id !== action.payload.imageId)
          };
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Image deleted successfully';
        state.error = null;
      })
      .addCase(deleteFarmImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Add image caption
      .addCase(addImageCaption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addImageCaption.fulfilled, (state, action) => {
        state.loading = false;
        // Update the caption in farms array
        state.farms = state.farms.map(farm => ({
          ...farm,
          images: farm.images.map(image => 
            image.id === action.payload.imageId 
              ? { ...image, caption: action.payload.caption }
              : image
          )
        }));
        // Update the caption in selected farm if it exists
        if (state.selectedFarm && state.selectedFarm.images) {
          state.selectedFarm = {
            ...state.selectedFarm,
            images: state.selectedFarm.images.map(image => 
              image.id === action.payload.imageId 
                ? { ...image, caption: action.payload.caption }
                : image
            )
          };
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Caption updated successfully';
        state.error = null;
      })
      .addCase(addImageCaption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Set main image
      .addCase(setMainImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMainImage.fulfilled, (state, action) => {
        state.loading = false;
        // Update main image in farms array
        state.farms = state.farms.map(farm => ({
          ...farm,
          images: farm.images.map(image => ({
            ...image,
            is_main: image.id === action.payload.imageId ? 1 : 0
          })),
          main_image: farm.images.find(image => image.id === action.payload.imageId) || farm.main_image
        }));
        // Update main image in selected farm if it exists
        if (state.selectedFarm && state.selectedFarm.images) {
          state.selectedFarm = {
            ...state.selectedFarm,
            images: state.selectedFarm.images.map(image => ({
              ...image,
              is_main: image.id === action.payload.imageId ? 1 : 0
            })),
            main_image: state.selectedFarm.images.find(image => image.id === action.payload.imageId) || state.selectedFarm.main_image
          };
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Main image updated successfully';
        state.error = null;
      })
      .addCase(setMainImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearFarmsError, clearFarmsSuccess, resetFarmsState, clearSelectedFarm } = farmsSlice.actions;
export default farmsSlice.reducer;
