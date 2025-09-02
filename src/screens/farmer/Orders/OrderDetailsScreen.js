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
  TextInput,
  Modal,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, updateOrderItemStatus, clearFarmerOrdersError, clearFarmerOrdersSuccess, clearSelectedOrder } from '../../../redux/slices/farmerOrdersSlice';
import ErrorModal from '../../../components/ErrorModal';
import SuccessModal from '../../../components/SuccessModal';

const OrderDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { selectedOrder, loadingOrder, updatingItemStatus, error, success, message } = useSelector(state => state.farmerOrders);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdatingItemStatus, setIsUpdatingItemStatus] = useState(false);

  const { orderId } = route.params;

  useEffect(() => {
    // Clear any existing selected order data and success state when navigating to a new order
    dispatch(clearSelectedOrder());
    dispatch(clearFarmerOrdersSuccess());
    
    // Always fetch the specific order when component mounts or orderId changes
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh order data when screen comes into focus
      if (orderId) {
        dispatch(fetchOrderById(orderId));
      }
    });

    return unsubscribe;
  }, [navigation, dispatch, orderId]);

  // Handle error states
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Handle success states - only show modal for item status updates, not for fetching order details
  useEffect(() => {
    if (success && message && isUpdatingItemStatus) {
      // Only show success modal if we're updating item status
      setShowSuccessModal(true);
      setShowStatusModal(false);
      setRejectionReason('');
      setSelectedItem(null);
      setIsUpdatingItemStatus(false);
      // Refresh order data after successful update
      if (orderId) {
        dispatch(fetchOrderById(orderId));
      }
    }
  }, [success, message, isUpdatingItemStatus, orderId, dispatch]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleItemStatusPress = (item) => {
    if (item.status === 'pending') {
      setSelectedItem(item);
      setShowStatusModal(true);
    }
  };

  const handleAcceptItem = () => {
    if (selectedItem) {
      setIsUpdatingItemStatus(true);
      const itemData = {
        item_id: selectedItem.item_id,
        status: 'accepted'
      };
      dispatch(updateOrderItemStatus(itemData));
    }
  };

  const handleRejectItem = () => {
    if (selectedItem && rejectionReason.trim()) {
      setIsUpdatingItemStatus(true);
      const itemData = {
        item_id: selectedItem.item_id,
        status: 'rejected',
        rejection_reason: rejectionReason.trim()
      };
      dispatch(updateOrderItemStatus(itemData));
    }
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setShowRejectionInput(false);
    setSelectedItem(null);
    setRejectionReason('');
    setIsUpdatingItemStatus(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'delivered':
        return '#28a745';
      case 'canceled':
        return '#dc3545';
      case 'in_transit':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'paid':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const renderOrderHeader = () => (
    <View style={styles.orderHeader}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Order #{selectedOrder.id}</Text>
        <Text style={styles.orderDate}>{formatDate(selectedOrder.created_at)}</Text>
      </View>
      <View style={styles.orderAmount}>
        <Text style={styles.amountText}>₹{selectedOrder.total_earn}</Text>
        <Text style={styles.amountLabel}>Total Earn</Text>
      </View>
    </View>
  );

  const renderCustomerInfo = () => (
    <View style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Customer Information</Text>
      <View style={styles.infoRow}>
        <Icon name="user" size={20} color="#019a34" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Customer Name</Text>
          <Text style={styles.infoValue}>{selectedOrder.customer.name}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Icon name="envelope" size={20} color="#019a34" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{selectedOrder.customer.email}</Text>
        </View>
      </View>
    </View>
  );

  const renderDeliveryAddress = () => (
    <View style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>
      <View style={styles.infoRow}>
        <Icon name="map-marker" size={20} color="#019a34" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{selectedOrder.delivery_address.address_line}</Text>
          <Text style={styles.infoValue}>{selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.taluka}</Text>
          <Text style={styles.infoValue}>{selectedOrder.delivery_address.district}, {selectedOrder.delivery_address.state}</Text>
          <Text style={styles.infoValue}>{selectedOrder.delivery_address.country} - {selectedOrder.delivery_address.pincode}</Text>
        </View>
      </View>
    </View>
  );

  const renderOrderStatus = () => (
    <View style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Order Status</Text>
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(selectedOrder.payment_status) }]}>
            <Text style={styles.statusText}>{selectedOrder.payment_status}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Delivery Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.delivery_status) }]}>
            <Text style={styles.statusText}>{selectedOrder.delivery_status}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment Method:</Text>
          <Text style={styles.statusValue}>{selectedOrder.payment_method}</Text>
        </View>
      </View>
    </View>
  );

  const renderOrderItems = () => (
    <View style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Order Items</Text>
      {selectedOrder.items.map((item, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.vegetable_name}</Text>
            <TouchableOpacity 
              style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}
              onPress={() => handleItemStatusPress(item)}
              disabled={item.status !== 'pending'}
            >
              <Text style={styles.itemStatusText}>{item.status}</Text>
              {item.status === 'pending' && (
                <Icon name="chevron-down" size={10} color="#fff" style={styles.statusIcon} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.itemDetails}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Quantity:</Text>
              <Text style={styles.itemValue}>{item.quantity} {item.unit_type}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Price per {item.unit_type}:</Text>
              <Text style={styles.itemValue}>₹{item.price_per_kg}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Subtotal:</Text>
              <Text style={[styles.itemValue, styles.subtotalValue]}>₹{item.subtotal}</Text>
            </View>
            {item.rejection_reason && (
              <View style={styles.rejectionReason}>
                <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                <Text style={styles.rejectionText}>{item.rejection_reason}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent={true}
      animationType="fade"
      onRequestClose={closeStatusModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.statusModalContainer}>
          <View style={styles.statusModalHeader}>
            <Text style={styles.statusModalTitle}>Update Item Status</Text>
            <TouchableOpacity onPress={closeStatusModal} style={styles.closeButton}>
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusModalContent}>
            <Text style={styles.itemNameText}>{selectedItem?.vegetable_name}</Text>
            <Text style={styles.itemDetailsText}>
              Quantity: {selectedItem?.quantity} {selectedItem?.unit_type}
            </Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptItem}
                disabled={updatingItemStatus}
              >
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => {
                  // Show rejection reason input
                  setShowRejectionInput(true);
                }}
                disabled={updatingItemStatus}
              >
                <Icon name="times" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
            
            {showRejectionInput && (
              <View style={styles.rejectionInputContainer}>
                <Text style={styles.rejectionInputLabel}>Rejection Reason:</Text>
                <TextInput
                  style={styles.rejectionInput}
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline={true}
                  numberOfLines={3}
                />
                <View style={styles.rejectionButtons}>
                  <TouchableOpacity 
                    style={[styles.rejectionButton, styles.cancelRejectionButton]}
                    onPress={() => {
                      setShowRejectionInput(false);
                      setRejectionReason('');
                    }}
                  >
                    <Text style={styles.cancelRejectionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.rejectionButton, styles.submitRejectionButton]}
                    onPress={handleRejectItem}
                    disabled={updatingItemStatus || !rejectionReason.trim()}
                  >
                    <Text style={styles.submitRejectionButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <SkeletonLoader height={p(16)} width="60%" borderRadius={p(4)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(120)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="35%" borderRadius={p(4)} />
        <SkeletonLoader height={p(100)} width="100%" borderRadius={p(8)} />
      </View>
    </View>
  );

  // Show skeleton loader when loading specific order data
  if (loadingOrder || !selectedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#019a34" />
        <CommonHeader
          screenName="Order Details"
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Order Details"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderHeader()}
        {renderCustomerInfo()}
        {renderDeliveryAddress()}
        {renderOrderStatus()}
        {renderOrderItems()}
      </ScrollView>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmerOrdersError());
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmerOrdersSuccess());
        }}
      />

      {/* Status Update Modal */}
      {renderStatusModal()}
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
  orderHeader: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(4),
  },
  orderDate: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  amountLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  infoCard: {
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
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: p(16),
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
  statusContainer: {
    gap: p(12),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(12),
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  statusValue: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  itemName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
  },
  itemStatusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: p(80),
  },
  itemStatusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  statusIcon: {
    marginLeft: p(6),
  },
  itemDetails: {
    gap: p(4),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  itemValue: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  subtotalValue: {
    color: '#019a34',
  },
  rejectionReason: {
    marginTop: p(8),
    padding: p(8),
    backgroundColor: '#f8d7da',
    borderRadius: p(6),
  },
  rejectionLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#721c24',
    marginBottom: p(4),
  },
  rejectionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#721c24',
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
  // Status Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusModalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    width: '90%',
    maxWidth: p(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: p(20),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusModalTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  closeButton: {
    padding: p(4),
  },
  statusModalContent: {
    padding: p(20),
  },
  itemNameText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(8),
  },
  itemDetailsText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(20),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: p(12),
    marginBottom: p(20),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    gap: p(8),
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  rejectionInputContainer: {
    marginTop: p(16),
  },
  rejectionInputLabel: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(8),
  },
  rejectionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(12),
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    textAlignVertical: 'top',
    minHeight: p(80),
    marginBottom: p(16),
  },
  rejectionButtons: {
    flexDirection: 'row',
    gap: p(12),
  },
  rejectionButton: {
    flex: 1,
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    alignItems: 'center',
  },
  cancelRejectionButton: {
    backgroundColor: '#6c757d',
  },
  submitRejectionButton: {
    backgroundColor: '#dc3545',
  },
  cancelRejectionButtonText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  submitRejectionButtonText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});

export default OrderDetailsScreen;
