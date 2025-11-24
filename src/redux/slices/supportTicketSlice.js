import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to create a new support ticket
export const createSupportTicket = createAsyncThunk(
  'supportTicket/createSupportTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('subject', ticketData.subject);
      formData.append('message', ticketData.message);
      
      if (ticketData.attachment) {
        formData.append('attachment', {
          uri: ticketData.attachment.uri,
          type: ticketData.attachment.type || 'image/jpeg',
          name: ticketData.attachment.name || 'attachment.jpg',
        });
      }

      const response = await api.post('/support-ticket', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create support ticket'
      );
    }
  }
);

// Async thunk to fetch all support tickets for the user
export const fetchSupportTickets = createAsyncThunk(
  'supportTicket/fetchSupportTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/support-ticket');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch support tickets'
      );
    }
  }
);

// Async thunk to fetch a specific support ticket by ID
export const fetchSupportTicketById = createAsyncThunk(
  'supportTicket/fetchSupportTicketById',
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/support-ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch support ticket'
      );
    }
  }
);

// Async thunk to update support ticket status
export const updateSupportTicketStatus = createAsyncThunk(
  'supportTicket/updateSupportTicketStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const requestBody = { status };
      
      const response = await api.put(`/support-ticket/${ticketId}/status`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Status update error:', error);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Get more specific error message from validation errors
      let errorMessage = error.response?.data?.message || error.message || 'Failed to update ticket status';
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).flat();
        if (validationErrors.length > 0) {
          errorMessage = validationErrors[0];
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to send a reply to a support ticket
export const sendSupportTicketReply = createAsyncThunk(
  'supportTicket/sendSupportTicketReply',
  async ({ ticketId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/support-ticket/${ticketId}/reply`, { message });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send reply'
      );
    }
  }
);

const supportTicketSlice = createSlice({
  name: 'supportTicket',
  initialState: {
    tickets: [],
    currentTicket: null,
    loading: false,
    ticketsLoading: false,
    creating: false,
    updating: false,
    sendingReply: false,
    error: null,
    success: false,
    message: null,
  },
  reducers: {
    clearSupportTicketError: (state) => {
      state.error = null;
    },
    clearSupportTicketSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearSupportTickets: (state) => {
      state.tickets = [];
      state.currentTicket = null;
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create ticket reducers
      .addCase(createSupportTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.creating = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Support ticket created successfully';
        state.error = null;
        // Add the new ticket to the beginning of the tickets array
        if (action.payload?.data) {
          state.tickets.unshift(action.payload.data);
        }
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch tickets reducers
      .addCase(fetchSupportTickets.pending, (state) => {
        state.ticketsLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.ticketsLoading = false;
        state.tickets = action.payload?.data || [];
        state.error = null;
      })
      .addCase(fetchSupportTickets.rejected, (state, action) => {
        state.ticketsLoading = false;
        state.error = action.payload;
      })
      // Fetch ticket by ID reducers
      .addCase(fetchSupportTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload?.data || null;
        state.error = null;
      })
      .addCase(fetchSupportTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update ticket status reducers
      .addCase(updateSupportTicketStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSupportTicketStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Ticket status updated successfully';
        state.error = null;
        // Update the ticket in the tickets array
        if (action.payload?.data) {
          const index = state.tickets.findIndex(ticket => ticket.id === action.payload.data.id);
          if (index !== -1) {
            state.tickets[index] = action.payload.data;
          }
          // Also update the current ticket if it matches
          if (state.currentTicket?.ticket?.id === action.payload.data.id) {
            state.currentTicket.ticket = action.payload.data;
          }
        }
      })
      .addCase(updateSupportTicketStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Send reply reducers
      .addCase(sendSupportTicketReply.pending, (state) => {
        state.sendingReply = true;
        state.error = null;
      })
      .addCase(sendSupportTicketReply.fulfilled, (state, action) => {
        state.sendingReply = false;
        state.success = action.payload?.success || true;
        state.message = action.payload?.message || 'Reply sent successfully';
        state.error = null;
        // Add the new reply to the current ticket's replies
        if (action.payload?.data && state.currentTicket) {
          if (!state.currentTicket.replies) {
            state.currentTicket.replies = [];
          }
          state.currentTicket.replies.push(action.payload.data);
        }
      })
      .addCase(sendSupportTicketReply.rejected, (state, action) => {
        state.sendingReply = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearSupportTicketError, 
  clearSupportTicketSuccess, 
  clearSupportTickets, 
  clearCurrentTicket 
} = supportTicketSlice.actions;

export default supportTicketSlice.reducer;
