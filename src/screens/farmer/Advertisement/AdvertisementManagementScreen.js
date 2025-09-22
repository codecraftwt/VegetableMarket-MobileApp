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
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchAdvertisements, 
  deleteAdvertisement,
  clearAdvertisementError, 
  clearAdvertisementSuccess 
} from '../../../redux/slices/advertisementSlice';

const AdvertisementManagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { advertisements, loading, error, success, message, deleting } = useSelector((state) => state.advertisement);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [advertisementToDelete, setAdvertisementToDelete] = useState(null);

  useEffect(() => {
    const loadAdvertisements = async () => {
      try {
        await dispatch(fetchAdvertisements()).unwrap();
      } catch (error) {
        console.log('Failed to load advertisements:', error);
      }
    };
    loadAdvertisements();
  }, [dispatch]);

  // Handle success/error states - Only handle delete success here
  useEffect(() => {
    if (success && message && message.includes('deleted') && !showSuccessModal) {
      setShowSuccessModal(true);
      dispatch(clearAdvertisementSuccess());
    }
  }, [success, message, dispatch, showSuccessModal]);

  useEffect(() => {
    if (error) {
      console.log('Advertisement error:', error);
      // Only show error modal if it's not a "no advertisements" case
      if (!error.includes('FarmerAdvertisementController') || !error.includes('does not exist')) {
        setShowErrorModal(true);
      }
      dispatch(clearAdvertisementError());
    }
  }, [error, dispatch]);

  const handleNotificationPress = () => {
    console.log('Advertisement Management notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCreateAdvertisement = () => {
    navigation.navigate('CreateAdvertisement');
  };

  const handleEditAdvertisement = (advertisement) => {
    navigation.navigate('EditAdvertisement', { advertisement });
  };

  const handleDeleteAdvertisement = (advertisement) => {
    setAdvertisementToDelete(advertisement);
    setShowDeleteConfirmationModal(true);
  };

  const confirmDeleteAdvertisement = () => {
    if (advertisementToDelete) {
      console.log('Deleting advertisement:', advertisementToDelete.id);
      dispatch(deleteAdvertisement(advertisementToDelete.id));
      setShowDeleteConfirmationModal(false);
      setAdvertisementToDelete(null);
    }
  };

  const cancelDeleteAdvertisement = () => {
    setShowDeleteConfirmationModal(false);
    setAdvertisementToDelete(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchAdvertisements()).finally(() => {
      setRefreshing(false);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'active':
        return '#2196F3';
      case 'expired':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'clock-o';
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'times-circle';
      case 'active':
        return 'play-circle';
      case 'expired':
        return 'stop-circle';
      default:
        return 'clock-o';
    }
  };

  const AdvertisementCard = ({ advertisement }) => (
    <View style={styles.advertisementCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.advertisementTitle} numberOfLines={2}>
            {advertisement.title}
          </Text>
          <Text style={styles.advertisementId}>#{advertisement.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(advertisement.status) + '15' }]}>
          <Icon 
            name={getStatusIcon(advertisement.status)} 
            size={12} 
            color={getStatusColor(advertisement.status)} 
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: getStatusColor(advertisement.status) }]}>
            {advertisement.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>

      <Text style={styles.advertisementMessage} numberOfLines={3}>
        {advertisement.message}
      </Text>

      {advertisement.image && (
        <Image
          source={{ uri: `https://vegetables.walstarmedia.com/storage/${advertisement.image}` }}
          style={styles.advertisementImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Icon name="calendar" size={12} color="#666" />
          <Text style={styles.dateLabel}>From:</Text>
          <Text style={styles.dateText}>{formatDate(advertisement.from)}</Text>
        </View>
        <View style={styles.dateItem}>
          <Icon name="calendar" size={12} color="#666" />
          <Text style={styles.dateLabel}>To:</Text>
          <Text style={styles.dateText}>{formatDate(advertisement.to)}</Text>
        </View>
      </View>

      {advertisement.rejection_reason && (
        <View style={styles.rejectionContainer}>
          <Icon name="exclamation-triangle" size={14} color="#F44336" />
          <Text style={styles.rejectionText}>{advertisement.rejection_reason}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditAdvertisement(advertisement)}
        >
          <Icon name="edit" size={16} color="#019a34" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton, deleting && styles.actionButtonDisabled]}
          onPress={() => handleDeleteAdvertisement(advertisement)}
          disabled={deleting}
        >
          <Icon name="trash" size={16} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bullhorn" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Advertisements</Text>
      <Text style={styles.emptySubtitle}>
        You haven't created any advertisements yet.{'\n'}
        Create your first advertisement to promote your products.
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateAdvertisement}>
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Advertisement</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonBadge} />
          </View>
          <View style={styles.skeletonMessage} />
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonDates}>
            <View style={styles.skeletonDate} />
            <View style={styles.skeletonDate} />
          </View>
          <View style={styles.skeletonActions}>
            <View style={styles.skeletonAction} />
            <View style={styles.skeletonAction} />
          </View>
        </View>
      ))}
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="exclamation-triangle" size={64} color="#F44336" />
      <Text style={styles.errorTitle}>Failed to Load Advertisements</Text>
      <Text style={styles.errorSubtitle}>
        {error || "Something went wrong. Please try again."}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchAdvertisements())}>
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader
        screenName="Advertisement Management"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : error && !error.includes('FarmerAdvertisementController') ? (
        <ErrorState />
      ) : advertisements.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#019a34']}
              tintColor="#019a34"
            />
          }
        >
          <View style={styles.headerSection}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Your Advertisements</Text>
              <Text style={styles.headerSubtitle}>
                {advertisements.length} advertisement{advertisements.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.fabButton} onPress={handleCreateAdvertisement}>
              <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.advertisementsList}>
            {advertisements.map((advertisement) => (
              <AdvertisementCard key={advertisement.id} advertisement={advertisement} />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Success Modal - Only for delete operations */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={message || "Advertisement deleted successfully"}
        buttonText="OK"
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || "Something went wrong. Please try again."}
        buttonText="Retry"
        onButtonPress={() => {
          setShowErrorModal(false);
          dispatch(fetchAdvertisements());
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirmationModal}
        onClose={cancelDeleteAdvertisement}
        title="Delete Advertisement"
        message={`Are you sure you want to delete "${advertisementToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAdvertisement}
        onCancel={cancelDeleteAdvertisement}
        confirmButtonStyle="destructive"
        icon="delete-alert"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: p(16),
  },

  // Header Section
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  fabButton: {
    backgroundColor: '#019a34',
    width: p(48),
    height: p(48),
    borderRadius: p(24),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Advertisement Card
  advertisementsList: {
    gap: p(16),
  },
  advertisementCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  titleContainer: {
    flex: 1,
    marginRight: p(12),
  },
  advertisementTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  advertisementId: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(20),
  },
  statusIcon: {
    marginRight: p(4),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  advertisementMessage: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(22),
    marginBottom: p(12),
  },
  advertisementImage: {
    width: '100%',
    height: p(120),
    borderRadius: p(12),
    marginBottom: p(12),
  },
  dateContainer: {
    marginBottom: p(12),
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(4),
  },
  dateLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(6),
    marginRight: p(8),
  },
  dateText: {
    fontSize: fontSizes.sm,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffebee',
    padding: p(12),
    borderRadius: p(8),
    marginBottom: p(12),
  },
  rejectionText: {
    fontSize: fontSizes.sm,
    color: '#F44336',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(8),
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: p(12),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#019a34',
    backgroundColor: '#f0f8f0',
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(6),
  },
  deleteButton: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#F44336',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(22),
    marginBottom: p(32),
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
  },
  createButtonText: {
    fontSize: fontSizes.base,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },

  // Skeleton Loader
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  skeletonTitle: {
    height: p(20),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '60%',
  },
  skeletonBadge: {
    height: p(24),
    backgroundColor: '#e0e0e0',
    borderRadius: p(12),
    width: p(80),
  },
  skeletonMessage: {
    height: p(16),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '100%',
    marginBottom: p(8),
  },
  skeletonImage: {
    height: p(120),
    backgroundColor: '#e0e0e0',
    borderRadius: p(12),
    marginBottom: p(12),
  },
  skeletonDates: {
    marginBottom: p(12),
  },
  skeletonDate: {
    height: p(14),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '70%',
    marginBottom: p(4),
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: p(12),
  },
  skeletonAction: {
    flex: 1,
    height: p(40),
    backgroundColor: '#e0e0e0',
    borderRadius: p(8),
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  errorTitle: {
    fontSize: fontSizes.xl,
    color: '#F44336',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  errorSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(22),
    marginBottom: p(32),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
  },
  retryButtonText: {
    fontSize: fontSizes.base,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },
});

export default AdvertisementManagementScreen;
