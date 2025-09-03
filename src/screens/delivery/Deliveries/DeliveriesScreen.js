import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchAvailableDeliveries, 
  fetchAssignedDeliveries,
  assignDeliveryToSelf,
  fetchDeliveryDetails,
  fetchAssignedDeliveryDetails,
  clearDeliveryError,
  clearDeliverySuccess
} from '../../../redux/slices/deliverySlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const DeliveriesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    availableDeliveries, 
    assignedDeliveries, 
    loadingAvailable, 
    loadingAssigned, 
    assigningDelivery,
    error,
    success,
    message
  } = useSelector(state => state.delivery);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'assigned'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDeliveriesData();
    }, [])
  );

  useEffect(() => {
    filterDeliveries();
  }, [searchQuery, activeTab, availableDeliveries, assignedDeliveries]);

  useEffect(() => {
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearDeliverySuccess());
      // Refresh data after successful assignment
      loadDeliveriesData();
    }
  }, [success, message]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearDeliveryError());
    }
  }, [error]);

  const loadDeliveriesData = async () => {
    try {
      await Promise.all([
        dispatch(fetchAssignedDeliveries()),
        dispatch(fetchAvailableDeliveries())
      ]);
    } catch (error) {
      console.log('Error loading deliveries data:', error);
    }
  };

  const filterDeliveries = () => {
    const currentDeliveries = activeTab === 'available' ? availableDeliveries : assignedDeliveries;
    let filtered = currentDeliveries || [];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(delivery =>
        delivery.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDeliveries(filtered);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleDeliveryPress = (delivery) => {
    // Navigate to appropriate details screen based on active tab
    if (activeTab === 'available') {
      navigation.navigate('DeliveryDetails', { orderId: delivery.id });
    } else {
      navigation.navigate('AssignedDeliveryDetails', { orderId: delivery.id });
    }
  };

  const handleStatusChange = (deliveryId, newStatus) => {
    if (newStatus === 'assign') {
      dispatch(assignDeliveryToSelf(deliveryId));
    } else {
      // Handle other status changes
      console.log('Status change:', deliveryId, newStatus);
    }
  };

  const getDeliveryStatus = (delivery) => {
    if (activeTab === 'available') {
      return 'available';
    } else {
      switch (delivery.delivery_status) {
        case 'ready_for_delivery':
          return 'pending';
        case 'delivered':
          return 'completed';
        default:
          return 'pending';
      }
    }
  };

  const getStatusColor = (delivery) => {
    const status = getDeliveryStatus(delivery);
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'in_progress':
        return '#019a34';
      case 'completed':
        return '#28a745';
      case 'available':
        return '#17a2b8';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (delivery) => {
    const status = getDeliveryStatus(delivery);
    switch (status) {
      case 'pending':
        return 'Ready for Delivery';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Delivered';
      case 'available':
        return 'Available';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={p(16)} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search deliveries..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times" size={p(16)} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'available' && styles.activeTabButton]}
        onPress={() => setActiveTab('available')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'available' && styles.activeTabButtonText]}>
          Available ({availableDeliveries.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'assigned' && styles.activeTabButton]}
        onPress={() => setActiveTab('assigned')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'assigned' && styles.activeTabButtonText]}>
          Assigned ({assignedDeliveries.length})
        </Text>
      </TouchableOpacity>
    </View>
  );



  const renderDeliveryCard = (delivery) => (
    <TouchableOpacity
      key={delivery.id}
      style={styles.deliveryCard}
      onPress={() => handleDeliveryPress(delivery)}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{delivery.id}</Text>
          <Text style={styles.customerName}>{delivery.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery) }]}>
          <Text style={styles.statusText}>{getStatusText(delivery)}</Text>
        </View>
      </View>

      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={p(14)} color="#666" />
          <Text style={styles.detailText}>Ordered: {delivery.ordered_date}</Text>
        </View>
        {delivery.payment_method && (
          <View style={styles.detailRow}>
            <Icon name="credit-card" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Payment: {delivery.payment_method} ({delivery.payment_status})
            </Text>
          </View>
        )}
        {delivery.assignment_status && (
          <View style={styles.detailRow}>
            <Icon name="user" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Assignment: {delivery.assignment_status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.deliveryFooter}>
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsLabel}>Total Amount:</Text>
        </View>
        <Text style={styles.totalAmount}>{delivery.total_amount}</Text>
      </View>

      {activeTab === 'available' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.assignButton, assigningDelivery && styles.disabledButton]}
            onPress={() => handleStatusChange(delivery.id, 'assign')}
            disabled={assigningDelivery}
          >
            {assigningDelivery ? (
              <Icon name="spinner" size={p(14)} color="#fff" />
            ) : (
              <Icon name="plus" size={p(14)} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>
              {assigningDelivery ? 'Assigning...' : 'Assign to Me'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'assigned' && getDeliveryStatus(delivery) === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStatusChange(delivery.id, 'in_progress')}
          >
            <Icon name="play" size={p(14)} color="#fff" />
            <Text style={styles.actionButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Deliveries"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        {renderSearchBar()}
        {renderTabs()}

        {(loadingAvailable || loadingAssigned) ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map((index) => (
              <View key={index} style={styles.skeletonCard}>
                <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
                <SkeletonLoader height={p(16)} width="40%" borderRadius={p(4)} />
                <SkeletonLoader height={p(14)} width="80%" borderRadius={p(4)} />
                <SkeletonLoader height={p(14)} width="70%" borderRadius={p(4)} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView style={styles.deliveriesList} showsVerticalScrollIndicator={false}>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map(renderDeliveryCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="truck" size={p(60)} color="#ccc" />
                <Text style={styles.emptyText}>No deliveries found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try adjusting your search' : 
                   activeTab === 'available' ? 'No available deliveries' : 'No deliveries assigned yet'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Assignment Successful!"
        message={message || "Delivery assigned to you successfully."}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Assignment Failed"
        message={error || "Failed to assign delivery. Please try again."}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(4),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(6),
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#019a34',
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  searchContainer: {
    marginBottom: p(16),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(12),
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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

  deliveriesList: {
    flex: 1,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(4),
  },
  customerName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(16),
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  deliveryDetails: {
    marginBottom: p(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  detailText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: p(8),
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  itemsContainer: {
    flex: 1,
  },
  itemsLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  itemsText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: p(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingVertical: p(10),
    borderRadius: p(8),
    gap: p(6),
  },
  startButton: {
    backgroundColor: '#019a34',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  assignButton: {
    backgroundColor: '#17a2b8',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    gap: p(8),
  },
});

export default DeliveriesScreen;
