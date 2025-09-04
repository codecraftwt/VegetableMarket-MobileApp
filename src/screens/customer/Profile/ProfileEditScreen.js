import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, updateAddress, addAddress } from '../../../redux/slices/profileSlice';

const ProfileEditScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const { user, address, profile, loading, updateLoading, updateError, addAddressLoading, addAddressError } = profileState;
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'address'
  
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
      // Map the address data to match the API specification
      const updateAddressData = {
        address_label: addressData.addressLabel,
        address_line: addressData.addressLine,
        city: addressData.city,
        taluka: addressData.taluka,
        district: addressData.district,
        state: addressData.state,
        country: addressData.country,
        pincode: addressData.pincode,
      };
      
      console.log('Sending address update data:', updateAddressData);
      
      await dispatch(updateAddress(updateAddressData)).unwrap();
      
      // Show success modal
      setSuccessMessage('Address updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Address update error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to update address');
      setShowErrorModal(true);
    }
  }, [addressData, dispatch]);

  const handleAddAddress = useCallback(async () => {
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
      
      // Show success modal
      setSuccessMessage('Address added successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Add address error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to update address');
      setShowErrorModal(true);
    }
  }, [addressData, dispatch]);

  // Modal handlers
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigation.goBack();
  }, [navigation]);

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

  const ProfileTab = () => (
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
  );

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

  const AddressTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      
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

      <TouchableOpacity 
        style={[styles.addButton, addAddressLoading && styles.addButtonDisabled]} 
        onPress={() => setShowConfirmAddAddressModal(true)}
        disabled={addAddressLoading}
      >
        {addAddressLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Add New Address</Text>
        )}
      </TouchableOpacity>
    </View>
  );

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
              {activeTab === 'profile' ? <ProfileTab /> : <AddressTab />}
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
    paddingHorizontal: p(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: p(20),
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: p(20),
    marginTop: p(20),
    borderRadius: p(25),
    padding: p(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(20),
    gap: p(8),
  },
  activeTabButton: {
    backgroundColor: '#019a34',
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
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
    borderRadius: p(15),
    padding: p(20),
    marginTop: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(25),
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  textInput: {
    fontSize: fontSizes.base,
    color: '#333',
    paddingVertical: p(15),
    paddingHorizontal: p(20),
    backgroundColor: '#f8f9fa',
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontFamily: 'Poppins-Regular',
  },
  bioInput: {
    height: p(100), // Adjust height for multiline text input
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(15),
    paddingHorizontal: p(30),
    borderRadius: p(25),
    alignItems: 'center',
    marginTop: p(20),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },

  // Add Button
  addButton: {
    backgroundColor: '#007bff', // A different color for the add button
    paddingVertical: p(15),
    paddingHorizontal: p(30),
    borderRadius: p(25),
    alignItems: 'center',
    marginTop: p(10), // Adjust spacing
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
  },
  loadingText: {
    marginTop: p(20),
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
    padding: p(20),
  },
  errorText: {
    marginTop: p(20),
    fontSize: fontSizes.base,
    color: '#dc3545',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: p(20),
    backgroundColor: '#019a34',
    paddingVertical: p(10),
    paddingHorizontal: p(30),
    borderRadius: p(25),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default ProfileEditScreen;
