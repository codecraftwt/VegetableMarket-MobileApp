import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching filtered vegetables
export const fetchFilteredVegetables = createAsyncThunk(
  'filter/fetchFilteredVegetables',
  async (filters, { rejectWithValue, getState }) => {
    try {
      console.log('Fetching filtered vegetables with filters:', filters);
      
      // Get the current state to access the token
      const state = getState();
      const token = state.auth.token;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.organic !== undefined) queryParams.append('organic', filters.organic);
      if (filters.price_min) queryParams.append('price_min', filters.price_min);
      if (filters.price_max) queryParams.append('price_max', filters.price_max);
      if (filters.category_id) queryParams.append('category_id', filters.category_id);
      if (filters.farmer_id) queryParams.append('farmer_id', filters.farmer_id);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.per_page) queryParams.append('per_page', filters.per_page);
      
      // Construct the URL with query parameters
      const url = `/vegetables?${queryParams.toString()}`;
      console.log('Filter API URL:', url);
      
      const response = await api.get(url);
      console.log('Filter API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch filtered vegetables error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch filtered vegetables');
    }
  }
);

// Async thunk for clearing filters and fetching all vegetables
export const clearFilters = createAsyncThunk(
  'filter/clearFilters',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('Clearing filters and fetching all vegetables...');
      
      const response = await api.get('/vegetables');
      console.log('Clear filters API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Clear filters error:', error);
      return rejectWithValue(error.response?.data || 'Failed to clear filters');
    }
  }
);

const initialState = {
  // Filtered data
  vegetables: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0,
  },
  
  // Loading and error states
  loading: false,
  error: null,
  
  // Current filters
  currentFilters: {
    search: '',
    organic: undefined,
    price_min: '',
    price_max: '',
    category_id: '',
    farmer_id: '',
    location: '',
    page: 1,
    per_page: 12,
  },
  
  // Filter options (for dropdowns, etc.)
  filterOptions: {
    categories: [],
    farmers: [],
    locations: [],
    priceRanges: [
      { label: 'Under ₹50', min: 0, max: 50 },
      { label: '₹50 - ₹100', min: 50, max: 100 },
      { label: '₹100 - ₹200', min: 100, max: 200 },
      { label: 'Above ₹200', min: 200, max: 1000 },
    ],
  },
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    // Update individual filter
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.currentFilters[key] = value;
    },
    
    // Update multiple filters at once
    updateFilters: (state, action) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },
    
    // Reset filters to initial state
    resetFilters: (state) => {
      state.currentFilters = {
        search: '',
        organic: undefined,
        price_min: '',
        price_max: '',
        category_id: '',
        farmer_id: '',
        location: '',
        page: 1,
        per_page: 12,
      };
    },
    
    // Set filter options
    setFilterOptions: (state, action) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Filtered Vegetables
    builder
      .addCase(fetchFilteredVegetables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredVegetables.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables = action.payload.data.data || [];
        state.pagination = {
          current_page: action.payload.data.current_page || 1,
          last_page: action.payload.data.last_page || 1,
          per_page: action.payload.data.per_page || 12,
          total: action.payload.data.total || 0,
          from: action.payload.data.from || 0,
          to: action.payload.data.to || 0,
        };
        state.error = null;
      })
      .addCase(fetchFilteredVegetables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear Filters
    builder
      .addCase(clearFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.vegetables = action.payload.data.data || [];
        state.pagination = {
          current_page: action.payload.data.current_page || 1,
          last_page: action.payload.data.last_page || 1,
          per_page: action.payload.data.per_page || 12,
          total: action.payload.data.total || 0,
          from: action.payload.data.from || 0,
          to: action.payload.data.to || 0,
        };
        state.currentFilters = {
          search: '',
          organic: undefined,
          price_min: '',
          price_max: '',
          category_id: '',
          farmer_id: '',
          location: '',
          page: 1,
          per_page: 12,
        };
        state.error = null;
      })
      .addCase(clearFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  updateFilter, 
  updateFilters, 
  resetFilters, 
  setFilterOptions, 
  clearError 
} = filterSlice.actions;

export default filterSlice.reducer;
