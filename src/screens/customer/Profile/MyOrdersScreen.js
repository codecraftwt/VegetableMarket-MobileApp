import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders, clearOrdersError, cancelOrder, clearCancelOrderError, submitReview, clearSubmitReviewError } from '../../../redux/slices/ordersSlice';
import { ReviewModal, ConfirmationModal } from '../../../components';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { createBackPressHandler } from '../../../utils/navigationUtils';

const MyOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orders);
  const { cancelOrderLoading, cancelOrderError, submitReviewLoading, submitReviewError } = useSelector(state => state.orders);
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearOrdersError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (cancelOrderError) {
      Alert.alert('Error', cancelOrderError);
      dispatch(clearCancelOrderError());
    }
  }, [cancelOrderError, dispatch]);

  useEffect(() => {
    if (submitReviewError) {
      Alert.alert('Error', submitReviewError);
      dispatch(clearSubmitReviewError());
    }
  }, [submitReviewError, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyOrders()).unwrap();
    } catch (error) {
      // Error is already handled by the slice
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackPress = createBackPressHandler(navigation, 'MyOrders');

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      await dispatch(cancelOrder(selectedOrder.order_id)).unwrap();
      setSuccessMessage('Order cancelled successfully!');
      setShowSuccessModal(true);
      setShowCancelModal(false);
      setSelectedOrder(null);
      // Refresh orders to get updated status
      dispatch(fetchMyOrders());
    } catch (error) {
      // Error is already handled by the slice
    }
  };

  const handleReviewOrder = (order) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await dispatch(submitReview({ orderId: selectedOrder.order_id, reviewData })).unwrap();
      Alert.alert('Success', 'Review submitted successfully!');
      setShowReviewModal(false);
      setSelectedOrder(null);
      // Refresh orders to get updated review status
      dispatch(fetchMyOrders());
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

  const OrderCard = ({ order }) => {
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { order })}
        activeOpacity={0.8}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>ORD-{order.order_id}</Text>
            <Text style={styles.orderDate}>{order.created_at}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusItem}>
            <Icon name="credit-card" size={14} color={order.is_paid ? '#4CAF50' : '#FF9800'} />
            <Text style={styles.statusText}>{order.payment_status}</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon name={getStatusIcon(order.delivery_status)} size={14} color={getStatusColor(order.delivery_status)} />
            <Text style={styles.statusText}>{order.delivery_status}</Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          <Icon name="shopping-bag" size={14} color="#019a34" />
          <Text style={styles.itemsPreviewText}>
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Tap to view details
          </Text>
        </View>

        {/* Cancel Order Button - Only show for cancellable orders */}
        {order.delivery_status !== 'delivered' && !order.is_canceled && (
          <View style={styles.cancelSection}>
            <TouchableOpacity 
              style={[styles.cancelButton, cancelOrderLoading && styles.buttonDisabled]}
              onPress={() => handleCancelOrder(order)}
              activeOpacity={0.8}
              disabled={cancelOrderLoading}
            >
              <Icon name="times-circle" size={14} color="#dc3545" />
              <Text style={styles.cancelButtonText}>
                {cancelOrderLoading ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review Order Button - Only show for delivered orders that haven't been reviewed */}
        {order.delivery_status === 'delivered' && !order.is_reviewed && (
          <View style={styles.reviewSection}>
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => handleReviewOrder(order)}
              activeOpacity={0.8}
            >
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.reviewButtonText}>Review Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Already Reviewed Indicator */}
        {order.is_reviewed && (
          <View style={styles.reviewedSection}>
            <Icon name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.reviewedText}>Review Submitted</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader 
          screenName="My Orders"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Skeleton Header Section */}
            <View style={styles.headerSection}>
              <SkeletonLoader type="text" width="60%" height={p(28)} style={styles.skeletonTitle} />
              <SkeletonLoader type="text" width="85%" height={p(16)} />
            </View>
            
            {/* Skeleton Order Cards */}
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonOrderCard}>
                {/* Order Header Skeleton */}
                <View style={styles.skeletonOrderHeader}>
                  <View style={styles.skeletonOrderInfo}>
                    <SkeletonLoader type="text" width="75%" height={p(22)} style={styles.skeletonLine} />
                    <SkeletonLoader type="text" width="55%" height={p(16)} />
                  </View>
                  <View style={styles.skeletonOrderTotal}>
                    <SkeletonLoader type="text" width="65%" height={p(22)} />
                  </View>
                </View>

                {/* Status Section Skeleton */}
                <View style={styles.skeletonStatusSection}>
                  <View style={styles.skeletonStatusItem}>
                    <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                    <SkeletonLoader type="text" width="60%" height={p(16)} style={styles.skeletonStatusText} />
                  </View>
                  <View style={styles.skeletonStatusItem}>
                    <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                    <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonStatusText} />
                  </View>
                </View>

                {/* Items Preview Skeleton */}
                <View style={styles.skeletonItemsPreview}>
                  <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                  <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonItemsText} />
                </View>

                {/* Action Button Skeleton */}
                <View style={styles.skeletonActionSection}>
                  <SkeletonLoader type="category" width="60%" height={p(40)} borderRadius={p(20)} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="My Orders"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        navigation={navigation}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#019a34']} />
        }
      >
        {orders.length > 0 ? (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Order History</Text>
              <Text style={styles.sectionSubtitle}>
                Track your orders and delivery status
              </Text>
            </View>
            
            {orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="shopping-bag" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start shopping to see your order history here
            </Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('Bucket')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleSubmitReview}
        order={selectedOrder}
        loading={submitReviewLoading}
      />

      {/* Cancel Order Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${selectedOrder?.order_id}? This action cannot be undone.`}
        confirmText="Yes"
        cancelText="No"
        type="warning"
        loading={cancelOrderLoading}
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

  // Header Section
  headerSection: {
    marginTop: p(20),
    marginBottom: p(15),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(5),
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  
  // Order Card
  orderCard: {
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
  
  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(15),
    paddingBottom: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(5),
  },
  orderDate: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },

  // Status Section
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(15),
    paddingBottom: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(8),
  },

  // Items Preview
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsPreviewText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(8),
  },

  // Cancel Section
  cancelSection: {
    marginTop: p(15),
    paddingTop: p(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(8),
    paddingHorizontal: p(15),
    borderRadius: p(20),
    borderWidth: 1,
    borderColor: '#dc3545',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: fontSizes.sm,
    color: '#dc3545',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // Review Section
  reviewSection: {
    marginTop: p(15),
    paddingTop: p(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(8),
    paddingHorizontal: p(15),
    borderRadius: p(20),
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#fff',
  },
  reviewButtonText: {
    fontSize: fontSizes.sm,
    color: '#FFD700',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },

  // Reviewed Section
  reviewedSection: {
    marginTop: p(15),
    paddingTop: p(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  reviewedText: {
    fontSize: fontSizes.sm,
    color: '#4CAF50',
    fontFamily: 'Poppins-Regular',
    marginTop: p(8),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(80),
  },
  emptyStateTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginTop: p(20),
    marginBottom: p(10),
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(30),
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(30),
    paddingVertical: p(15),
    borderRadius: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shopNowText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(50),
  },
  loadingText: {
    marginTop: p(20),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  // Skeleton styles
  skeletonTitle: {
    marginBottom: p(5),
  },
  skeletonLine: {
    marginBottom: p(5),
  },
  skeletonOrderCard: {
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
  skeletonOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(15),
    paddingBottom: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonOrderInfo: {
    flex: 1,
  },
  skeletonOrderTotal: {
    alignItems: 'flex-end',
  },
  skeletonStatusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(15),
    paddingBottom: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonStatusText: {
    marginLeft: p(8),
  },
  skeletonItemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(15),
  },
  skeletonItemsText: {
    marginLeft: p(8),
  },
  skeletonActionSection: {
    marginTop: p(15),
    paddingTop: p(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
});

export default MyOrdersScreen;
