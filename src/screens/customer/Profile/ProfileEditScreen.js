import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../../../redux/slices/profileSlice';
import { addAddress, updateAddress } from '../../../redux/slices/addressesSlice';
import { ROLES } from '../../../redux/slices/authSlice';

const ProfileEditScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const addressesState = useSelector(state => state.addresses);
  const authState = useSelector(state => state.auth);
  const { user, address, profile, loading, updateLoading, updateError } = profileState;
  const { addLoading: addAddressLoading, addError: addAddressError, updateLoading: updateAddressLoading, updateError: updateAddressError } = addressesState;
  const { user: authUser } = authState;
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'address'
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const editDataLoadedRef = useRef(false);
  
  // Check if user is a customer
  const isCustomer = useMemo(() => {
    return authUser?.role_id === ROLES.CUSTOMER.id;
  }, [authUser]);
  
  // Check if we should start with address tab (e.g., from checkout)
  useEffect(() => {
    console.log('Route params changed:', route.params);
    
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params]);

  // Handle editing specific address from AllAddressesScreen - separate useEffect
  useEffect(() => {
    if (route.params?.editAddress) {
      const address = route.params.editAddress;
      console.log('=== LOADING EDIT ADDRESS DATA ===');
      console.log('Edit address received:', address);
      console.log('Setting editingAddressId to:', address.id);
      
      // Set all flags immediately
      setEditingAddressId(address.id);
      setIsEditMode(true);
      editDataLoadedRef.current = true; // Mark that edit data has been loaded
      
      const newAddressData = {
        addressLabel: address.address_label || '',
        addressLine: address.address_line || '',
        city: address.city || '',
        taluka: address.taluka || '',
        district: address.district || '',
        state: address.state || '',
        country: address.country || '',
        pincode: address.pincode || '',
      };
      console.log('Setting addressData to:', newAddressData);
      setAddressData(newAddressData);
      
      // Force a re-render to ensure the data is set
      setTimeout(() => {
        console.log('=== CONFIRMING EDIT DATA SET ===');
        console.log('Current addressData after timeout:', addressData);
      }, 100);
    }
  }, [route.params?.editAddress]);

  // Handle adding new address from AllAddressesScreen - separate useEffect
  useEffect(() => {
    if (route.params?.addNewAddress) {
      console.log('=== ADDING NEW ADDRESS ===');
      setIsAddingNewAddress(true);
      setEditingAddressId(null); // Clear editing address ID when adding new
      setIsEditMode(false); // Clear edit mode flag
      editDataLoadedRef.current = false; // Reset edit data loaded flag
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
    }
  }, [route.params?.addNewAddress]);

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
    console.log('=== PROFILE ADDRESS USEEFFECT ===');
    console.log('address:', address);
    console.log('isAddingNewAddress:', isAddingNewAddress);
    console.log('editingAddressId:', editingAddressId);
    console.log('isEditMode:', isEditMode);
    console.log('editDataLoadedRef.current:', editDataLoadedRef.current);
    console.log('Should load profile address?', address && !isAddingNewAddress && !editingAddressId && !isEditMode && !editDataLoadedRef.current);
    
    // Only load profile address data if we're not editing a specific address and not in edit mode and edit data hasn't been loaded
    if (address && !isAddingNewAddress && !editingAddressId && !isEditMode && !editDataLoadedRef.current) {
      console.log('=== LOADING PROFILE ADDRESS DATA ===');
      console.log('Profile address:', address);
      const newAddressData = {
        addressLabel: address.address_label || '',
        addressLine: address.address_line || '',
        city: address.city || '',
        taluka: address.taluka || '',
        district: address.district || '',
        state: address.state || '',
        country: address.country || '',
        pincode: address.pincode || '',
      };
      console.log('Setting profile addressData to:', newAddressData);
      setAddressData(newAddressData);
    } else {
      console.log('BLOCKING profile address loading - edit data loaded or other conditions');
      console.log('Reasons: isAddingNewAddress=', isAddingNewAddress, 'editingAddressId=', editingAddressId, 'isEditMode=', isEditMode, 'editDataLoaded=', editDataLoadedRef.current);
    }
  }, [address, isAddingNewAddress, editingAddressId, isEditMode]);

  // Handle update address error
  useEffect(() => {
    if (updateAddressError) {
      setErrorMessage(updateAddressError);
      setShowErrorModal(true);
    }
  }, [updateAddressError]);

  // Debug editing address ID changes
  useEffect(() => {
    console.log('editingAddressId changed to:', editingAddressId);
  }, [editingAddressId]);

  // Debug addressData changes
  useEffect(() => {
    console.log('=== ADDRESS DATA CHANGED ===');
    console.log('New addressData:', addressData);
    console.log('Current editingAddressId:', editingAddressId);
    console.log('Current isAddingNewAddress:', isAddingNewAddress);
    console.log('Current isEditMode:', isEditMode);
  }, [addressData]);

  // Debug edit mode changes
  useEffect(() => {
    console.log('isEditMode changed to:', isEditMode);
  }, [isEditMode]);

  // Fetch profile data when component mounts
  useEffect(() => {
    console.log('=== COMPONENT MOUNTED ===');
    console.log('Initial route.params:', route.params);
    console.log('Initial editingAddressId:', editingAddressId);
    console.log('Initial addressData:', addressData);
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Validation function
  const validateProfileData = useCallback(() => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 100) {
      errors.email = 'Email must be less than 100 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Bio validation (optional but if provided, validate)
    if (formData.bio.trim() && formData.bio.trim().length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    return errors;
  }, [formData]);

  const validateAddressData = useCallback(() => {
    const errors = {};

    // Address Label validation
    if (!addressData.addressLabel.trim()) {
      errors.addressLabel = 'Address label is required';
    } else if (addressData.addressLabel.trim().length > 50) {
      errors.addressLabel = 'Address label must be less than 50 characters';
    }

    // Address Line validation
    if (!addressData.addressLine.trim()) {
      errors.addressLine = 'Address line is required';
    } else if (addressData.addressLine.trim().length > 200) {
      errors.addressLine = 'Address line must be less than 200 characters';
    }

    // City validation
    if (!addressData.city.trim()) {
      errors.city = 'City is required';
    } else if (addressData.city.trim().length > 50) {
      errors.city = 'City must be less than 50 characters';
    }

    // Taluka validation
    if (!addressData.taluka.trim()) {
      errors.taluka = 'Taluka is required';
    } else if (addressData.taluka.trim().length > 50) {
      errors.taluka = 'Taluka must be less than 50 characters';
    }

    // District validation
    if (!addressData.district.trim()) {
      errors.district = 'District is required';
    } else if (addressData.district.trim().length > 50) {
      errors.district = 'District must be less than 50 characters';
    }

    // State validation
    if (!addressData.state.trim()) {
      errors.state = 'State is required';
    } else if (addressData.state.trim().length > 50) {
      errors.state = 'State must be less than 50 characters';
    }

    // Country validation
    if (!addressData.country.trim()) {
      errors.country = 'Country is required';
    } else if (addressData.country.trim().length > 50) {
      errors.country = 'Country must be less than 50 characters';
    }

    // Pincode validation
    if (!addressData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(addressData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    return errors;
  }, [addressData]);

  const handleSaveProfile = useCallback(async () => {
    try {
      // Validate profile data
      const profileErrors = validateProfileData();
      if (Object.keys(profileErrors).length > 0) {
        const errorMessages = Object.values(profileErrors).join('\n');
        setErrorMessage(errorMessages);
        setShowErrorModal(true);
        return;
      }

      // Check if address is complete
      const addressErrors = validateAddressData();
      if (Object.keys(addressErrors).length > 0) {
        setErrorMessage('Please complete your address information to update your profile. All address fields are required.');
        setShowErrorModal(true);
        return;
      }

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
  }, [formData, addressData, dispatch, validateProfileData, validateAddressData]);

  const handleSaveAddress = useCallback(async () => {
    try {
      // Validate address data
      const addressErrors = validateAddressData();
      if (Object.keys(addressErrors).length > 0) {
        const errorMessages = Object.values(addressErrors).join('\n');
        setErrorMessage(errorMessages);
        setShowErrorModal(true);
        return;
      }

      // If editing an existing address, use the addresses API
      if (editingAddressId) {
        const updateData = {
          address_label: addressData.addressLabel,
          address_line: addressData.addressLine,
          city: addressData.city,
          taluka: addressData.taluka,
          district: addressData.district,
          state: addressData.state,
          country: addressData.country,
          pincode: addressData.pincode,
        };
        
        console.log('Updating address via addresses API:', updateData);
        
        await dispatch(updateAddress({ addressId: editingAddressId, addressData: updateData })).unwrap();
        
        // Show success modal
        setSuccessMessage('Address updated successfully!');
        setShowSuccessModal(true);
      } else {
        // If updating profile address, use the profile API
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
      }
    } catch (error) {
      console.error('Address update error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to update address');
      setShowErrorModal(true);
    }
  }, [formData, addressData, dispatch, editingAddressId, validateAddressData]);

  const handleAddAddress = useCallback(async () => {
    // Only allow adding addresses for customers
    if (!isCustomer) {
      setErrorMessage('Adding new addresses is only available for customers');
      setShowErrorModal(true);
      return;
    }

    try {
      // Validate address data
      const addressErrors = validateAddressData();
      if (Object.keys(addressErrors).length > 0) {
        const errorMessages = Object.values(addressErrors).join('\n');
        setErrorMessage(errorMessages);
        setShowErrorModal(true);
        return;
      }

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
      
      // Refresh profile data to get the new address
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Address added successfully!');
      setShowSuccessModal(true);
      
      // Reset the adding new address state after showing success modal
      // This will be handled in the success modal close handler
    } catch (error) {
      console.error('Add address error:', error);
      // Show error modal
      setErrorMessage(error.message || 'Failed to add address');
      setShowErrorModal(true);
    }
  }, [addressData, dispatch, isCustomer, validateAddressData]);

  // Modal handlers
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    // Check if we came from CheckoutScreen (when adding address)
    if (route.params?.fromCheckout) {
      // Navigate back to CheckoutScreen
      navigation.navigate('Checkout');
    } else if (route.params?.editAddress) {
      // If editing address from AllAddressesScreen, go back to AllAddressesScreen
      navigation.navigate('AllAddresses');
    } else if (route.params?.addNewAddress) {
      // If adding new address from AllAddressesScreen, go back to AllAddressesScreen
      navigation.navigate('AllAddresses');
    } else if (isAddingNewAddress) {
      // If we were adding a new address, stay on the same screen but reset the adding state
      setIsAddingNewAddress(false);
      // Reset address data to show the newly added address
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
      // Don't navigate anywhere, just stay on the profile edit screen
    } else {
      // For profile updates, stay on the same screen instead of going back
      // This prevents navigation back to register screen
      // Just close the modal and stay on ProfileEditScreen
    }
  }, [navigation, isAddingNewAddress, route.params?.fromCheckout, route.params?.editAddress, route.params?.addNewAddress, address]);

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
    setEditingAddressId(null); // Clear editing address ID when adding new
    setIsEditMode(false); // Clear edit mode flag
    editDataLoadedRef.current = false; // Reset edit data loaded flag
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
    setIsEditMode(false); // Clear edit mode flag
    editDataLoadedRef.current = false; // Reset edit data loaded flag
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

  // Optimized form handlers with validation
  const handleNameChange = useCallback((text) => {
    // Only allow letters and spaces, limit length
    const processedText = text.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    setFormData(prev => ({...prev, name: processedText}));
  }, []);

  const handleEmailChange = useCallback((text) => {
    // Limit email length
    const processedText = text.slice(0, 100);
    setFormData(prev => ({...prev, email: processedText}));
  }, []);

  const handlePhoneChange = useCallback((text) => {
    // Only allow numbers and limit to 10 digits
    const processedText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({...prev, phone: processedText}));
  }, []);

  const handleBioChange = useCallback((text) => {
    // Limit bio length
    const processedText = text.slice(0, 500);
    setFormData(prev => ({...prev, bio: processedText}));
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
          maxLength={50}
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
          maxLength={100}
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
          maxLength={10}
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
          maxLength={500}
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

  // Optimized address handlers with validation
  const handleAddressLabelChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, addressLabel: processedText}));
  }, []);

  const handleAddressLineChange = useCallback((text) => {
    const processedText = text.slice(0, 200);
    setAddressData(prev => ({...prev, addressLine: processedText}));
  }, []);

  const handleCityChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, city: processedText}));
  }, []);

  const handleTalukaChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, taluka: processedText}));
  }, []);

  const handleDistrictChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, district: processedText}));
  }, []);

  const handleStateChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, state: processedText}));
  }, []);

  const handleCountryChange = useCallback((text) => {
    const processedText = text.slice(0, 50);
    setAddressData(prev => ({...prev, country: processedText}));
  }, []);

  const handlePincodeChange = useCallback((text) => {
    // Only allow numbers and limit to 6 digits
    const processedText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setAddressData(prev => ({...prev, pincode: processedText}));
  }, []);

  const AddressTab = useMemo(() => {
    console.log('AddressTab rendering with addressData:', addressData);
    console.log('editingAddressId:', editingAddressId);
    console.log('isAddingNewAddress:', isAddingNewAddress);
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.sectionTitle}>
              {isAddingNewAddress ? 'Add New Address' : editingAddressId ? 'Edit Address' : 'Delivery Address'}
            </Text>
          {!isAddingNewAddress && isCustomer && (
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllAddresses')}
            >
              <Text style={styles.seeAllButtonText}>See all addresses</Text>
              <Icon name="chevron-right" size={12} color="#007bff" />
            </TouchableOpacity>
          )}
        </View>
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
          maxLength={50}
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
          maxLength={200}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={6}
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
          style={[styles.saveButton, (updateLoading || updateAddressLoading) && styles.saveButtonDisabled]} 
          onPress={() => setShowConfirmAddressModal(true)}
          disabled={updateLoading || updateAddressLoading}
        >
          {(updateLoading || updateAddressLoading) ? (
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
    );
  }, [
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
    handleAddNewAddress,
    editingAddressId
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
  addressTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(4),
    paddingHorizontal: p(8),
    borderRadius: p(6),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  seeAllButtonText: {
    color: '#007bff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    marginRight: p(4),
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
