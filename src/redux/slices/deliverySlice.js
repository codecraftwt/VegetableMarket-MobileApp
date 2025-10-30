import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch available deliveries
export const fetchAvailableDeliveries = createAsyncThunk(
  'delivery/fetchAvailableDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/available-deliveries');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch available deliveries'
      );
    }
  }
);

// Async thunk to fetch assigned deliveries
export const fetchAssignedDeliveries = createAsyncThunk(
  'delivery/fetchAssignedDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/delivery/assigned-deliveries');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assigned deliveries'
      );
    }
  }
);

// Async thunk to assign delivery to self
// export const assignDeliveryToSelf = createAsyncThunk(
//   'delivery/assignDeliveryToSelf',
//   async (orderId, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append('order_id', orderId);

//       const response = await api.post('/delivery/assign-delivery', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to assign delivery'
//       );
//     }
//   }
// );
export const assignDeliveryToSelf = createAsyncThunk(
  'delivery/assignDeliveryToSelf',
  async (orderId, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      
      const response = await api.post('/delivery/assign-delivery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { orderId, data: response.data };
    } catch (error) {
      return rejectWithValue({
        orderId,
        error: error.response?.data?.message || 'Failed to assign delivery'
      });
    }
  }
);

// Async thunk to fetch delivery details
export const fetchDeliveryDetails = createAsyncThunk(
  'delivery/fetchDeliveryDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/delivery/delivery-details/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch delivery details'
      );
    }
  }
);

// Async thunk to fetch assigned delivery details
export const fetchAssignedDeliveryDetails = createAsyncThunk(
  'delivery/fetchAssignedDeliveryDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/delivery/assigned-delivery-detail/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assigned delivery details'
      );
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    availableDeliveries: [],
    assignedDeliveries: [],
    deliveryDetails: null,
    assignedDeliveryDetails: null,
    loading: false,
    loadingAvailable: false,
    loadingAssigned: false,
    loadingDetails: false,
    loadingAssignedDetails: false,
    //assigningDelivery: false,
    assigningDelivery: {},
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearDeliveryError: (state) => {
      state.error = null;
      state.message = '';
    },
    clearDeliverySuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    resetDeliveryState: (state) => {
      state.availableDeliveries = [];
      state.assignedDeliveries = [];
      state.deliveryDetails = null;
      state.assignedDeliveryDetails = null;
      state.loading = false;
      state.loadingAvailable = false;
      state.loadingAssigned = false;
      state.loadingDetails = false;
      state.loadingAssignedDetails = false;
      //state.assigningDelivery = false;
      state.assigningDelivery = {};
      state.error = null;
      state.success = false;
      state.message = '';
     },
    clearAssigningState: (state, action) => {
      const orderId = action.payload;
      delete state.assigningDelivery[orderId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available deliveries
      .addCase(fetchAvailableDeliveries.pending, (state) => {
        state.loadingAvailable = true;
        state.error = null;
      })
      .addCase(fetchAvailableDeliveries.fulfilled, (state, action) => {
        state.loadingAvailable = false;
        state.availableDeliveries = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchAvailableDeliveries.rejected, (state, action) => {
        state.loadingAvailable = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch assigned deliveries
      .addCase(fetchAssignedDeliveries.pending, (state) => {
        state.loadingAssigned = true;
        state.error = null;
      })
      .addCase(fetchAssignedDeliveries.fulfilled, (state, action) => {
        state.loadingAssigned = false;
        state.assignedDeliveries = action.payload.data || [];
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchAssignedDeliveries.rejected, (state, action) => {
        state.loadingAssigned = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Assign delivery to self
      // .addCase(assignDeliveryToSelf.pending, (state) => {
      //   state.assigningDelivery = true;
      //   state.error = null;
      // })
      // .addCase(assignDeliveryToSelf.fulfilled, (state, action) => {
      //   state.assigningDelivery = false;
      //   state.success = action.payload.success;
      //   state.message = action.payload.message;
      //   state.error = null;
      // })
      // .addCase(assignDeliveryToSelf.rejected, (state, action) => {
      //   state.assigningDelivery = false;
      //   state.error = action.payload;
      //   state.success = false;
      // })
      // Assign delivery to self - UPDATED CASES
      .addCase(assignDeliveryToSelf.pending, (state, action) => {
        const orderId = action.meta.arg;
        state.assigningDelivery[orderId] = true; // Set loading for specific order
        state.error = null;
      })
      .addCase(assignDeliveryToSelf.fulfilled, (state, action) => {
        const { orderId, data } = action.payload;
        state.assigningDelivery[orderId] = false; // Clear loading for specific order
        state.success = data.success;
        state.message = data.message;
        state.error = null;

        // Remove the assigned delivery from available list
        state.availableDeliveries = state.availableDeliveries.filter(
          delivery => delivery.id !== orderId
        );
      })
      .addCase(assignDeliveryToSelf.rejected, (state, action) => {
        const { orderId, error } = action.payload;
        state.assigningDelivery[orderId] = false; // Clear loading for specific order
        state.error = error;
        state.success = false;
      })

      // Fetch delivery details
      .addCase(fetchDeliveryDetails.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchDeliveryDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.deliveryDetails = action.payload;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchDeliveryDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Fetch assigned delivery details
      .addCase(fetchAssignedDeliveryDetails.pending, (state) => {
        state.loadingAssignedDetails = true;
        state.error = null;
      })
      .addCase(fetchAssignedDeliveryDetails.fulfilled, (state, action) => {
        state.loadingAssignedDetails = false;
        state.assignedDeliveryDetails = action.payload;
        state.success = action.payload.success;
        state.error = null;
      })
      .addCase(fetchAssignedDeliveryDetails.rejected, (state, action) => {
        state.loadingAssignedDetails = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearDeliveryError,
  clearDeliverySuccess,
  resetDeliveryState,
  clearAssigningState
} = deliverySlice.actions;

export default deliverySlice.reducer;
