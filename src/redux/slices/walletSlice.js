import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching wallet details
export const fetchWalletDetails = createAsyncThunk(
  'wallet/fetchWalletDetails',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching wallet details...');
      const response = await api.get('/farmer/wallet-details');
      console.log('Wallet details API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch wallet details error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet details');
    }
  }
);

// Async thunk for submitting withdrawal request
export const submitWithdrawalRequest = createAsyncThunk(
  'wallet/submitWithdrawalRequest',
  async (withdrawalData, { rejectWithValue }) => {
    try {
      console.log('Submitting withdrawal request:', withdrawalData);
      const response = await api.post('/farmer/Withdraw-request', withdrawalData);
      console.log('Withdrawal request API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Submit withdrawal request error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to submit withdrawal request');
    }
  }
);

const initialState = {
  // Wallet data
  totalEarnings: 0,
  totalWithdraw: 0,
  availableBalance: 0,
  withdrawals: [],
  previousFundAccounts: [],
  
  // Loading states
  loading: false, // For fetchWalletDetails
  submitLoading: false, // For submitWithdrawalRequest
  
  // Error states
  error: null,
  submitError: null,
  
  // Success states
  submitSuccess: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletData: (state) => {
      state.totalEarnings = 0;
      state.totalWithdraw = 0;
      state.availableBalance = 0;
      state.withdrawals = [];
      state.previousFundAccounts = [];
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.submitError = null;
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wallet Details
    builder
      .addCase(fetchWalletDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletDetails.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data;
        state.totalEarnings = data.total_earnings || 0;
        state.totalWithdraw = data.total_withdraw || 0;
        state.availableBalance = data.available_balance || 0;
        state.withdrawals = data.withdrawals || [];
        state.previousFundAccounts = data.previous_fund_accounts || [];
        state.error = null;
      })
      .addCase(fetchWalletDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wallet details';
      });

    // Submit Withdrawal Request
    builder
      .addCase(submitWithdrawalRequest.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitWithdrawalRequest.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.submitError = null;
        
        // Add the new withdrawal to the list
        const newWithdrawal = {
          id: action.payload.data.withdrawal_id,
          amount: action.payload.data.withdrawal_amount,
          total_amount: action.payload.data.final_amount,
          status: action.payload.data.status,
          rejection_reason: '',
          created_at: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        };
        state.withdrawals.unshift(newWithdrawal);
        
        // Update available balance
        state.availableBalance -= action.payload.data.withdrawal_amount;
        state.totalWithdraw += action.payload.data.withdrawal_amount;
      })
      .addCase(submitWithdrawalRequest.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload || 'Failed to submit withdrawal request';
        state.submitSuccess = false;
      });
  },
});

export const { 
  clearWalletData, 
  clearErrors, 
  clearSubmitError, 
  clearSubmitSuccess 
} = walletSlice.actions;

// Selectors
const selectWalletState = (state) => state.wallet;

export const selectWalletData = createSelector(
  [selectWalletState],
  (wallet) => ({
    totalEarnings: wallet.totalEarnings,
    totalWithdraw: wallet.totalWithdraw,
    availableBalance: wallet.availableBalance,
    withdrawals: wallet.withdrawals,
    previousFundAccounts: wallet.previousFundAccounts,
  })
);

export const selectWalletLoading = (state) => state.wallet.loading;
export const selectSubmitLoading = (state) => state.wallet.submitLoading;
export const selectWalletError = (state) => state.wallet.error;
export const selectSubmitError = (state) => state.wallet.submitError;
export const selectSubmitSuccess = (state) => state.wallet.submitSuccess;

export default walletSlice.reducer;
