import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch sales report
export const fetchSalesReport = createAsyncThunk(
  'salesReport/fetchSalesReport',
  async (dateParams, { rejectWithValue }) => {
    try {
      const { start_date, end_date } = dateParams;
      console.log('=== API CALL START ===');
      console.log('Date Params received:', { start_date, end_date });
      console.log('Date types - start_date:', typeof start_date, 'end_date:', typeof end_date);
      
      // Build URL exactly like Postman
      const url = `/farmer/sales-report/export-pdf?start_date=${start_date}&end_date=${end_date}`;
      console.log('Full URL:', url);
      
      const response = await api.get(url);
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);
      console.log('=== API CALL END ===');
      return response.data;
    } catch (error) {
      console.log('=== API ERROR ===');
      console.log('Error:', error);
      console.log('Error Response:', error.response?.data);
      console.log('Error Status:', error.response?.status);
      console.log('=== API ERROR END ===');
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch sales report'
      );
    }
  }
);

// Async thunk to fetch farmer dashboard data
export const fetchFarmerDashboard = createAsyncThunk(
  'salesReport/fetchFarmerDashboard',
  async (_, { rejectWithValue }) => {
    try {
      console.log('=== DASHBOARD API CALL START ===');
      const response = await api.get('/farmer/dashboard');
      console.log('=== DASHBOARD API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);
      console.log('=== DASHBOARD API CALL END ===');
      return response.data;
    } catch (error) {
      console.log('=== DASHBOARD API ERROR ===');
      console.log('Error:', error);
      console.log('Error Response:', error.response?.data);
      console.log('Error Status:', error.response?.status);
      console.log('=== DASHBOARD API ERROR END ===');
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

const salesReportSlice = createSlice({
  name: 'salesReport',
  initialState: {
    salesReport: null,
    dashboardData: null,
    loading: false,
    dashboardLoading: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearSalesReportError: (state) => {
      state.error = null;
    },
    clearSalesReportSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearSalesReport: (state) => {
      state.salesReport = null;
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.dashboardData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sales Report reducers
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
        state.success = action.payload?.success || true;
        state.error = null;
        console.log('Sales Report State Updated:', state.salesReport);
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        console.log('Sales Report Error:', action.payload);
      })
      // Dashboard reducers
      .addCase(fetchFarmerDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchFarmerDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
        state.error = null;
        console.log('Dashboard Data Updated:', state.dashboardData);
      })
      .addCase(fetchFarmerDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
        console.log('Dashboard Error:', action.payload);
      });
  },
});

export const { clearSalesReportError, clearSalesReportSuccess, clearSalesReport, clearDashboardData } = salesReportSlice.actions;
export default salesReportSlice.reducer;
