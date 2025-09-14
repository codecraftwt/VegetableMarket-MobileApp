import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAddresses, setPrimaryAddress, setPrimaryAddressLocal, deleteAddress } from '../../../redux/slices/addressesSlice';
import { ROLES } from '../../../redux/slices/authSlice';

const AllAddressesScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const addressesState = useSelector(state => state.addresses);
  const authState = useSelector(state => state.auth);
  const { addresses, primaryAddress, loading, error, setPrimaryLoading, setPrimaryError, deleteLoading, deleteError } = addressesState;
  const { user: authUser } = authState;

  // Check if user is a customer
  const isCustomer = useMemo(() => {
    return authUser?.role_id === ROLES.CUSTOMER.id;
  }, [authUser]);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Fetch addresses when component mounts and when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchAllAddresses());
    });
    
    // Also fetch on initial mount
    dispatch(fetchAllAddresses());
    
    return unsubscribe;
  }, [dispatch, navigation]);

  // Handle set primary error
  useEffect(() => {
    if (setPrimaryError) {
      setErrorMessage(setPrimaryError);
      setShowErrorModal(true);
    }
  }, [setPrimaryError]);

  // Handle delete error
  useEffect(() => {
    if (deleteError) {
      setErrorMessage(deleteError);
      setShowErrorModal(true);
    }
  }, [deleteError]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSetPrimary = useCallback((address) => {
    setSelectedAddress(address);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmSetPrimary = useCallback(async () => {
    if (!selectedAddress) return;

    try {
      // Update the primary address via API
      await dispatch(setPrimaryAddress(selectedAddress.id)).unwrap();
      
      setShowConfirmModal(false);
      setSuccessMessage('Primary address updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Set primary address error:', error);
      setErrorMessage(error.message || 'Failed to set primary address');
      setShowErrorModal(true);
    }
  }, [selectedAddress, dispatch]);

  const handleEditAddress = useCallback((address) => {
    // Navigate to ProfileEditScreen with address tab active and address data
    navigation.navigate('ProfileEdit', {
      activeTab: 'address',
      editAddress: address
    });
  }, [navigation]);

  const handleAddNewAddress = useCallback(() => {
    // Navigate to ProfileEditScreen with address tab active for adding new address
    navigation.navigate('ProfileEdit', {
      activeTab: 'address',
      addNewAddress: true
    });
  }, [navigation]);

  const handleDeleteAddress = useCallback((address) => {
    // Prevent deleting the last address
    if (addresses.length === 1) {
      setErrorMessage('Cannot delete the last address. You must have at least one address.');
      setShowErrorModal(true);
      return;
    }
    
    setAddressToDelete(address);
    setShowDeleteConfirmModal(true);
  }, [addresses.length]);

  const handleConfirmDelete = useCallback(async () => {
    if (!addressToDelete) return;

    try {
      await dispatch(deleteAddress(addressToDelete.id)).unwrap();
      
      setShowDeleteConfirmModal(false);
      setAddressToDelete(null);
      setSuccessMessage('Address deleted successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Delete address error:', error);
      setErrorMessage(error.message || 'Failed to delete address');
      setShowErrorModal(true);
    }
  }, [addressToDelete, dispatch]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setAddressToDelete(null);
  }, []);

  const formatAddress = useCallback((address) => {
    const parts = [
      address.address_line,
      address.city,
      address.taluka,
      address.district,
      address.state,
      address.country,
      address.pincode
    ].filter(Boolean);
    
    return parts.join(', ');
  }, []);

  const AddressCard = useCallback(({ address, isPrimary }) => (
    <View style={[styles.addressCard, isPrimary && styles.primaryAddressCard]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleContainer}>
          <Text style={[styles.addressLabel, isPrimary && styles.primaryAddressLabel]}>
            {address.address_label || 'Unnamed Address'}
          </Text>
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, deleteLoading && styles.actionButtonDisabled]}
            onPress={() => handleDeleteAddress(address)}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator size="small" color="#dc3545" />
            ) : (
              <Icon name="trash" size={16} color="#dc3545" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
          >
            <Icon name="edit" size={16} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.addressText, isPrimary && styles.primaryAddressText]}>
        {formatAddress(address)}
      </Text>
      
      {!isPrimary && (
        <TouchableOpacity 
          style={[styles.setPrimaryButton, setPrimaryLoading && styles.setPrimaryButtonDisabled]}
          onPress={() => handleSetPrimary(address)}
          disabled={setPrimaryLoading}
        >
          {setPrimaryLoading ? (
            <ActivityIndicator size="small" color="#856404" />
          ) : (
            <>
              <Icon name="star" size={14} color="#ffc107" />
              <Text style={styles.setPrimaryButtonText}>Set as Primary</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  ), [formatAddress, handleEditAddress, handleDeleteAddress, handleSetPrimary, setPrimaryLoading, deleteLoading]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Icon name="map-marker" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No Addresses Found</Text>
      <Text style={styles.emptySubtitle}>
        You haven't added any addresses yet. Add your first address to get started.
      </Text>
      {isCustomer && (
        <TouchableOpacity 
          style={styles.addFirstAddressButton}
          onPress={handleAddNewAddress}
        >
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addFirstAddressButtonText}>Add Address</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [isCustomer, handleAddNewAddress]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="All Addresses"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load addresses</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchAllAddresses())}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : addresses.length === 0 ? (
        EmptyState
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.addressesList}>
            {addresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address} 
                isPrimary={primaryAddress && primaryAddress.id === address.id}
              />
            ))}
          </View>
          
          {isCustomer && (
            <TouchableOpacity 
              style={styles.addNewAddressButton}
              onPress={handleAddNewAddress}
            >
              <Icon name="plus" size={16} color="#007bff" />
              <Text style={styles.addNewAddressButtonText}>Add New Address</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        buttonText="Continue"
        onButtonPress={() => setShowSuccessModal(false)}
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

      {/* Confirm Set Primary Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Set Primary Address"
        message={`Are you sure you want to set "${selectedAddress?.address_label}" as your primary address?`}
        confirmText="Set Primary"
        cancelText="Cancel"
        onConfirm={handleConfirmSetPrimary}
        onCancel={() => setShowConfirmModal(false)}
        type="info"
      />

      {/* Confirm Delete Modal */}
      <ConfirmationModal
        visible={showDeleteConfirmModal}
        onClose={handleCancelDelete}
        title="Delete Address"
        message={`Are you sure you want to delete "${addressToDelete?.address_label || 'this address'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="warning"
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
  
  // Addresses List
  addressesList: {
    marginTop: p(16),
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  primaryAddressCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    backgroundColor: '#f8fff9',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: fontSizes.md,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginRight: p(8),
  },
  primaryAddressLabel: {
    color: '#019a34',
  },
  primaryBadge: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(8),
    paddingVertical: p(2),
    borderRadius: p(12),
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  actionButton: {
    padding: p(8),
    borderRadius: p(6),
    backgroundColor: '#f8f9fa',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  editButton: {
    padding: p(8),
    borderRadius: p(6),
    backgroundColor: '#f8f9fa',
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: '#666',
    lineHeight: p(20),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(8),
  },
  primaryAddressText: {
    color: '#333',
  },
  setPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: p(6),
    paddingHorizontal: p(12),
    borderRadius: p(6),
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  setPrimaryButtonText: {
    color: '#856404',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(4),
  },
  setPrimaryButtonDisabled: {
    opacity: 0.6,
  },

  // Add New Address Button
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: p(16),
    paddingHorizontal: p(24),
    borderRadius: p(12),
    marginTop: p(16),
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
  },
  addNewAddressButtonText: {
    color: '#007bff',
    fontSize: fontSizes.md,
    fontFamily: 'Poppins-Bold',
    marginLeft: p(8),
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(32),
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(20),
    marginBottom: p(24),
  },
  addFirstAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
  },
  addFirstAddressButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    marginLeft: p(8),
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
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default AllAddressesScreen;
