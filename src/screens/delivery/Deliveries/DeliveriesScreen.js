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
import { updateOrderStatus, updateAssignmentStatus, updatePaymentStatus } from '../../../redux/slices/todaysTaskSlice';
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
    } else if (newStatus === 'in_progress') {
      // Map to API format
      dispatch(updateOrderStatus({ orderId: deliveryId, status: 'out_for_delivery' }));
    } else if (newStatus === 'delivered') {
      dispatch(updateOrderStatus({ orderId: deliveryId, status: 'delivered' }));
    } else {
      // Handle other status changes
      console.log('Status change:', deliveryId, newStatus);
    }
  };

  const handleUpdateAssignmentStatus = (assignmentId, status) => {
    dispatch(updateAssignmentStatus({ assignmentId, status }));
  };

  const handleUpdatePaymentStatus = (orderId, paymentStatus) => {
    dispatch(updatePaymentStatus({ orderId, paymentStatus }));
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
        <View style={styles.searchIconContainer}>
          <Icon name="search" size={p(18)} color="#6b7280" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search deliveries..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
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
      activeOpacity={0.7}
    >
      {/* Card Header with Gradient Background */}
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <View style={styles.orderIdContainer}>
            <Icon name="hashtag" size={p(12)} color="#2563eb" />
            <Text style={styles.orderId}>{delivery.id}</Text>
          </View>
          <Text style={styles.customerName}>{delivery.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery) }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{getStatusText(delivery)}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.deliveryDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Icon name="calendar" size={p(14)} color="#6b7280" />
            </View>
            <Text style={styles.detailText}>Ordered: {delivery.ordered_date}</Text>
          </View>
          
          {delivery.payment_method && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="credit-card" size={p(14)} color="#6b7280" />
              </View>
              <Text style={styles.detailText}>
                {delivery.payment_method} • {delivery.payment_status}
              </Text>
            </View>
          )}
          
          {delivery.assignment_status && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="user-check" size={p(14)} color="#6b7280" />
              </View>
              <Text style={styles.detailText}>
                {delivery.assignment_status}
              </Text>
            </View>
          )}
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{delivery.total_amount}</Text>
          </View>
          <View style={styles.deliveryIconContainer}>
            <Icon name="truck" size={p(20)} color="#2563eb" />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {activeTab === 'available' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.assignButton, assigningDelivery && styles.disabledButton]}
            onPress={() => handleStatusChange(delivery.id, 'assign')}
            disabled={assigningDelivery}
          >
            {assigningDelivery ? (
              <Icon name="spinner" size={p(16)} color="#fff" />
            ) : (
              <Icon name="plus" size={p(16)} color="#fff" />
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
            <Icon name="play" size={p(16)} color="#fff" />
            <Text style={styles.actionButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Card Footer with subtle border */}
      <View style={styles.cardFooter} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
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
                <View style={styles.emptyIconContainer}>
                  <Icon name="truck" size={p(48)} color="#6b7280" />
                </View>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No deliveries found' : 
                   activeTab === 'available' ? 'No available deliveries' : 'No assigned deliveries'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try adjusting your search terms' : 
                   activeTab === 'available' ? 'Check back later for new delivery opportunities' : 'You haven\'t been assigned any deliveries yet'}
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
    padding: p(12),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(4),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: p(8),
    paddingHorizontal: p(12),
    borderRadius: p(6),
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: '#019a34',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: p(12),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIconContainer: {
    width: p(18),
    height: p(18),
    borderRadius: p(9),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    width: p(18),
    height: p(18),
    borderRadius: p(9),
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deliveriesList: {
    flex: 1,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    marginBottom: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(12),
    paddingTop: p(12),
    paddingBottom: p(8),
    backgroundColor: '#fafafa',
  },
  orderInfo: {
    flex: 1,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(2),
  },
  orderId: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    marginLeft: p(4),
  },
  customerName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  statusDot: {
    width: p(4),
    height: p(4),
    borderRadius: p(2),
    backgroundColor: '#fff',
    marginRight: p(4),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  cardContent: {
    paddingHorizontal: p(12),
    paddingBottom: p(8),
  },
  deliveryDetails: {
    marginBottom: p(8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(4),
  },
  detailIconContainer: {
    width: p(16),
    height: p(16),
    borderRadius: p(8),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p(6),
  },
  detailText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(8),
    paddingHorizontal: p(8),
    backgroundColor: '#f8fafc',
    borderRadius: p(6),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: p(2),
  },
  totalAmount: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#059669',
  },
  deliveryIconContainer: {
    width: p(24),
    height: p(24),
    borderRadius: p(12),
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    height: p(2),
    backgroundColor: '#019a34',
    opacity: 0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: p(12),
    paddingBottom: p(8),
    paddingTop: p(6),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderRadius: p(6),
    gap: p(4),
    flex: 1,
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
    paddingVertical: p(80),
    paddingHorizontal: p(40),
  },
  emptyIconContainer: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(16),
  },
  emptyText: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(12),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(24),
  },
  loadingContainer: {
    flex: 1,
    paddingTop: p(20),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    marginBottom: p(16),
    gap: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default DeliveriesScreen;
