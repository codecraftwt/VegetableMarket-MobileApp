import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile, updateAddress } from '../../redux/slices/profileSlice';

const ProfileEditScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const { user, address, profile, loading, updateLoading, updateError } = profileState;
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'address'
  
  // Debug logging
  console.log('ProfileEditScreen - Redux State:', profileState);
  console.log('ProfileEditScreen - Error:', profileState.error);
  
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSaveProfile = async () => {
    try {
      // Combine profile and address data for the API call
      const updateData = {
        ...formData,
        ...addressData,
      };
      
      await dispatch(updateProfile(updateData)).unwrap();
      
      // Refresh profile data after successful update
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to update profile');
      setShowErrorModal(true);
    }
  };

  const handleSaveAddress = async () => {
    try {
      await dispatch(updateAddress(addressData)).unwrap();
      
      // Show success modal
      setSuccessMessage('Address updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to update address');
      setShowErrorModal(true);
    }
  };

  // Modal handlers
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleConfirmProfileSave = () => {
    setShowConfirmProfileModal(false);
    handleSaveProfile();
  };

  const handleConfirmAddressSave = () => {
    setShowConfirmAddressModal(false);
    handleSaveAddress();
  };

  const TabButton = ({ title, tab, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon name={icon} size={20} color={activeTab === tab ? '#fff' : '#019a34'} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ProfileTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={formData.bio}
            onChangeText={(text) => setFormData({...formData, bio: text})}
            placeholder="Tell us about yourself..."
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
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
    </KeyboardAvoidingView>
  );

  const AddressTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address Label</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.addressLabel}
            onChangeText={(text) => setAddressData({...addressData, addressLabel: text})}
            placeholder="Enter Address Label e.g. Home, Farm, etc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address Line</Text>
          <TextInput
            style={styles.textInput}
            value={addressData.addressLine}
            onChangeText={(text) => setAddressData({...addressData, addressLine: text})}
            placeholder="Enter Address Line"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
            <Text style={styles.inputLabel}>City/Village</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.city}
              onChangeText={(text) => setAddressData({...addressData, city: text})}
              placeholder="Enter City"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Taluka</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.taluka}
              onChangeText={(text) => setAddressData({...addressData, taluka: text})}
              placeholder="Enter Taluka"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
            <Text style={styles.inputLabel}>District</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.district}
              onChangeText={(text) => setAddressData({...addressData, district: text})}
              placeholder="Enter District"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.state}
              onChangeText={(text) => setAddressData({...addressData, state: text})}
              placeholder="Enter State"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.country}
              onChangeText={(text) => setAddressData({...addressData, country: text})}
              placeholder="Enter Country"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Pincode</Text>
            <TextInput
              style={styles.textInput}
              value={addressData.pincode}
              onChangeText={(text) => setAddressData({...addressData, pincode: text})}
              placeholder="Enter Pincode"
              keyboardType="numeric"
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
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
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
              keyboardShouldPersistTaps="handled"
              bounces={false}
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
