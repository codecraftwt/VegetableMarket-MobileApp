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
  Modal,
} from 'react-native';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
  import ConfirmationModal from '../../../components/ConfirmationModal';
import { fetchFarmById, deleteFarm, clearFarmsError, clearFarmsSuccess, clearSelectedFarm } from '../../../redux/slices/farmsSlice';
import { CommonHeader } from '../../../components';

const { width } = Dimensions.get('window');

const FarmDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { selectedFarm, loading, error, success, message } = useSelector(state => state.farms);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const { farmId } = route.params;

  useEffect(() => {
    // Clear any existing selected farm first
    dispatch(clearSelectedFarm());
    
    // Fetch farm details when component mounts
    if (farmId) {
      dispatch(fetchFarmById(farmId));
    }
  }, [dispatch, farmId]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  useEffect(() => {
    // Handle success and error states
    if (success && message) {
      if (message.includes('deleted') || message.includes('delete')) {
        setDeleteSuccess(true);
      }
      setShowSuccessModal(true);
      dispatch(clearFarmsSuccess());
    }
  }, [success, message, dispatch]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh farm data when screen comes into focus
      if (farmId) {
        dispatch(fetchFarmById(farmId));
      }
    });

    return unsubscribe;
  }, [navigation, dispatch, farmId]);

  // Clear selected farm when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedFarm());
    };
  }, [dispatch]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleEditFarm = () => {
    navigation.navigate('EditFarm', { farmId: selectedFarm?.id });
  };

  const handleDeleteFarm = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteFarm = () => {
    if (selectedFarm) {
      dispatch(deleteFarm(selectedFarm.id));
    }
    setShowDeleteModal(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    dispatch(clearFarmsSuccess());
    
    // Navigate back to MyFarms after successful deletion
    if (deleteSuccess) {
      setDeleteSuccess(false);
      navigation.goBack();
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    dispatch(clearFarmsError());
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
  };

  const handleOptionsPress = (event) => {
    // Get the position of the button to position the modal
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setModalPosition({
        x: pageX - 120, // Better alignment with button
        y: pageY + height + 5, // Position below the button
      });
    });
    
    setShowOptionsModal(true);
  };

  const handleOptionSelect = (option) => {
    setShowOptionsModal(false);
    switch (option) {
      case 'edit':
        handleEditFarm();
        break;
      case 'delete':
        handleDeleteFarm();
        break;
    }
  };

  const renderImageGallery = () => {
    if (!selectedFarm?.images || selectedFarm.images.length === 0) {
      return (
        <View style={styles.noImagesContainer}>
          <Icon name="image" size={p(60)} color="#ccc" />
          <Text style={styles.noImagesText}>No images available</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageGalleryContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farm Images ({selectedFarm.images.length})</Text>
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={handleOptionsPress}
          >
            <Icon name="ellipsis-v" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Main Image Display */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{ 
              uri: `https://kisancart.in/storage/${selectedFarm.images[currentImageIndex].image_path}` 
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {selectedFarm.images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {selectedFarm.images.length}
              </Text>
            </View>
          )}
        </View>

        {/* Thumbnail Images */}
        {selectedFarm.images.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
          >
            {selectedFarm.images.map((image, index) => (
              <TouchableOpacity
                key={image.id}
                style={[
                  styles.thumbnail,
                  index === currentImageIndex && styles.activeThumbnail
                ]}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  source={{ uri: `https://kisancart.in/storage/${image.image_path}` }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                {image.is_main === 1 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageBadgeText}>Main</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderFarmInfo = () => (
    <View style={styles.farmInfoContainer}>
      <Text style={styles.sectionTitle}>Farm Information</Text>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Icon name="home" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Farm Name</Text>
            <Text style={styles.infoValue}>{selectedFarm?.name || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#019a34" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {selectedFarm?.location || 'Location not specified'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.descriptionContainer}>
      <Text style={styles.sectionTitle}>Description</Text>
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          {selectedFarm?.description || 'No description available'}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Farm Details"
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

  if (!selectedFarm && !deleteSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Farm Details"
          showBackButton={true}
          showNotification={true}
          onBackPress={() => navigation.goBack()}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={p(60)} color="#dc3545" />
          <Text style={styles.errorTitle}>Farm Not Found</Text>
          <Text style={styles.errorMessage}>
            The farm you're looking for could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Farm Details"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {selectedFarm && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderImageGallery()}
          {renderFarmInfo()}
          {renderDescription()}
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={handleErrorModalClose}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Farm"
        message={`Are you sure you want to delete "${selectedFarm?.name}"? This action cannot be undone and will permanently remove the farm and all its images.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteFarm}
        onCancel={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        confirmButtonStyle="destructive"
        icon="delete-alert"
      />

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowOptionsModal(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => {
            setShowOptionsModal(false);
          }}
        >
          <View style={[styles.optionsModalContainer, {
            position: 'absolute',
            left: modalPosition.x,
            top: modalPosition.y,
          }]}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('edit')}
            >
              <Text style={[styles.optionText, { color: '#007bff' }]}>Edit Farm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('delete')}
            >
              <Text style={[styles.optionText, { color: '#dc3545' }]}>Delete Farm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: p(12),
  },
  imageGalleryContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
  },
  optionsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: p(12),
    width: p(28),
    height: p(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  mainImageContainer: {
    position: 'relative',
    marginBottom: p(12),
  },
  mainImage: {
    width: '100%',
    height: p(180),
    borderRadius: p(6),
    backgroundColor: '#f0f0f0',
  },
  imageCounter: {
    position: 'absolute',
    top: p(10),
    right: p(10),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: p(6),
    paddingVertical: p(3),
    borderRadius: p(10),
  },
  imageCounterText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  thumbnailContainer: {
    marginTop: p(6),
  },
  thumbnail: {
    marginRight: p(10),
    position: 'relative',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#019a34',
    borderRadius: p(6),
  },
  thumbnailImage: {
    width: p(50),
    height: p(50),
    borderRadius: p(4),
    backgroundColor: '#f0f0f0',
  },
  mainImageBadge: {
    position: 'absolute',
    top: p(-4),
    right: p(-4),
    backgroundColor: '#019a34',
    paddingHorizontal: p(3),
    paddingVertical: p(1),
    borderRadius: p(6),
  },
  mainImageBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  noImagesContainer: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  noImagesText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: p(10),
  },
  farmInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoCard: {
    gap: p(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: p(10),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: p(3),
  },
  infoValue: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: p(16),
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  descriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(6),
    padding: p(12),
  },
  descriptionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: p(18),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  optionsModalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(4),
    minWidth: p(140),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    paddingVertical: p(10),
    paddingHorizontal: p(12),
  },
  optionText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
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
    padding: p(12),
    gap: p(12),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    gap: p(10),
  },
});

export default FarmDetailsScreen;
