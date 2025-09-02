import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch all farmer vegetables
export const fetchFarmerVegetables = createAsyncThunk(
  'farmerVegetables/fetchFarmerVegetables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/farmer/vegetables');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vegetables'
      );
    }
  }
);

// Async thunk to fetch vegetable by ID
export const fetchVegetableById = createAsyncThunk(
  'farmerVegetables/fetchVegetableById',
  async (vegetableId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/farmer/vegetables/${vegetableId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch vegetable details'
      );
    }
  }
);

// Async thunk to add new vegetable
export const addVegetable = createAsyncThunk(
  'farmerVegetables/addVegetable',
  async (vegetableData, { rejectWithValue }) => {
    try {
      const response = await api.post('/farmer/vegetables', vegetableData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add vegetable'
      );
    }
  }
);

// Async thunk to update vegetable
export const updateVegetable = createAsyncThunk(
  'farmerVegetables/updateVegetable',
  async ({ vegetableId, vegetableData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/farmer/vegetables/${vegetableId}`, vegetableData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update vegetable'
      );
    }
  }
);

// Async thunk to delete vegetable
export const deleteVegetable = createAsyncThunk(
  'farmerVegetables/deleteVegetable',
  async (vegetableId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/farmer/vegetables/${vegetableId}`);
      return { ...response.data, vegetableId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete vegetable'
      );
    }
  }
);

// Async thunk to update vegetable status
export const updateVegetableStatus = createAsyncThunk(
  'farmerVegetables/updateVegetableStatus',
  async ({ vegetableId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/farmer/vegetables/${vegetableId}/status`, {
        status: status
      });
      return { ...response.data, vegetableId, status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update vegetable status'
      );
    }
  }
);

const farmerVegetablesSlice = createSlice({
  name: 'farmerVegetables',
  initialState: {
    vegetables: [],
    selectedVegetable: null,
    loading: false,
    loadingVegetable: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearFarmerVegetablesError: (state) => {
      state.error = null;
    },
    clearFarmerVegetablesSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearSelectedVegetable: (state) => {
      state.selectedVegetable = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vegetables
      .addCase(fetchFarmerVegetables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmerVegetables.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables = action.payload.data;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchFarmerVegetables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vegetable by ID
      .addCase(fetchVegetableById.pending, (state) => {
        state.loadingVegetable = true;
        state.error = null;
      })
      .addCase(fetchVegetableById.fulfilled, (state, action) => {
        state.loadingVegetable = false;
        state.selectedVegetable = action.payload.data;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchVegetableById.rejected, (state, action) => {
        state.loadingVegetable = false;
        state.error = action.payload;
      })
      
      // Add vegetable
      .addCase(addVegetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVegetable.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables.unshift(action.payload.data);
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(addVegetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update vegetable
      .addCase(updateVegetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVegetable.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVegetable = action.payload.data;
        state.vegetables = state.vegetables.map(vegetable =>
          vegetable.id === updatedVegetable.id ? updatedVegetable : vegetable
        );
        if (state.selectedVegetable && state.selectedVegetable.id === updatedVegetable.id) {
          state.selectedVegetable = updatedVegetable;
        }
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateVegetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete vegetable
      .addCase(deleteVegetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVegetable.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables = state.vegetables.filter(
          vegetable => vegetable.id !== action.payload.vegetableId
        );
        if (state.selectedVegetable && state.selectedVegetable.id === action.payload.vegetableId) {
          state.selectedVegetable = null;
        }
        state.success = action.payload.success;
        state.message = action.payload.message || 'Vegetable deleted successfully';
        state.error = null;
      })
      .addCase(deleteVegetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update vegetable status
      .addCase(updateVegetableStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVegetableStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { vegetableId, status } = action.payload;
        state.vegetables = state.vegetables.map(vegetable =>
          vegetable.id === vegetableId ? { ...vegetable, status: status } : vegetable
        );
        if (state.selectedVegetable && state.selectedVegetable.id === vegetableId) {
          state.selectedVegetable = { ...state.selectedVegetable, status: status };
        }
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateVegetableStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearFarmerVegetablesError,
  clearFarmerVegetablesSuccess,
  clearSelectedVegetable,
} = farmerVegetablesSlice.actions;

export default farmerVegetablesSlice.reducer;
