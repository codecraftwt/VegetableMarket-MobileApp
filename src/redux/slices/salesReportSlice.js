import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch sales report
export const fetchSalesReport = createAsyncThunk(
  'salesReport/fetchSalesReport',
  async (dateParams, { rejectWithValue }) => {
    try {
      const { start_date, end_date } = dateParams;
      const url = `/farmer/sales-report?start_date=${start_date}&end_date=${end_date}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
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
      const response = await api.get('/farmer/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

// Async thunk to export sales report as PDF
export const exportSalesReportPDF = createAsyncThunk(
  'salesReport/exportSalesReportPDF',
  async (dateParams, { rejectWithValue }) => {
    try {
      const { start_date, end_date } = dateParams;
      const url = `/farmer/sales-report/export-pdf?start_date=${start_date}&end_date=${end_date}`;
      const response = await api.get(url);
      return { data: response.data, start_date, end_date };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to export PDF'
      );
    }
  }
);

// Async thunk to export sales report as Excel
export const exportSalesReportExcel = createAsyncThunk(
  'salesReport/exportSalesReportExcel',
  async (dateParams, { rejectWithValue }) => {
    try {
      const { start_date, end_date } = dateParams;
      const url = `/farmer/sales-report/export-excel?start_date=${start_date}&end_date=${end_date}`;
      const response = await api.get(url);
      return { data: response.data, start_date, end_date };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to export Excel'
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
    exportingPDF: false,
    exportingExcel: false,
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
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
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
      })
      .addCase(fetchFarmerDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      })
      // Export PDF reducers
      .addCase(exportSalesReportPDF.pending, (state) => {
        state.exportingPDF = true;
        state.error = null;
      })
      .addCase(exportSalesReportPDF.fulfilled, (state) => {
        state.exportingPDF = false;
        state.error = null;
      })
      .addCase(exportSalesReportPDF.rejected, (state, action) => {
        state.exportingPDF = false;
        state.error = action.payload;
      })
      // Export Excel reducers
      .addCase(exportSalesReportExcel.pending, (state) => {
        state.exportingExcel = true;
        state.error = null;
      })
      .addCase(exportSalesReportExcel.fulfilled, (state) => {
        state.exportingExcel = false;
        state.error = null;
      })
      .addCase(exportSalesReportExcel.rejected, (state, action) => {
        state.exportingExcel = false;
        state.error = action.payload;
      });
  },
});

export const { clearSalesReportError, clearSalesReportSuccess, clearSalesReport, clearDashboardData } = salesReportSlice.actions;
export default salesReportSlice.reducer;
