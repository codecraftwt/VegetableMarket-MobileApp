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
  TextInput,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { fetchFarmerVegetables, deleteVegetable, updateVegetableStatus, clearFarmerVegetablesError, clearFarmerVegetablesSuccess } from '../../../redux/slices/farmerVegetablesSlice';

const FarmerBucketScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { vegetables, loading, error, success, message } = useSelector(state => state.farmerVegetables);
  
  // Debug Redux state
  useEffect(() => {
    console.log('Redux state changed:', { success, message, error, vegetablesCount: vegetables.length });
  }, [success, message, error, vegetables.length]);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [isViewChanging, setIsViewChanging] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedVegetable, setSelectedVegetable] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVegetables, setFilteredVegetables] = useState([]);

  // Debug selectedVegetable changes
  useEffect(() => {
    console.log('selectedVegetable changed:', selectedVegetable);
  }, [selectedVegetable]);

  useEffect(() => {
    // Clear any lingering success state when component mounts
    dispatch(clearFarmerVegetablesSuccess());
    // Fetch vegetables data from API
    dispatch(fetchFarmerVegetables());
  }, [dispatch]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Clear any lingering success state when screen comes into focus
      dispatch(clearFarmerVegetablesSuccess());
      // Refresh vegetables data when screen comes into focus
      dispatch(fetchFarmerVegetables());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  // Handle success and error states - only for delete operations
  useEffect(() => {
    if (success && message && message.includes('deleted')) {
      console.log('Delete success modal triggered:', message);
      console.log('Current vegetables count:', vegetables.length);
      setShowSuccessModal(true);
    }
  }, [success, message, vegetables.length]);

  useEffect(() => {
    if (error) {
      console.log('Error modal triggered:', error);
      setShowErrorModal(true);
    }
  }, [error]);

  // Filter vegetables based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVegetables(vegetables);
    } else {
      const filtered = vegetables.filter(vegetable =>
        vegetable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vegetable.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vegetable.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVegetables(filtered);
    }
  }, [vegetables, searchQuery]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleAddVegetable = () => {
    navigation.navigate('AddVegetable');
  };

  const handleVegetablePress = (vegetable) => {
    navigation.navigate('VegetableDetails', { vegetableId: vegetable.id });
  };

  const handleThreeDotsPress = (event, vegetable) => {
    event.stopPropagation();
    console.log('Setting selected vegetable:', vegetable);
    setSelectedVegetable(vegetable);
    
    // Get the position of the touch event
    const { pageX, pageY } = event.nativeEvent;
    setModalPosition({ x: pageX - 100, y: pageY + 10 }); // Adjust position to show below the button
    setShowActionModal(true);
  };

  const handleEditVegetable = () => {
    setShowActionModal(false);
    navigation.navigate('EditVegetable', { vegetableId: selectedVegetable.id });
  };

  const handleDeleteVegetable = () => {
    console.log('Delete button pressed, selectedVegetable:', selectedVegetable);
    console.log('selectedVegetable name:', selectedVegetable?.name);
    setShowActionModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmationModal(false);
    if (selectedVegetable) {
      console.log('Deleting vegetable with ID:', selectedVegetable.id);
      dispatch(deleteVegetable(selectedVegetable.id));
      // Clear selectedVegetable after initiating delete
      setSelectedVegetable(null);
    } else {
      console.log('No selected vegetable to delete');
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationModal(false);
    setSelectedVegetable(null);
  };

  const handleStatusPress = (vegetable) => {
    setSelectedVegetable(vegetable);
    setShowStatusModal(true);
  };

  const handleStatusChange = (newStatus) => {
    setShowStatusModal(false);
    if (selectedVegetable) {
      dispatch(updateVegetableStatus({ 
        vegetableId: selectedVegetable.id, 
        status: newStatus 
      }));
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusModal(false);
    setSelectedVegetable(null);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    // Don't clear selectedVegetable here as it's needed for delete confirmation
  };

  const toggleViewMode = () => {
    setIsViewChanging(true);
    setViewMode(viewMode === 'cards' ? 'list' : 'cards');
    
    // Reset the view changing state after a short delay
    setTimeout(() => {
      setIsViewChanging(false);
    }, 100);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetables..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="times" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderVegetableCard = (vegetable) => {
    // Get the first image URL if available
    const imageUrl = vegetable.images && vegetable.images.length > 0 
      ? `https://vegetables.walstarmedia.com/storage/${vegetable.images[0].image_path}`
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400';

    return (
      <TouchableOpacity 
        key={vegetable.id} 
        style={styles.vegetableCard}
        onPress={() => handleVegetablePress(vegetable)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.vegetableImage} />
          {vegetable.is_organic === 1 && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicBadgeText}>Organic</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.threeDotsButton}
            onPress={(event) => handleThreeDotsPress(event, vegetable)}
            activeOpacity={0.7}
          >
            <Icon name="ellipsis-v" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.vegetableContent}>
          <View style={styles.vegetableHeader}>
            <Text style={styles.vegetableName}>{vegetable.name}</Text>
            <TouchableOpacity 
              style={[
                styles.statusBadge, 
                vegetable.status === 'active' ? styles.activeBadge : styles.pausedBadge
              ]}
              onPress={() => handleStatusPress(vegetable)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.statusText, 
                vegetable.status === 'active' ? styles.activeText : styles.pausedText
              ]}>
                {vegetable.status}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.vegetableInfo}>
            <View style={styles.infoRow}>
              <Icon name="tag" size={14} color="#666" />
              <Text style={styles.infoText}>{vegetable.category.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="dollar" size={14} color="#666" />
              <Text style={styles.infoText}>₹{vegetable.price_per_kg} per {vegetable.unit_type}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="cube" size={14} color="#666" />
              <Text style={styles.infoText}>Stock: {vegetable.quantity_available} {vegetable.unit_type}</Text>
            </View>
            
            {vegetable.grade && (
              <View style={styles.infoRow}>
                <Icon name="star" size={14} color="#666" />
                <Text style={styles.infoText}>Grade: {vegetable.grade}</Text>
              </View>
            )}
          </View>
          
          {vegetable.description && (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {vegetable.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderVegetableListItem = (vegetable) => {
    // Get the first image URL if available
    const imageUrl = vegetable.images && vegetable.images.length > 0 
      ? `https://vegetables.walstarmedia.com/storage/${vegetable.images[0].image_path}`
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400';

    return (
      <TouchableOpacity 
        key={vegetable.id} 
        style={styles.vegetableListItem}
        onPress={() => handleVegetablePress(vegetable)}
        activeOpacity={0.7}
      >
        <TouchableOpacity 
          style={styles.listThreeDotsButton}
          onPress={(event) => handleThreeDotsPress(event, vegetable)}
          activeOpacity={0.7}
        >
          <Icon name="ellipsis-v" size={16} color="#666" />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.listItemImage} />
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Text style={styles.listItemName}>{vegetable.name}</Text>
          </View>
          
          <View style={styles.listItemInfo}>
            <Text style={styles.listItemCategory}>{vegetable.category.name}</Text>
            <Text style={styles.listItemPrice}>₹{vegetable.price_per_kg} per {vegetable.unit_type}</Text>
            <Text style={styles.listItemStock}>Stock: {vegetable.quantity_available} {vegetable.unit_type}</Text>
          </View>
        </View>
        <View style={styles.listItemStatus}>
          <TouchableOpacity 
            style={[
              styles.statusBadge, 
              vegetable.status === 'active' ? styles.activeBadge : styles.pausedBadge
            ]}
            onPress={() => handleStatusPress(vegetable)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.statusText, 
              vegetable.status === 'active' ? styles.activeText : styles.pausedText
            ]}>
              {vegetable.status}
            </Text>
          </TouchableOpacity>
          {vegetable.is_organic === 1 && (
            <View style={styles.listOrganicBadge}>
              <Text style={styles.listOrganicBadgeText}>Organic</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((index) => (
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
      <Text style={styles.emptyTitle}>No Vegetables Added</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first vegetable to manage your inventory
      </Text>
      <TouchableOpacity style={styles.addVegetableButton} onPress={handleAddVegetable}>
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.addVegetableButtonText}>Add Your First Vegetable</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="My Vegetables"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : vegetables.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Vegetable Inventory</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.viewModeButton} onPress={toggleViewMode}>
                <Icon 
                  name={viewMode === 'cards' ? 'list' : 'th-large'} 
                  size={16} 
                  color="#019a34" 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddVegetable}>
                <Icon name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {renderSearchBar()}

          <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
            {filteredVegetables.length === 0 && searchQuery.trim() !== '' ? (
              <View style={styles.noResultsContainer}>
                <Icon name="search" size={p(60)} color="#ccc" />
                <Text style={styles.noResultsTitle}>No Results Found</Text>
                <Text style={styles.noResultsSubtitle}>
                  No vegetables match your search "{searchQuery}"
                </Text>
                <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={viewMode === 'cards' ? styles.vegetablesList : styles.vegetablesListContainer}>
                {!isViewChanging && filteredVegetables.map(viewMode === 'cards' ? renderVegetableCard : renderVegetableListItem)}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Vegetable Deleted Successfully!"
        message={message || 'The vegetable has been deleted from your inventory.'}
        buttonText="Continue"
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmerVegetablesSuccess());
        }}
        onButtonPress={() => {
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
              onPress={handleEditVegetable}
            >
              <Icon name="edit" size={16} color="#019a34" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeleteVegetable}
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
        message={`Are you sure you want to delete "${selectedVegetable?.name || 'this vegetable'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="destructive"
        icon="delete-alert"
        onConfirm={() => {
          console.log('Confirm delete clicked, selectedVegetable:', selectedVegetable);
          handleConfirmDelete();
        }}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />

      {/* Status Change Modal */}
      <ConfirmationModal
        visible={showStatusModal}
        title="Change Status"
        message={`Do you want to ${selectedVegetable?.status === 'active' ? 'pause' : 'activate'} "${selectedVegetable?.name || 'this vegetable'}"?`}
        confirmText={selectedVegetable?.status === 'active' ? 'Pause' : 'Activate'}
        cancelText="Cancel"
        confirmButtonStyle="primary"
        icon="help-circle"
        onConfirm={() => handleStatusChange(selectedVegetable?.status === 'active' ? 'paused' : 'active')}
        onCancel={handleCancelStatusChange}
        onClose={handleCancelStatusChange}
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
  scrollableContent: {
    flex: 1,
    marginBottom: p(100),
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  viewModeButton: {
    backgroundColor: '#fff',
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#019a34',
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vegetablesList: {
    gap: p(16),
    paddingBottom: p(28),
  },
  vegetablesListContainer: {
    paddingBottom: p(28),
  },
  vegetableCard: {
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
  vegetableImage: {
    width: '100%',
    height: p(120),
    resizeMode: 'cover',
  },
  organicBadge: {
    position: 'absolute',
    top: p(8),
    left: p(8),
    backgroundColor: '#28a745',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  organicBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  vegetableContent: {
    padding: p(16),
  },
  vegetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  vegetableName: {
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
  pausedBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  activeText: {
    color: '#155724',
  },
  pausedText: {
    color: '#721c24',
  },
  vegetableInfo: {
    marginBottom: p(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
    gap: p(8),
  },
  infoText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  descriptionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    lineHeight: p(18),
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
  addVegetableButton: {
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(8),
  },
  addVegetableButtonText: {
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
  // List view styles
  vegetableListItem: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: p(80),
    marginBottom: p(8),
  },
  listItemImage: {
    width: p(50),
    height: p(50),
    borderRadius: p(8),
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  listItemContent: {
    flex: 1,
    marginLeft: p(12),
    justifyContent: 'center',
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  listItemName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
  },
  listOrganicBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: p(6),
    paddingVertical: p(2),
    borderRadius: p(8),
    marginLeft: p(8),
  },
  listOrganicBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  listItemInfo: {
    gap: p(3),
  },
  listItemCategory: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  listItemPrice: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  listItemStock: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  listItemStatus: {
    marginLeft: p(12),
    alignItems: 'center',
    gap: p(8),
  },
  // Three dots button styles
  threeDotsButton: {
    position: 'absolute',
    top: p(8),
    right: p(8),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: p(28),
    height: p(28),
    borderRadius: p(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  listThreeDotsButton: {
    position: 'absolute',
    top: p(8),
    right: p(8),
    width: p(24),
    height: p(24),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  // Search bar styles
  searchContainer: {
    marginBottom: p(20),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(6),
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: p(12),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  clearButton: {
    padding: p(4),
    marginLeft: p(8),
  },
  // No results styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
    minHeight: p(300),
  },
  noResultsTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  noResultsSubtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: p(30),
    lineHeight: p(24),
  },
  clearSearchButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
  },
  clearSearchButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default FarmerBucketScreen;
