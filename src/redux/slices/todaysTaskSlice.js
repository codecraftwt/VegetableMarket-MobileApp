import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch today's tasks
export const fetchTodaysTasks = createAsyncThunk(
  'todaysTask/fetchTodaysTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/todays-task');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch today\'s tasks'
      );
    }
  }
);

const todaysTaskSlice = createSlice({
  name: 'todaysTask',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearTodaysTaskError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearTodaysTaskSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetTodaysTaskState: (state) => {
      state.tasks = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(task => task.id === taskId);
      if (task) {
        task.delivery_status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodaysTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchTodaysTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearTodaysTaskError, 
  clearTodaysTaskSuccess, 
  resetTodaysTaskState,
  updateTaskStatus 
} = todaysTaskSlice.actions;

export default todaysTaskSlice.reducer;
