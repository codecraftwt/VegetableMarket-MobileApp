import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk for fetching profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

// Async thunk for updating profile with form-data
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.phone) formData.append('phone', profileData.phone);
      if (profileData.bio) formData.append('bio', profileData.bio);
      
      // Add address fields
      if (profileData.address_label) formData.append('address_label', profileData.address_label);
      if (profileData.address_line) formData.append('address_line', profileData.address_line);
      if (profileData.city) formData.append('city', profileData.city);
      if (profileData.taluka) formData.append('taluka', profileData.taluka);
      if (profileData.district) formData.append('district', profileData.district);
      if (profileData.state) formData.append('state', profileData.state);
      if (profileData.country) formData.append('country', profileData.country);
      if (profileData.pincode) formData.append('pincode', profileData.pincode);
      
      // Add profile picture if exists
      if (profileData.profile_picture) {
        formData.append('profile_picture', {
          uri: profileData.profile_picture,
          type: 'image/jpeg',
          name: 'profile_picture.jpg'
        });
      }

      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update profile');
    }
  }
);

// Async thunk for updating address
export const updateAddress = createAsyncThunk(
  'profile/updateAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.put('/address', addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update address');
    }
  }
);

// Async thunk for adding new address
export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add address');
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.post('/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to change password');
    }
  }
);

const initialState = {
  user: null,
  address: null,
  addresses: [], // Array to store multiple addresses
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  changePasswordLoading: false,
  changePasswordError: null,
  addAddressLoading: false,
  addAddressError: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.address = null;
      state.addresses = [];
      state.error = null;
      state.updateError = null;
    },
    setProfileImage: (state, action) => {
      if (state.profile) {
        state.profile.profile_picture = action.payload;
      }
    },
    setPrimaryAddress: (state, action) => {
      state.address = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.address = action.payload.data.address;
        state.addresses = action.payload.data.addresses || [action.payload.data.address].filter(Boolean);
        state.profile = action.payload.data.profile;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Refresh profile data after successful update
        state.updateError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.address = action.payload.data;
        state.updateError = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
      });

    // Add Address
    builder
      .addCase(addAddress.pending, (state) => {
        state.addAddressLoading = true;
        state.addAddressError = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addAddressLoading = false;
        // Add the new address to the addresses array
        if (action.payload.data) {
          state.addresses.push(action.payload.data);
          // If this is the first address, set it as the primary address
          if (state.addresses.length === 1) {
            state.address = action.payload.data;
          }
        }
        state.addAddressError = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.addAddressLoading = false;
        state.addAddressError = action.payload;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload;
      });
  },
});

export const { clearProfile, setProfileImage, setPrimaryAddress } = profileSlice.actions;
export default profileSlice.reducer;
