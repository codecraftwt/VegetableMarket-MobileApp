import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { CommonHeader } from '../../../components';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { fetchVegetableById, fetchFarmerVegetables, deleteVegetable, clearFarmerVegetablesError, clearFarmerVegetablesSuccess, clearSelectedVegetable } from '../../../redux/slices/farmerVegetablesSlice';

const { width } = Dimensions.get('window');

const VegetableDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { selectedVegetable, vegetables, loadingVegetable, error, success, message } = useSelector(state => state.farmerVegetables);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const { vegetableId } = route.params;

  // Helper function to get vegetable name reliably
  const getVegetableName = () => {
    return selectedVegetable?.name || 'this vegetable';
  };

  useEffect(() => {
    // Clear any existing selected vegetable data when navigating to a new vegetable
    dispatch(clearSelectedVegetable());
    
    // Fetch vegetables list for fallback name lookup
    dispatch(fetchFarmerVegetables());
    
    // Always fetch the specific vegetable when component mounts or vegetableId changes
    if (vegetableId) {
      dispatch(fetchVegetableById(vegetableId));
    }
  }, [dispatch, vegetableId]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  useEffect(() => {
    // Handle success and error states
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearFarmerVegetablesSuccess());
      
      // If it's a delete success, navigate back after showing success modal
      if (message.includes('deleted successfully')) {
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    }
  }, [success, message, dispatch, navigation]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh vegetable data when screen comes into focus (e.g., returning from edit screen)
      if (vegetableId) {
        dispatch(fetchVegetableById(vegetableId));
      }
    });

    return unsubscribe;
  }, [navigation, dispatch, vegetableId]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleEditVegetable = () => {
    navigation.navigate('EditVegetable', { vegetableId });
  };

  const handleDeleteVegetable = () => {
    // TODO: Implement delete functionality
    Alert.alert('Delete Vegetable', 'Delete Vegetable functionality will be implemented soon');
  };

  const handleThreeDotsPress = (event) => {
    event.stopPropagation();
    
    // Get the position of the touch event
    const { pageX, pageY } = event.nativeEvent;
    setModalPosition({ x: pageX - 100, y: pageY + 10 }); // Adjust position to show below the button
    setShowActionModal(true);
  };

  const handleEditVegetableFromModal = () => {
    setShowActionModal(false);
    navigation.navigate('EditVegetable', { vegetableId });
  };

  const handleDeleteVegetableFromModal = () => {
    setShowActionModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmationModal(false);
    if (vegetableData?.id) {
      dispatch(deleteVegetable(vegetableData.id));
    } else if (vegetableId) {
      dispatch(deleteVegetable(vegetableId));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationModal(false);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
  };

  const renderVegetableImage = () => {
    if (!vegetableData?.images || vegetableData.images.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Icon name="image" size={p(60)} color="#ccc" />
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: `https://vegetables.walstarmedia.com/storage/${vegetableData.images[0].image_path}` 
          }}
          style={styles.vegetableImage}
          resizeMode="cover"
        />
        {vegetableData.is_organic === 1 && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicBadgeText}>Organic</Text>
          </View>
        )}
      </View>
    );
  };

  const renderVegetableInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vegetable Information</Text>
        <TouchableOpacity 
          style={styles.threeDotsButton}
          onPress={handleThreeDotsPress}
          activeOpacity={0.7}
        >
          <Icon name="ellipsis-v" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Icon name="leaf" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vegetable Name</Text>
            <Text style={styles.infoValue}>{vegetableData.name}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="tag" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{vegetableData.category.name}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="dollar" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>₹{vegetableData.price_per_kg} per {vegetableData.unit_type}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="cube" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Stock Available</Text>
            <Text style={styles.infoValue}>{vegetableData.quantity_available} {vegetableData.unit_type}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="check-circle" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.statusText]}>{vegetableData.status}</Text>
          </View>
        </View>

        {vegetableData.grade && (
          <View style={styles.infoRow}>
            <Icon name="star" size={20} color="#019a34" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Grade</Text>
              <Text style={styles.infoValue}>{vegetableData.grade}</Text>
            </View>
          </View>
        )}

        {vegetableData.harvest_date && (
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#019a34" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Harvest Date</Text>
              <Text style={styles.infoValue}>
                {new Date(vegetableData.harvest_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.descriptionContainer}>
      <Text style={styles.sectionTitle}>Description</Text>
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          {vegetableData.description || 'No description available'}
        </Text>
      </View>
    </View>
  );



  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(200)} width="100%" borderRadius={p(12)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <SkeletonLoader height={p(120)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(80)} width="100%" borderRadius={p(8)} />
      </View>
    </View>
  );

  // Show skeleton loader when loading specific vegetable data
  if (loadingVegetable || !selectedVegetable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Vegetable Details"
          showBackButton={true}
          showNotification={true}
          onBackPress={() => navigation.goBack()}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        {renderSkeletonLoader()}
      </SafeAreaView>
    );
  }

  // Get vegetable data - use selectedVegetable (now guaranteed to exist)
  const vegetableData = selectedVegetable;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Vegetable Details"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderVegetableImage()}
        {renderVegetableInfo()}
        {renderDescription()}
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmerVegetablesSuccess());
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmerVegetablesError());
        }}
      />

      {/* Action Modal */}
      {showActionModal && (
        <View style={styles.modalOverlay} onTouchEnd={handleCloseActionModal}>
          <View 
            style={[
              styles.actionModal, 
              { 
                left: modalPosition.x, 
                top: modalPosition.y 
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEditVegetableFromModal}
            >
              <Icon name="edit" size={16} color="#019a34" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeleteVegetableFromModal}
            >
              <Icon name="trash" size={16} color="#dc3545" />
              <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        title="Delete Vegetable"
        message={`Are you sure you want to delete "${getVegetableName()}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="destructive"
        icon="delete-alert"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
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
    padding: p(16),
  },
  imageContainer: {
    position: 'relative',
    marginBottom: p(16),
  },
  vegetableImage: {
    width: '100%',
    height: p(200),
    borderRadius: p(12),
    backgroundColor: '#f0f0f0',
  },
  organicBadge: {
    position: 'absolute',
    top: p(12),
    left: p(12),
    backgroundColor: '#28a745',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(16),
  },
  organicBadgeText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  noImageContainer: {
    alignItems: 'center',
    paddingVertical: p(40),
    backgroundColor: '#fff',
    borderRadius: p(12),
    marginBottom: p(16),
  },
  noImageText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: p(12),
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(16),
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(16),
  },
  threeDotsButton: {
    width: p(24),
    height: p(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    gap: p(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: p(12),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: p(4),
  },
  infoValue: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: p(20),
  },
  statusText: {
    textTransform: 'capitalize',
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(16),
  },
  descriptionText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: p(22),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: p(12),
    marginBottom: p(20),
  },
  editButton: {
    flex: 1,
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(8),
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(8),
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  errorTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  errorMessage: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
  },
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    gap: p(12),
  },
  // Action modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  actionModal: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: p(120),
    zIndex: 1001,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    gap: p(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  deleteText: {
    color: '#dc3545',
  },
});

export default VegetableDetailsScreen;
