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
  Alert,
  Modal,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { fetchFarms, deleteFarm, clearFarmsError, clearFarmsSuccess } from '../../../redux/slices/farmsSlice';
import { SkeletonLoader } from '../../../components';

const MyFarmsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { farms, loading, error, success, message } = useSelector(state => state.farms);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch farms data from API
    dispatch(fetchFarms());
  }, [dispatch]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh farms data when screen comes into focus
      dispatch(fetchFarms());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  // Handle success and error states
  useEffect(() => {
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearFarmsSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleAddFarm = () => {
    navigation.navigate('AddFarm');
  };

  const handleEditFarm = (farm) => {
    navigation.navigate('EditFarm', { farmId: farm.id });
  };

  const handleDeleteFarm = (farm) => {
    setFarmToDelete(farm);
    setShowDeleteModal(true);
  };

  const confirmDeleteFarm = () => {
    if (farmToDelete) {
      dispatch(deleteFarm(farmToDelete.id));
      setFarmToDelete(null);
    }
    setShowDeleteModal(false);
  };

  const handleViewFarmDetails = (farm) => {
    navigation.navigate('FarmDetails', { farmId: farm.id });
  };

  const handleOptionsPress = (farm, event) => {
    setSelectedFarm(farm);
    
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
    if (selectedFarm) {
      switch (option) {
        case 'view':
          handleViewFarmDetails(selectedFarm);
          break;
        case 'edit':
          handleEditFarm(selectedFarm);
          break;
        case 'delete':
          handleDeleteFarm(selectedFarm);
          break;
      }
    }
    setSelectedFarm(null);
  };

  const renderFarmCard = (farm) => {
    // Get the main image URL
    const imageUrl = farm.main_image 
      ? `https://vegetables.walstarmedia.com/storage/${farm.main_image.image_path}`
      : farm.images && farm.images.length > 0 
        ? `https://vegetables.walstarmedia.com/storage/${farm.images[0].image_path}`
        : 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400';

    // Truncate description to 5 lines
    const truncatedDescription = farm.description 
      ? farm.description.length > 150 
        ? farm.description.substring(0, 150) + '...'
        : farm.description
      : 'No description available';

    return (
      <TouchableOpacity 
        key={farm.id} 
        style={styles.farmCard}
        onPress={() => handleViewFarmDetails(farm)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.farmImage} />
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={(event) => {
              event.stopPropagation(); // Prevent card press when clicking options
              handleOptionsPress(farm, event);
            }}
          >
            <Icon name="ellipsis-v" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.farmContent}>
          <View style={styles.farmHeader}>
            <Text style={styles.farmName}>{farm.name}</Text>
            <View style={[styles.statusBadge, styles.activeBadge]}>
              <Text style={[styles.statusText, styles.activeText]}>
                Active
              </Text>
            </View>
          </View>
          
          <View style={styles.farmInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={14} color="#666" />
              <Text style={styles.infoText}>{farm.location || 'Location not specified'}</Text>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={5}>
                {truncatedDescription}
              </Text>
              {farm.description && farm.description.length > 150 && (
                <TouchableOpacity 
                  style={styles.moreInfoButton}
                  onPress={(event) => {
                    event.stopPropagation(); // Prevent card press when clicking more info
                    handleViewFarmDetails(farm);
                  }}
                >
                  <Text style={styles.moreInfoText}>More info</Text>
                  <Icon name="arrow-right" size={12} color="#019a34" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2].map((index) => (
        <View key={index} style={styles.skeletonCard}>
          <SkeletonLoader height={p(120)} width="100%" borderRadius={p(12)} />
          <View style={styles.skeletonContent}>
            <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
            <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
            <SkeletonLoader height={p(16)} width="70%" borderRadius={p(4)} />
            <SkeletonLoader height={p(16)} width="50%" borderRadius={p(4)} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="leaf" size={p(80)} color="#ccc" />
      <Text style={styles.emptyTitle}>No Farms Added</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first farm location to manage your agricultural operations
      </Text>
      <TouchableOpacity style={styles.addFarmButton} onPress={handleAddFarm}>
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.addFarmButtonText}>Add Your First Farm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="My Farms"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : farms.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Farm Locations</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddFarm}>
              <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.farmsList}>
            {farms.map(renderFarmCard)}
          </View>
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmsSuccess());
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmsError());
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Farm"
        message={`Are you sure you want to delete ${farmToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteFarm}
        onCancel={() => {
          setShowDeleteModal(false);
          setFarmToDelete(null);
        }}
        type="warning"
      />

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowOptionsModal(false);
          setSelectedFarm(null);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => {
            setShowOptionsModal(false);
            setSelectedFarm(null);
          }}
        >
          <View style={[styles.optionsModalContainer, {
            position: 'absolute',
            left: modalPosition.x,
            top: modalPosition.y,
          }]}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleOptionSelect('view')}
            >
              <Text style={styles.optionText}>View Details</Text>
            </TouchableOpacity>
            
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
    padding: p(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#019a34',
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmsList: {
    gap: p(16),
    paddingBottom: p(28),
  },
  farmCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  farmImage: {
    width: '100%',
    height: p(120),
    resizeMode: 'cover',
  },
  optionsButton: {
    position: 'absolute',
    top: p(8),
    right: p(8),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: p(15),
    width: p(30),
    height: p(30),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  farmContent: {
    padding: p(16),
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  farmName: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
  },
  farmInfo: {
    marginBottom: p(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(12),
    gap: p(8),
  },
  infoText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: p(8),
  },
  descriptionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    lineHeight: p(20),
    marginBottom: p(8),
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: p(4),
  },
  moreInfoText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: p(30),
    lineHeight: p(24),
  },
  addFarmButton: {
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(8),
  },
  addFarmButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
  },
  skeletonContent: {
    marginTop: p(12),
    gap: p(8),
  },
});

export default MyFarmsScreen;
