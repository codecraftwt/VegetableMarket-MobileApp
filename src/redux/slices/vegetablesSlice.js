import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching all vegetables
export const fetchVegetables = createAsyncThunk(
  'vegetables/fetchVegetables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vegetables');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch vegetables:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch vegetables');
    }
  }
);

// Async thunk for fetching vegetable categories
export const fetchVegetableCategories = createAsyncThunk(
  'vegetables/fetchVegetableCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/vegetable-category');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch categories:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch categories');
    }
  }
);

// Async thunk for fetching farmer profile
export const fetchFarmerProfile = createAsyncThunk(
  'vegetables/fetchFarmerProfile',
  async (farmerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/farmer-profile/${farmerId}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch farmer profile:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch farmer profile');
    }
  }
);

const initialState = {
  vegetables: [],
  categories: [],
  farmerProfile: null,
  loading: false,
  categoriesLoading: false,
  farmerProfileLoading: false,
  error: null,
  categoriesError: null,
  farmerProfileError: null,
};

const vegetablesSlice = createSlice({
  name: 'vegetables',
  initialState,
  reducers: {
    clearVegetables: (state) => {
      state.vegetables = [];
      state.categories = [];
      state.error = null;
      state.categoriesError = null;
    },
    setVegetables: (state, action) => {
      state.vegetables = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
      state.categoriesError = null;
      state.farmerProfileError = null;
    },
    clearFarmerProfile: (state) => {
      state.farmerProfile = null;
      state.farmerProfileError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Vegetables
    builder
      .addCase(fetchVegetables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVegetables.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables = action.payload.data.data || [];
        state.error = null;
      })
      .addCase(fetchVegetables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Categories
    builder
      .addCase(fetchVegetableCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchVegetableCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.data || [];
        state.categoriesError = null;
      })
      .addCase(fetchVegetableCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      });

    // Fetch Farmer Profile
    builder
      .addCase(fetchFarmerProfile.pending, (state) => {
        state.farmerProfileLoading = true;
        state.farmerProfileError = null;
      })
      .addCase(fetchFarmerProfile.fulfilled, (state, action) => {
        state.farmerProfileLoading = false;
        state.farmerProfile = action.payload.data || null;
        state.farmerProfileError = null;
      })
      .addCase(fetchFarmerProfile.rejected, (state, action) => {
        state.farmerProfileLoading = false;
        state.farmerProfileError = action.payload;
      });
  },
});

// Selectors
export const selectVegetables = (state) => state.vegetables.vegetables;
export const selectCategories = (state) => state.vegetables.categories;
export const selectFarmerProfile = (state) => state.vegetables.farmerProfile;
export const selectVegetablesLoading = (state) => state.vegetables.loading;
export const selectCategoriesLoading = (state) => state.vegetables.categoriesLoading;
export const selectFarmerProfileLoading = (state) => state.vegetables.farmerProfileLoading;
export const selectVegetablesError = (state) => state.vegetables.error;
export const selectCategoriesError = (state) => state.vegetables.categoriesError;
export const selectFarmerProfileError = (state) => state.vegetables.farmerProfileError;

// Helper selector for popular items (first 4)
export const selectPopularItems = (state) => state.vegetables.vegetables.slice(0, 4);

// Helper selector for products by category
export const selectProductsByCategory = (state, categoryId) => {
  if (categoryId === 'all') return state.vegetables.vegetables;
  return state.vegetables.vegetables.filter(product => 
    product.category?.id === categoryId || 
    product.category?.name?.toLowerCase() === categoryId?.toLowerCase()
  );
};

export const { clearVegetables, setVegetables, setCategories, clearErrors, clearFarmerProfile } = vegetablesSlice.actions;
export default vegetablesSlice.reducer;
