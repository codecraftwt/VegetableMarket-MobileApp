import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, addAddress } from '../../../redux/slices/profileSlice';
import { ROLES } from '../../../redux/slices/authSlice';

const ProfileEditScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const authState = useSelector(state => state.auth);
  const { user, address, profile, loading, updateLoading, updateError, addAddressLoading, addAddressError } = profileState;
  const { user: authUser } = authState;
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'address'
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  
  // Check if user is a customer
  const isCustomer = useMemo(() => {
    return authUser?.role_id === ROLES.CUSTOMER.id;
  }, [authUser]);
  
  // Check if we should start with address tab (e.g., from checkout)
  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params]);

  // Local state for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Local state for address data
  const [addressData, setAddressData] = useState({
    addressLabel: '',
    addressLine: '',
    city: '',
    taluka: '',
    district: '',
    state: '',
    country: '',
    pincode: '',
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmProfileModal, setShowConfirmProfileModal] = useState(false);
  const [showConfirmAddressModal, setShowConfirmAddressModal] = useState(false);
  const [showConfirmAddAddressModal, setShowConfirmAddAddressModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: profile?.bio || '',
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (address && !isAddingNewAddress) {
      setAddressData({
        addressLabel: address.address_label || '',
        addressLine: address.address_line || '',
        city: address.city || '',
        taluka: address.taluka || '',
        district: address.district || '',
        state: address.state || '',
        country: address.country || '',
        pincode: address.pincode || '',
      });
    }
  }, [address, isAddingNewAddress]);

  // Fetch profile data when component mounts
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSaveProfile = useCallback(async () => {
    try {
      // Map the form data to match the API specification
      const updateData = {
        // Profile fields
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        
        // Address fields - map to the correct API field names
        address_label: addressData.addressLabel,
        address_line: addressData.addressLine,
        city: addressData.city,
        taluka: addressData.taluka,
        district: addressData.district,
        state: addressData.state,
        country: addressData.country,
        pincode: addressData.pincode,
      };
      
      console.log('Sending profile update data:', updateData);
      
      await dispatch(updateProfile(updateData)).unwrap();
      
      // Refresh profile data after successful update
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Profile update error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to update profile');
      setShowErrorModal(true);
    }
  }, [formData, addressData, dispatch]);

  const handleSaveAddress = useCallback(async () => {
    try {
      // Map the address data to match the API specification for profile update
      const updateData = {
        // Profile fields - keep existing values
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        
        // Address fields - map to the correct API field names
        address_label: addressData.addressLabel,
        address_line: addressData.addressLine,
        city: addressData.city,
        taluka: addressData.taluka,
        district: addressData.district,
        state: addressData.state,
        country: addressData.country,
        pincode: addressData.pincode,
      };
      
      console.log('Sending address update data through profile API:', updateData);
      
      await dispatch(updateProfile(updateData)).unwrap();
      
      // Refresh profile data after successful update
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Address updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Address update error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to update address');
      setShowErrorModal(true);
    }
  }, [formData, addressData, dispatch]);

  const handleAddAddress = useCallback(async () => {
    // Only allow adding addresses for customers
    if (!isCustomer) {
      setErrorMessage('Adding new addresses is only available for customers');
      setShowErrorModal(true);
      return;
    }

    try {
      // Map the address data to match the API specification
      const newAddressData = {
        address_label: addressData.addressLabel,
        address_line: addressData.addressLine,
        city: addressData.city,
        taluka: addressData.taluka,
        district: addressData.district,
        state: addressData.state,
        country: addressData.country,
        pincode: addressData.pincode,
      };
      
      console.log('Sending new address data:', newAddressData);
      
      await dispatch(addAddress(newAddressData)).unwrap();
      
      // Reset the adding new address state
      setIsAddingNewAddress(false);
      
      // Refresh profile data to get the new address
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Address added successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Add address error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to add address');
      setShowErrorModal(true);
    }
  }, [addressData, dispatch, isCustomer]);

  // Modal handlers
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    // Check if we came from CheckoutScreen (when adding address)
    if (route.params?.fromCheckout) {
      // Navigate back to CheckoutScreen
      navigation.navigate('Checkout');
    } else if (!isAddingNewAddress) {
      // Default behavior - go back
      navigation.goBack();
    }
  }, [navigation, isAddingNewAddress, route.params?.fromCheckout]);

  const handleConfirmProfileSave = useCallback(() => {
    setShowConfirmProfileModal(false);
    handleSaveProfile();
  }, [handleSaveProfile]);

  const handleConfirmAddressSave = useCallback(() => {
    setShowConfirmAddressModal(false);
    handleSaveAddress();
  }, [handleSaveAddress]);

  const handleConfirmAddAddress = useCallback(() => {
    setShowConfirmAddAddressModal(false);
    handleAddAddress();
  }, [handleAddAddress]);

  const handleAddNewAddress = useCallback(() => {
    // Only allow adding new addresses for customers
    if (!isCustomer) {
      setErrorMessage('Adding new addresses is only available for customers');
      setShowErrorModal(true);
      return;
    }
    
    setIsAddingNewAddress(true);
    setAddressData({
      addressLabel: '',
      addressLine: '',
      city: '',
      taluka: '',
      district: '',
      state: '',
      country: '',
      pincode: '',
    });
  }, [isCustomer]);

  const handleCancelAddAddress = useCallback(() => {
    setIsAddingNewAddress(false);
    if (address) {
      setAddressData({
        addressLabel: address.address_label || '',
        addressLine: address.address_line || '',
        city: address.city || '',
        taluka: address.taluka || '',
        district: address.district || '',
        state: address.state || '',
        country: address.country || '',
        pincode: address.pincode || '',
      });
    }
  }, [address]);

  const TabButton = useCallback(({ title, tab, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon name={icon} size={20} color={activeTab === tab ? '#fff' : '#019a34'} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  ), [activeTab]);

  // Optimized form handlers
  const handleNameChange = useCallback((text) => {
    setFormData(prev => ({...prev, name: text}));
  }, []);

  const handleEmailChange = useCallback((text) => {
    setFormData(prev => ({...prev, email: text}));
  }, []);

  const handlePhoneChange = useCallback((text) => {
    setFormData(prev => ({...prev, phone: text}));
  }, []);

  const handleBioChange = useCallback((text) => {
    setFormData(prev => ({...prev, bio: text}));
  }, []);

  const ProfileTab = useMemo(() => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={handleNameChange}
          placeholder="Enter your full name"
          autoCapitalize="words"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          value={formData.email}
          onChangeText={handleEmailChange}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          value={formData.phone}
          onChangeText={handlePhoneChange}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.textInput, styles.bioInput]}
          value={formData.bio}
          onChangeText={handleBioChange}
          placeholder="Tell us about yourself..."
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="default"
          blurOnSubmit={true}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, updateLoading && styles.saveButtonDisabled]} 
        onPress={() => setShowConfirmProfileModal(true)}
        disabled={updateLoading}
      >
        {updateLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  ), [formData, handleNameChange, handleEmailChange, handlePhoneChange, handleBioChange, updateLoading]);

  // Optimized address handlers
  const handleAddressLabelChange = useCallback((text) => {
    setAddressData(prev => ({...prev, addressLabel: text}));
  }, []);

  const handleAddressLineChange = useCallback((text) => {
    setAddressData(prev => ({...prev, addressLine: text}));
  }, []);

  const handleCityChange = useCallback((text) => {
    setAddressData(prev => ({...prev, city: text}));
  }, []);

  const handleTalukaChange = useCallback((text) => {
    setAddressData(prev => ({...prev, taluka: text}));
  }, []);

  const handleDistrictChange = useCallback((text) => {
    setAddressData(prev => ({...prev, district: text}));
  }, []);

  const handleStateChange = useCallback((text) => {
    setAddressData(prev => ({...prev, state: text}));
  }, []);

  const handleCountryChange = useCallback((text) => {
    setAddressData(prev => ({...prev, country: text}));
  }, []);

  const handlePincodeChange = useCallback((text) => {
    setAddressData(prev => ({...prev, pincode: text}));
  }, []);

  const AddressTab = useMemo(() => (
    <View style={styles.tabContent}>
      <View style={styles.addressHeader}>
        <Text style={styles.sectionTitle}>
          {isAddingNewAddress ? 'Add New Address' : 'Delivery Address'}
        </Text>
        {isAddingNewAddress && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelAddAddress}
          >
            <Icon name="times" size={16} color="#dc3545" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Label</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.addressLabel}
          onChangeText={handleAddressLabelChange}
          placeholder="Enter Address Label e.g. Home, Farm, etc"
          autoCapitalize="words"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address Line</Text>
        <TextInput
          style={styles.textInput}
          value={addressData.addressLine}
          onChangeText={handleAddressLineChange}
          placeholder="Enter Address Line"
          autoCapitalize="words"
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
          <Text style={styles.inputLabel}>City/Village</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.city}
            onChangeText={handleCityChange}
            placeholder="Enter City"
            autoCapitalize="words"
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Taluka</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.taluka}
            onChangeText={handleTalukaChange}
            placeholder="Enter Taluka"
            autoCapitalize="words"
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
          <Text style={styles.inputLabel}>District</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.district}
            onChangeText={handleDistrictChange}
            placeholder="Enter District"
            autoCapitalize="words"
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.state}
            onChangeText={handleStateChange}
            placeholder="Enter State"
            autoCapitalize="words"
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
          <Text style={styles.inputLabel}>Country</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.country}
            onChangeText={handleCountryChange}
            placeholder="Enter Country"
            autoCapitalize="words"
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Pincode</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.pincode}
            onChangeText={handlePincodeChange}
            placeholder="Enter Pincode"
            keyboardType="numeric"
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>
      </View>

      {isAddingNewAddress ? (
        <TouchableOpacity 
          style={[styles.addButton, addAddressLoading && styles.addButtonDisabled]} 
          onPress={() => setShowConfirmAddAddressModal(true)}
          disabled={addAddressLoading}
        >
          {addAddressLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add Address</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, updateLoading && styles.saveButtonDisabled]} 
            onPress={() => setShowConfirmAddressModal(true)}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>

          {isCustomer && (
            <TouchableOpacity 
              style={styles.addNewButton} 
              onPress={handleAddNewAddress}
            >
              <Icon name="plus" size={16} color="#007bff" />
              <Text style={styles.addNewButtonText}>Add New Address</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  ), [
    isAddingNewAddress, 
    handleCancelAddAddress, 
    addressData, 
    handleAddressLabelChange, 
    handleAddressLineChange, 
    handleCityChange, 
    handleTalukaChange, 
    handleDistrictChange, 
    handleStateChange, 
    handleCountryChange, 
    handlePincodeChange, 
    addAddressLoading, 
    updateLoading, 
    isCustomer, 
    handleAddNewAddress
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Edit Profile"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : profileState.error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TabButton title="Profile" tab="profile" icon="user" />
            <TabButton title="Address" tab="address" icon="map-marker" />
          </View>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="always"
              bounces={false}
              removeClippedSubviews={false}
            >
              {activeTab === 'profile' ? ProfileTab : AddressTab}
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Success!"
        message={successMessage}
        buttonText="Continue"
        onButtonPress={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />

      {/* Confirm Profile Save Modal */}
      <ConfirmationModal
        visible={showConfirmProfileModal}
        onClose={() => setShowConfirmProfileModal(false)}
        title="Confirm Save"
        message="Are you sure you want to save your profile changes?"
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={handleConfirmProfileSave}
        onCancel={() => setShowConfirmProfileModal(false)}
        type="info"
      />

      {/* Confirm Address Save Modal */}
      <ConfirmationModal
        visible={showConfirmAddressModal}
        onClose={() => setShowConfirmAddressModal(false)}
        title="Confirm Save"
        message="Are you sure you want to save your address changes?"
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={handleConfirmAddressSave}
        onCancel={() => setShowConfirmAddressModal(false)}
        type="info"
      />

      {/* Confirm Add Address Modal */}
      <ConfirmationModal
        visible={showConfirmAddAddressModal}
        onClose={() => setShowConfirmAddAddressModal(false)}
        title="Confirm Add Address"
        message="Are you sure you want to add this new address?"
        confirmText="Add"
        cancelText="Cancel"
        onConfirm={handleConfirmAddAddress}
        onCancel={() => setShowConfirmAddAddressModal(false)}
        type="info"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  content: {
    flex: 1,
    paddingHorizontal: p(16),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: p(16),
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: p(16),
    marginTop: p(16),
    borderRadius: p(8),
    padding: p(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    gap: p(6),
  },
  activeTabButton: {
    backgroundColor: '#019a34',
  },
  tabButtonText: {
    fontSize: fontSizes.xs,
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Tab Content
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginTop: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(20),
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: p(16),
  },
  inputLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(6),
    fontFamily: 'Poppins-SemiBold',
  },
  textInput: {
    fontSize: fontSizes.sm,
    color: '#333',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontFamily: 'Poppins-Regular',
  },
  bioInput: {
    height: p(80), // Adjust height for multiline text input
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    alignItems: 'center',
    marginTop: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },

  // Address Header
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(6),
    paddingHorizontal: p(10),
    borderRadius: p(8),
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(4),
  },

  // Button Container
  buttonContainer: {
    marginTop: p(16),
  },

  // Add Button
  addButton: {
    backgroundColor: '#007bff', // A different color for the add button
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    alignItems: 'center',
    marginTop: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },

  // Add New Button
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007bff',
    marginTop: p(8),
  },
  addNewButtonText: {
    color: '#007bff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    marginLeft: p(6),
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
  },
  loadingText: {
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
    padding: p(16),
  },
  errorText: {
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#dc3545',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: p(16),
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default ProfileEditScreen;
