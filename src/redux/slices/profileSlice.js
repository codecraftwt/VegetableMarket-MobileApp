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
      console.log('updateProfile called with data:', profileData);
      
      // Try using React Native's FormData first, which should work better
      const formData = new FormData();
      
      // Add text fields
      if (profileData.name) {
        formData.append('name', profileData.name);
        console.log('Added name:', profileData.name);
      }
      if (profileData.phone) {
        formData.append('phone', profileData.phone);
        console.log('Added phone:', profileData.phone);
      }
      if (profileData.bio) {
        formData.append('bio', profileData.bio);
        console.log('Added bio:', profileData.bio);
      }
      
      // Add address fields
      if (profileData.address_label) {
        formData.append('address_label', profileData.address_label);
        console.log('Added address_label:', profileData.address_label);
      }
      if (profileData.address_line) {
        formData.append('address_line', profileData.address_line);
        console.log('Added address_line:', profileData.address_line);
      }
      if (profileData.city) {
        formData.append('city', profileData.city);
        console.log('Added city:', profileData.city);
      }
      if (profileData.taluka) {
        formData.append('taluka', profileData.taluka);
        console.log('Added taluka:', profileData.taluka);
      }
      if (profileData.district) {
        formData.append('district', profileData.district);
        console.log('Added district:', profileData.district);
      }
      if (profileData.state) {
        formData.append('state', profileData.state);
        console.log('Added state:', profileData.state);
      }
      if (profileData.country) {
        formData.append('country', profileData.country);
        console.log('Added country:', profileData.country);
      }
      if (profileData.pincode) {
        formData.append('pincode', profileData.pincode);
        console.log('Added pincode:', profileData.pincode);
      }
      
      // Add profile picture if exists
      if (profileData.profile_picture) {
        console.log('Adding profile picture to form data:', profileData.profile_picture);
        
        // Get the image URI and create a proper file object
        let imageUri = profileData.profile_picture;
        let imageType = 'image/jpeg';
        let imageName = 'profile_picture.jpg';
        
        if (typeof profileData.profile_picture === 'object' && profileData.profile_picture.uri) {
          imageUri = profileData.profile_picture.uri;
          imageType = profileData.profile_picture.type || 'image/jpeg';
          imageName = profileData.profile_picture.name || 'profile_picture.jpg';
        }
        
        // Create a file object that FormData can handle
        const imageFile = {
          uri: imageUri,
          type: imageType,
          name: imageName,
        };
        
        formData.append('profile_picture', imageFile);
        console.log('Added profile picture file:', imageFile);
      }

      console.log('FormData created with entries:');
      console.log('FormData keys count:', Object.keys(formData).length);
      console.log('API base URL:', api.defaults.baseURL);
      console.log('Full request URL will be:', `${api.defaults.baseURL}/profile`);
      
      // Make the POST request to /profile with multipart/form-data
      console.log('Making POST request to /profile with FormData...');
      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Profile update successful!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('updateProfile error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error statusText:', error.response?.statusText);
      
      // Log more detailed error information for validation errors
      if (error.response?.status === 422) {
        console.error('Validation error details:', error.response.data);
        console.error('Validation errors:', error.response.data.errors);
        console.error('Validation message:', error.response.data.message);
      }
      
      let errorMessage = 'Failed to update profile';
      
      // Check for network errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to update profile.';
      } else if (error.response?.status === 422) {
        // Provide more specific validation error message
        if (error.response.data?.message) {
          errorMessage = `Validation error: ${error.response.data.message}`;
        } else if (error.response.data?.errors) {
          const errorDetails = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = `Validation errors: ${errorDetails}`;
        } else {
          errorMessage = 'Validation error. Please check your input.';
        }
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
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
        // Handle case where profile data might be embedded in user object or separate
        state.profile = action.payload.data.profile || {
          profile_picture: action.payload.data.profile_picture,
          bio: action.payload.data.bio
        };
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
