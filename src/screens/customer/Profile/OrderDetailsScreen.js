import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders, cancelOrder, clearCancelOrderError, acceptPartialOrder, clearAcceptPartialError, submitReview, clearSubmitReviewError } from '../../../redux/slices/ordersSlice';
import { ReviewModal, ConfirmationModal } from '../../../components';

const OrderDetailsScreen = ({ navigation, route }) => {
  const { order: initialOrder } = route.params;
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptPartialModal, setShowAcceptPartialModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [upiLink, setUpiLink] = useState('');
  const { cancelOrderLoading, cancelOrderError, acceptPartialLoading, acceptPartialError, submitReviewLoading, submitReviewError } = useSelector(state => state.orders);

  useEffect(() => {
    if (cancelOrderError) {
      Alert.alert('Error', cancelOrderError);
      dispatch(clearCancelOrderError());
    }
  }, [cancelOrderError, dispatch]);

  useEffect(() => {
    if (acceptPartialError) {
      Alert.alert('Error', acceptPartialError);
      dispatch(clearAcceptPartialError());
    }
  }, [acceptPartialError, dispatch]);

  useEffect(() => {
    if (submitReviewError) {
      Alert.alert('Error', submitReviewError);
      dispatch(clearSubmitReviewError());
    }
  }, [submitReviewError, dispatch]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await dispatch(fetchMyOrders()).unwrap();
      const updatedOrders = result.data || [];
      const updatedOrder = updatedOrders.find(o => o.order_id === order.order_id);
      if (updatedOrder) {
        setOrder(updatedOrder);
        // Also update the route params for consistency
        navigation.setParams({ order: updatedOrder });
        // Show success message
        Alert.alert('Success', 'Order details refreshed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh order details');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      await dispatch(cancelOrder(order.order_id)).unwrap();
      setSuccessMessage('Order cancelled successfully!');
      setShowSuccessModal(true);
      setShowCancelModal(false);
      
      // Update local order state
      setOrder(prevOrder => ({
        ...prevOrder,
        is_canceled: true,
        delivery_status: 'cancelled'
      }));
      
      // Navigate back to orders screen after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const handleAcceptPartialOrder = () => {
    setShowAcceptPartialModal(true);
  };

  const handleConfirmAcceptPartialOrder = async () => {
    try {
      const result = await dispatch(acceptPartialOrder(order.order_id)).unwrap();
      const upiLinkResult = result.data?.upi_link;
      
      if (upiLinkResult) {
        setUpiLink(upiLinkResult);
        setShowUPIModal(true);
      } else {
        setSuccessMessage('Partial order accepted successfully!');
        setShowSuccessModal(true);
      }
      
      setShowAcceptPartialModal(false);
      
      // Refresh order details
      handleRefresh();
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const handleOpenUPILink = () => {
    if (upiLink) {
      Linking.openURL(upiLink);
    }
  };

  const handleCopyUPILink = () => {
    // You can add clipboard functionality here if needed
    Alert.alert('Info', 'UPI Link copied to clipboard');
  };

  const handleReviewOrder = () => {
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await dispatch(submitReview({ orderId: order.order_id, reviewData })).unwrap();
      Alert.alert('Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      // Update local order state
      setOrder(prevOrder => ({
        ...prevOrder,
        is_reviewed: true
      }));
      // Refresh order details
      handleRefresh();
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'clock-o';
      case 'processing':
        return 'cog';
      case 'out for delivery':
        return 'truck';
      case 'delivered':
        return 'check-circle';
      case 'paid':
        return 'credit-card';
      default:
        return 'info-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'processing':
        return '#2196F3';
      case 'out for delivery':
        return '#FF9800';
      case 'delivered':
        return '#4CAF50';
      case 'paid':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  // Format delivery address from API structure
  const formatDeliveryAddress = () => {
    const addr = order.delivery_address;
    return `${addr.line}, ${addr.city}, ${addr.taluka}, ${addr.district}, ${addr.state}, ${addr.country}, ${addr.pincode}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Order Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        navigation={navigation}
      />
      
      {/* Refresh Button */}
      <View style={styles.refreshContainer}>
        <TouchableOpacity 
          style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Icon 
            name={refreshing ? 'spinner' : 'refresh'} 
            size={16} 
            color={refreshing ? '#95a5a6' : '#019a34'} 
          />
          <Text style={[styles.refreshButtonText, refreshing && styles.refreshButtonTextDisabled]}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>ORD-{order.order_id}</Text>
              <Text style={styles.orderDate}>{order.created_at}</Text>
            </View>
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          
          <View style={styles.statusTimeline}>
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Order Placed</Text>
                <Text style={styles.statusTime}>{order.created_at}</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(order.payment_status) + '20' }
              ]}>
                <Icon name="credit-card" size={20} color={getStatusColor(order.payment_status)} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Payment {order.payment_status}</Text>
                <Text style={styles.statusTime}>{order.created_at}</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(order.delivery_status) + '20' }
              ]}>
                <Icon name={getStatusIcon(order.delivery_status)} size={20} color={getStatusColor(order.delivery_status)} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>{order.delivery_status}</Text>
                <Text style={styles.statusTime}>{order.created_at}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.deliveryInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#019a34" />
              <Text style={styles.infoLabel}>Delivery Address:</Text>
            </View>
            <Text style={styles.addressText}>{formatDeliveryAddress()}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={[
              styles.itemCard,
              index === order.items.length - 1 && styles.lastItem
            ]}>
              <View style={styles.itemLeft}>
                <View style={styles.itemImageContainer}>
                  {item.images && item.images.length > 0 ? (
                    <Image 
                      source={{ uri: item.images[0] }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Icon name="image" size={24} color="#ccc" />
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.vegetable_name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity} {item.unit_type}</Text>
                  <Text style={styles.itemFarmer}>Farmer: {item.farmer.name}</Text>
                  <Text style={styles.itemUnitPrice}>Unit Price: ₹{item.price_per_kg}</Text>
                </View>
              </View>
              
              <View style={styles.itemRight}>
                <Text style={styles.itemTotalPrice}>₹{item.subtotal}</Text>
                <View style={[
                  styles.itemStatusBadge,
                  { backgroundColor: getStatusColor(item.delivery_item_status) + '20' }
                ]}>
                  <Text style={[
                    styles.itemStatusText,
                    { color: getStatusColor(item.delivery_item_status) }
                  ]}>
                    {item.delivery_item_status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>₹{order.total_amount}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee:</Text>
            <Text style={styles.priceValue}>₹0.00</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax:</Text>
            <Text style={styles.priceValue}>₹0.00</Text>
          </View>
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalPriceLabel}>Total:</Text>
            <Text style={styles.totalPriceValue}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="phone" size={14} color="#fff" />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Icon name="download" size={14} color="#019a34" />
            <Text style={styles.secondaryButtonText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Review Order Button - Only show for delivered orders that are not reviewed */}
        {order.delivery_status === 'delivered' && !order.is_reviewed && (
          <TouchableOpacity 
            style={[styles.reviewOrderButton, submitReviewLoading && styles.buttonDisabled]}
            onPress={handleReviewOrder}
            disabled={submitReviewLoading}
          >
            <Icon name="star" size={16} color="#fff" />
            <Text style={styles.reviewOrderButtonText}>
              {submitReviewLoading ? 'Submitting Review...' : 'Review Order'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Cancel Order Button - Only show for cancellable orders */}
        {order.delivery_status !== 'delivered' && !order.is_canceled && (
          <TouchableOpacity 
            style={[styles.cancelOrderButton, cancelOrderLoading && styles.buttonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancelOrderLoading}
          >
            <Icon name="times-circle" size={16} color="#fff" />
            <Text style={styles.cancelOrderButtonText}>
              {cancelOrderLoading ? 'Cancelling...' : 'Cancel Order'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Accept Partial Order Button - Only show for partial orders */}
        {order.delivery_status === 'out for delivery' && 
         order.items.some(item => item.delivery_item_status === 'partial' || item.delivery_item_status === 'pending') && 
         !order.is_canceled && (
          <TouchableOpacity 
            style={[styles.acceptPartialButton, acceptPartialLoading && styles.buttonDisabled]}
            onPress={handleAcceptPartialOrder}
            disabled={acceptPartialLoading}
          >
            <Icon name="hand-paper-o" size={16} color="#fff" />
            <Text style={styles.acceptPartialButtonText}>
              {acceptPartialLoading ? 'Accepting...' : 'Accept Partial Order'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Review Status Indicator */}
        {order.delivery_status === 'delivered' && (
          <View style={styles.reviewStatusContainer}>
            {order.is_reviewed ? (
              <View style={styles.reviewedStatus}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.reviewedStatusText}>Review Submitted ✓</Text>
              </View>
            ) : (
              <View style={styles.pendingReviewStatus}>
                <Icon name="star-o" size={20} color="#FF9800" />
                <Text style={styles.pendingReviewStatusText}>Review Pending</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        order={order}
        loading={submitReviewLoading}
      />

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
        type="warning"
        loading={cancelOrderLoading}
      />

      {/* Accept Partial Order Confirmation Modal */}
      <ConfirmationModal
        visible={showAcceptPartialModal}
        onClose={() => setShowAcceptPartialModal(false)}
        onConfirm={handleConfirmAcceptPartialOrder}
        title="Accept Partial Order"
        message="Are you sure you want to accept this partial order? You will receive a UPI payment link."
        confirmText="Yes, Accept"
        cancelText="No, Cancel"
        type="info"
        loading={acceptPartialLoading}
      />

      {/* UPI Link Modal */}
      <ConfirmationModal
        visible={showUPIModal}
        onClose={() => setShowUPIModal(false)}
        onConfirm={handleOpenUPILink}
        title="Partial Order Accepted! 🎉"
        message="Your partial order has been accepted successfully! You can now proceed with payment using the UPI link."
        confirmText="Open UPI Link"
        cancelText="Copy Link"
        type="success"
        showCancel={true}
        onCancel={handleCopyUPILink}
      />

      {/* Success Modal */}
      <ConfirmationModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
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
    paddingHorizontal: p(20),
  },
  scrollContent: {
    paddingBottom: p(20),
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginTop: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(5),
  },
  orderDate: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(5),
  },
  totalAmount: {
    fontSize: fontSizes.xl,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },

  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(15),
  },
  statusTimeline: {
    gap: p(20),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(3),
  },
  statusTime: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Delivery Card
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryInfo: {
    gap: p(10),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(10),
  },
  infoLabel: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  addressText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(22),
    marginLeft: p(26),
  },

  // Items Card
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImageContainer: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: p(30),
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(5),
  },
  itemQuantity: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  itemFarmer: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  itemUnitPrice: {
    fontSize: fontSizes.sm,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
    marginBottom: p(8),
  },
  itemStatusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(15),
    minWidth: p(80),
    alignItems: 'center',
  },
  itemStatusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },

  // Price Card
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(8),
  },
  priceLabel: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  priceValue: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: p(10),
    paddingTop: p(15),
  },
  totalPriceLabel: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  totalPriceValue: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: p(15),
    marginBottom: p(20),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(10),
    borderRadius: p(25),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#019a34',
  },
  secondaryButtonText: {
    color: '#019a34',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Cancel Order Button
  cancelOrderButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(15),
    borderRadius: p(25),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelOrderButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // Accept Partial Order Button
  acceptPartialButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(15),
    borderRadius: p(25),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptPartialButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Review Order Button
  reviewOrderButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(15),
    borderRadius: p(25),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewOrderButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Review Status Indicator
  reviewStatusContainer: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginTop: p(15),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(10),
  },
  reviewedStatusText: {
    fontSize: fontSizes.base,
    color: '#4CAF50',
    fontFamily: 'Poppins-Bold',
  },
  pendingReviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(10),
  },
  pendingReviewStatusText: {
    fontSize: fontSizes.base,
    color: '#FF9800',
    fontFamily: 'Poppins-Bold',
  },

  // Refresh Button
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: p(10),
    marginBottom: p(15),
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingVertical: p(10),
    paddingHorizontal: p(20),
    borderRadius: p(25),
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#019a34',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshButtonTextDisabled: {
    color: '#95a5a6',
  },
});

export default OrderDetailsScreen;
