import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchDeliveryDetails,
  clearDeliveryError
} from '../../../redux/slices/deliverySlice';
import { updateOrderStatus, updateAssignmentStatus, updatePaymentStatus } from '../../../redux/slices/todaysTaskSlice';
import ErrorModal from '../../../components/ErrorModal';
import SuccessModal from '../../../components/SuccessModal';

const DeliveryDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { deliveryDetails, loadingDetails, error } = useSelector(state => state.delivery);
  const { 
    loading: updateOrderStatusLoading, 
    error: updateOrderStatusError, 
    success: updateOrderStatusSuccess, 
    message: updateOrderStatusMessage,
    loading: updatePaymentStatusLoading,
    error: updatePaymentStatusError,
    success: updatePaymentStatusSuccess,
    message: updatePaymentStatusMessage
  } = useSelector(state => state.todaysTask);
  const { orderId } = route.params;
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        dispatch(fetchDeliveryDetails(orderId));
      }
    }, [orderId])
  );

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearDeliveryError());
    }
  }, [error]);

  useEffect(() => {
    if (updateOrderStatusSuccess && updateOrderStatusMessage) {
      setShowSuccessModal(true);
    }
  }, [updateOrderStatusSuccess, updateOrderStatusMessage]);

  useEffect(() => {
    if (updateOrderStatusError || updatePaymentStatusError) {
      setShowErrorModal(true);
    }
  }, [updateOrderStatusError, updatePaymentStatusError]);

  useEffect(() => {
    if (updatePaymentStatusSuccess && updatePaymentStatusMessage) {
      setShowSuccessModal(true);
    }
  }, [updatePaymentStatusSuccess, updatePaymentStatusMessage]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallCustomer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCallFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleStartDelivery = () => {
    if (deliveryDetails?.order?.id) {
      dispatch(updateOrderStatus({ orderId: deliveryDetails.order.id, status: 'out_for_delivery' }));
    }
  };

  const handleMarkComplete = () => {
    if (deliveryDetails?.order?.id) {
      dispatch(updateOrderStatus({ orderId: deliveryDetails.order.id, status: 'delivered' }));
    }
  };

  const handleUpdateAssignmentStatus = (assignmentId, status) => {
    dispatch(updateAssignmentStatus({ assignmentId, status }));
  };

  const handleUpdatePaymentStatus = (orderId, paymentStatus) => {
    dispatch(updatePaymentStatus({ orderId, paymentStatus }));
  };

  const handleMarkPaymentPaid = () => {
    if (deliveryDetails?.order?.id) {
      dispatch(updatePaymentStatus({ orderId: deliveryDetails.order.id, paymentStatus: 'paid' }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_delivery':
        return '#ffc107';
      case 'in_progress':
        return '#019a34';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready_for_delivery':
        return 'Ready for Delivery';
      case 'in_progress':
        return 'In Progress';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderCustomerInfo = () => {
    if (!deliveryDetails?.order?.customer) return null;
    
    const { customer } = deliveryDetails.order;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="user" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{customer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Phone:</Text>
            <TouchableOpacity onPress={() => handleCallCustomer(customer.phone)}>
              <Text style={[styles.infoValue, styles.phoneNumber]}>{customer.phone}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Icon name="envelope" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{customer.email}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDeliveryAddress = () => {
    if (!deliveryDetails?.customerAddress) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={p(16)} color="#019a34" />
            <Text style={styles.infoValue}>{deliveryDetails.customerAddress}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderInfo = () => {
    if (!deliveryDetails?.order) return null;
    
    const { order } = deliveryDetails;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="hashtag" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Order Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="credit-card" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Payment:</Text>
            <Text style={styles.infoValue}>
              {order.payment_method} ({order.payment_status})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="truck" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.delivery_status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.delivery_status)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="rupee" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={[styles.infoValue, styles.totalAmount]}>₹{deliveryDetails.final_total}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderItems = () => {
    if (!deliveryDetails?.order?.order_items) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.infoCard}>
          {deliveryDetails.order.order_items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.vegetable.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity_kg}kg × ₹{item.price_per_kg} = ₹{item.subtotal}
                </Text>
                <Text style={styles.farmerName}>Farmer: {item.farmer.name}</Text>
              </View>
              <View style={[styles.itemStatus, { backgroundColor: item.delivery_item_status === 'accepted' ? '#d4edda' : '#f8d7da' }]}>
                <Text style={[styles.itemStatusText, { color: item.delivery_item_status === 'accepted' ? '#155724' : '#721c24' }]}>
                  {item.delivery_item_status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFarmerAddresses = () => {
    if (!deliveryDetails?.farmerAddresses) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farmer Addresses</Text>
        {deliveryDetails.farmerAddresses.map((farmer, index) => (
          <View key={index} style={styles.farmerCard}>
            <View style={styles.farmerHeader}>
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{farmer.name}</Text>
                <TouchableOpacity onPress={() => handleCallFarmer(farmer.phone)}>
                  <Text style={[styles.farmerPhone, styles.phoneNumber]}>{farmer.phone}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.itemCount}>
                <Text style={styles.itemCountText}>{farmer.itemCount} item(s)</Text>
              </View>
            </View>
            <View style={styles.farmerAddress}>
              <Icon name="map-marker" size={p(14)} color="#666" />
              <Text style={styles.addressText}>{farmer.address}</Text>
            </View>
            <View style={styles.farmerItems}>
              {farmer.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.farmerItem}>
                  <Text style={styles.farmerItemName}>{item.name}</Text>
                  <Text style={styles.farmerItemQty}>{item.quantity} {item.unit}</Text>
                  <View style={[styles.farmerItemStatus, { backgroundColor: item.status === 'accepted' ? '#d4edda' : '#f8d7da' }]}>
                    <Text style={[styles.farmerItemStatusText, { color: item.status === 'accepted' ? '#155724' : '#721c24' }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!deliveryDetails?.order) return null;
    
    const { order } = deliveryDetails;
    
    return (
      <View style={styles.section}>
        <View style={styles.actionButtonsContainer}>
          {order.delivery_status === 'out_for_delivery' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton, updateOrderStatusLoading && styles.disabledButton]}
              onPress={handleMarkComplete}
              disabled={updateOrderStatusLoading}
            >
              {updateOrderStatusLoading ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="check" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {updateOrderStatusLoading ? 'Completing...' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.skeletonCard}>
          <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="90%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="70%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Delivery Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        {loadingDetails ? (
          renderSkeletonLoader()
        ) : deliveryDetails ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {renderOrderInfo()}
            {renderCustomerInfo()}
            {renderDeliveryAddress()}
            {renderOrderItems()}
            {renderFarmerAddresses()}
            {renderActionButtons()}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="exclamation-triangle" size={p(60)} color="#ccc" />
            <Text style={styles.emptyText}>No delivery details found</Text>
            <Text style={styles.emptySubtext}>Unable to load delivery information</Text>
          </View>
        )}
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={updateOrderStatusMessage || "Order status updated successfully!"}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || updateOrderStatusError || updatePaymentStatusError || "Failed to load delivery details. Please try again."}
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: p(12),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(8),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  infoLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginLeft: p(6),
    minWidth: p(70),
  },
  infoValue: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  phoneNumber: {
    color: '#019a34',
    textDecorationLine: 'underline',
  },
  totalAmount: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  statusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(6),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  itemDetails: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(1),
  },
  farmerName: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#019a34',
  },
  itemStatus: {
    paddingHorizontal: p(6),
    paddingVertical: p(2),
    borderRadius: p(8),
  },
  itemStatusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  farmerCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  farmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  farmerInfo: {
    flex: 1,
  },
  farmerPhone: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#019a34',
    textDecorationLine: 'underline',
    marginTop: p(2),
  },
  itemCount: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  itemCountText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  farmerAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  addressText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: p(6),
    flex: 1,
  },
  farmerItems: {
    gap: p(6),
  },
  farmerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(4),
  },
  farmerItemName: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  farmerItemQty: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginRight: p(6),
  },
  farmerItemStatus: {
    paddingHorizontal: p(6),
    paddingVertical: p(2),
    borderRadius: p(8),
  },
  farmerItemStatusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(40),
  },
  emptyText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: p(12),
    marginBottom: p(6),
  },
  emptySubtext: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(8),
    gap: p(6),
  },
  actionButtonsContainer: {
    gap: p(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  paymentButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});

export default DeliveryDetailsScreen;
