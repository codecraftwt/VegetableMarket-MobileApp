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
  RefreshControl,
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
  clearDeliverySuccess,
  clearAssigningState
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
    assigningDelivery, // Now this is an object: { orderId1: true, orderId2: false }
    error,
    success,
    message
  } = useSelector(state => state.delivery);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tabChanging, setTabChanging] = useState(false);
  const [startingDeliveries, setStartingDeliveries] = useState({});

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

  // NEW: Helper function to check if a specific delivery is being assigned
  const isDeliveryAssigning = (deliveryId) => {
    return assigningDelivery[deliveryId] || false;
  };

  const handleTabChange = async (tab) => {
    if (tabChanging) return;

    setTabChanging(true);
    setActiveTab(tab);

    try {
      if (tab === 'available') {
        await dispatch(fetchAvailableDeliveries());
      } else {
        await dispatch(fetchAssignedDeliveries());
      }
    } catch (error) {
      console.log('Error loading tab data:', error);
    } finally {
      setTabChanging(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDeliveriesData();
    setRefreshing(false);
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

  // const handleStatusChange = (deliveryId, newStatus) => {
  //   if (newStatus === 'assign') {
  //     dispatch(assignDeliveryToSelf(deliveryId));
  //   } else if (newStatus === 'in_progress') {
  //     dispatch(updateOrderStatus({ orderId: deliveryId, status: 'out_for_delivery' }));
  //     // Navigate to the AssignedDeliveryDetails screen after status update
  //     setTimeout(() => {
  //       navigation.navigate('AssignedDeliveryDetails', {
  //         orderId: deliveryId
  //       });
  //     }, 2200); // 2 seconds delay
  //   } else if (newStatus === 'delivered') {
  //     dispatch(updateOrderStatus({ orderId: deliveryId, status: 'delivered' }));
  //   } else {
  //     console.log('Status change:', deliveryId, newStatus);
  //   }
  // };
  // const handleStatusChange = (deliveryId, newStatus) => {
  //   if (newStatus === 'assign') {
  //     dispatch(assignDeliveryToSelf(deliveryId));
  //   } else if (newStatus === 'in_progress') {
  //     // Set loading state for this specific delivery
  //     setStartingDeliveries(prev => ({ ...prev, [deliveryId]: true }));

  //     dispatch(updateOrderStatus({ orderId: deliveryId, status: 'out_for_delivery' }));

  //     // Navigate to the AssignedDeliveryDetails screen after status update
  //     setTimeout(() => {
  //       navigation.navigate('AssignedDeliveryDetails', {
  //         orderId: deliveryId
  //       });
  //       // Clear the loading state after navigation
  //       setStartingDeliveries(prev => {
  //         const newState = { ...prev };
  //         delete newState[deliveryId];
  //         return newState;
  //       });
  //     }, 2200); // 2 seconds delay
  //   } else if (newStatus === 'delivered') {
  //     dispatch(updateOrderStatus({ orderId: deliveryId, status: 'delivered' }));
  //   } else {
  //     console.log('Status change:', deliveryId, newStatus);
  //   }
  // };
  const handleStatusChange = (deliveryId, newStatus) => {
    if (newStatus === 'assign') {
      dispatch(assignDeliveryToSelf(deliveryId));
    } else if (newStatus === 'in_progress') {
      // Set loading state for this specific delivery
      setStartingDeliveries(prev => ({ ...prev, [deliveryId]: true }));

      dispatch(updateOrderStatus({ orderId: deliveryId, status: 'out_for_delivery' }));

      // Navigate to the AssignedDeliveryDetails screen after status update
      setTimeout(() => {
        navigation.navigate('AssignedDeliveryDetails', {
          orderId: deliveryId,
          autoScrollToBottom: true // Add this flag
        });
        // Clear the loading state after navigation
        setStartingDeliveries(prev => {
          const newState = { ...prev };
          delete newState[deliveryId];
          return newState;
        });
      }, 2200); // 2 seconds delay
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
        case 'out_for_delivery':
          return 'in_progress';
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
        return 'Out for Delivery';
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
        onPress={() => handleTabChange('available')}
        disabled={tabChanging}
      >
        <Text style={[styles.tabButtonText, activeTab === 'available' && styles.activeTabButtonText]}>
          Available ({availableDeliveries.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'assigned' && styles.activeTabButton]}
        onPress={() => handleTabChange('assigned')}
        disabled={tabChanging}
      >
        <Text style={[styles.tabButtonText, activeTab === 'assigned' && styles.activeTabButtonText]}>
          Assigned ({assignedDeliveries.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = () => {
    if (tabChanging) return true;
    if (activeTab === 'available' && loadingAvailable) return true;
    if (activeTab === 'assigned' && loadingAssigned) return true;
    return false;
  };

  const renderDeliveryCard = (delivery) => {
    const isThisDeliveryAssigning = isDeliveryAssigning(delivery.id);

    return (
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
                  <Icon name="handshake-o" size={p(14)} color="#6b7280" />
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

        {/* Action Buttons - UPDATED */}
        {activeTab === 'available' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.assignButton,
                isThisDeliveryAssigning && styles.disabledButton
              ]}
              onPress={() => handleStatusChange(delivery.id, 'assign')}
              disabled={isThisDeliveryAssigning}
            >
              {isThisDeliveryAssigning ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="plus" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {isThisDeliveryAssigning ? 'Assigning...' : 'Assign to Me'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ... rest of your action buttons remain the same */}
        {/* {activeTab === 'assigned' && getDeliveryStatus(delivery) === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusChange(delivery.id, 'in_progress')}
            >
              <Icon name="play" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          </View>
        )} */}
        {activeTab === 'assigned' && getDeliveryStatus(delivery) === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.startButton,
                startingDeliveries[delivery.id] && styles.disabledButton
              ]}
              onPress={() => handleStatusChange(delivery.id, 'in_progress')}
              disabled={startingDeliveries[delivery.id]}
            >
              {startingDeliveries[delivery.id] ? (
                <>
                  <Icon name="spinner" size={p(16)} color="#fff" />
                  <Text style={styles.actionButtonText}>Starting...</Text>
                </>
              ) : (
                <>
                  <Icon name="play" size={p(16)} color="#fff" />
                  <Text style={styles.actionButtonText}>Start Delivery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'assigned' && getDeliveryStatus(delivery) === 'in_progress' && delivery.payment_status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton]}
              onPress={() => handleUpdatePaymentStatus(delivery.id, 'paid')}
            >
              <Icon name="credit-card" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Payment Paid</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'assigned' && getDeliveryStatus(delivery) === 'in_progress' && delivery.payment_status === 'paid' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange(delivery.id, 'delivered')}
            >
              <Icon name="check" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Footer with subtle border */}
        <View style={styles.cardFooter} />
      </TouchableOpacity>
    );
  };

  const renderDeliveriesList = () => (
    <ScrollView
      style={styles.deliveriesList}
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
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <View style={styles.loadingSpinner}>
          <Icon name="spinner" size={p(30)} color="#019a34" />
        </View>
        <Text style={styles.loadingText}>
          Loading {activeTab === 'available' ? 'available' : 'assigned'} deliveries...
        </Text>
      </View>
    </View>
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

        {isLoading() ? (
          renderLoadingState()
        ) : (
          renderDeliveriesList()
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
  disabledButton: {
    opacity: 0.6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(4),
    marginBottom: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: p(6),
    paddingHorizontal: p(8),
    borderRadius: p(6),
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: '#019a34',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  searchContainer: {
    marginBottom: p(8),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(8),
    paddingHorizontal: p(10),
    paddingVertical: p(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIconContainer: {
    width: p(16),
    height: p(16),
    borderRadius: p(8),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p(6),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    width: p(16),
    height: p(16),
    borderRadius: p(8),
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
    marginBottom: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(10),
    paddingTop: p(10),
    paddingBottom: p(6),
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
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    marginLeft: p(3),
  },
  customerName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(6),
    paddingVertical: p(3),
    borderRadius: p(10),
  },
  statusDot: {
    width: p(3),
    height: p(3),
    borderRadius: p(1.5),
    backgroundColor: '#fff',
    marginRight: p(3),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  cardContent: {
    paddingHorizontal: p(10),
    paddingBottom: p(6),
  },
  deliveryDetails: {
    marginBottom: p(6),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(3),
  },
  detailIconContainer: {
    width: p(14),
    height: p(14),
    borderRadius: p(7),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p(5),
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
    paddingVertical: p(6),
    paddingHorizontal: p(6),
    backgroundColor: '#f8fafc',
    borderRadius: p(4),
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
    marginBottom: p(1),
  },
  totalAmount: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    color: '#059669',
  },
  deliveryIconContainer: {
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    height: p(1),
    backgroundColor: '#019a34',
    opacity: 0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: p(10),
    paddingBottom: p(6),
    paddingTop: p(4),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    borderRadius: p(4),
    gap: p(3),
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
  paymentButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(50),
    paddingHorizontal: p(30),
  },
  emptyIconContainer: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(12),
  },
  emptyText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(8),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(18),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(60),
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(16),
  },
  loadingText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(8),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
});

export default DeliveriesScreen;
