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
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMyOrders, 
  cancelOrder, 
  clearCancelOrderError, 
  acceptPartialOrder, 
  clearAcceptPartialError, 
  submitReview, 
  clearSubmitReviewError,
  downloadOrderInvoice,
  clearDownloadInvoiceError
} from '../../../redux/slices/ordersSlice';
import { ReviewModal, ConfirmationModal, SuccessModal, ErrorModal } from '../../../components';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

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
  const [showInvoiceSuccessModal, setShowInvoiceSuccessModal] = useState(false);
  const [showInvoiceErrorModal, setShowInvoiceErrorModal] = useState(false);
  const [invoiceSuccessMessage, setInvoiceSuccessMessage] = useState('');
  const [invoiceErrorMessage, setInvoiceErrorMessage] = useState('');
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState(null);
  const { 
    cancelOrderLoading, 
    cancelOrderError, 
    acceptPartialLoading, 
    acceptPartialError, 
    submitReviewLoading, 
    submitReviewError,
    downloadInvoiceLoading,
    downloadInvoiceError
  } = useSelector(state => state.orders);

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

  useEffect(() => {
    if (downloadInvoiceError) {
      setInvoiceErrorMessage(downloadInvoiceError);
      setShowInvoiceErrorModal(true);
      dispatch(clearDownloadInvoiceError());
    }
  }, [downloadInvoiceError, dispatch]);

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
      }
    } catch (error) {
      console.log('Failed to refresh order details:', error);
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

  // Check if order is eligible for invoice download
  const isEligibleForInvoice = () => {
    return order.delivery_status === 'delivered' || order.delivery_status === 'cancelled' || order.is_canceled;
  };

  // Request storage permissions for file operations
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        console.log('Android version:', androidVersion);
        
        // For Android 13+ (API 33+)
        if (androidVersion >= 33) {
          // Try MANAGE_EXTERNAL_STORAGE first
          try {
            const manageStorageGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'This app needs access to storage to save invoice PDF files to your Downloads folder.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            console.log('MANAGE_EXTERNAL_STORAGE permission result:', manageStorageGranted);
            if (manageStorageGranted === PermissionsAndroid.RESULTS.GRANTED) {
              return true;
            }
          } catch (error) {
            console.log('MANAGE_EXTERNAL_STORAGE not available, trying other permissions');
          }
          
          // Request media permissions for Android 13+
          const mediaPermissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ];
          
          const mediaResults = await PermissionsAndroid.requestMultiple(mediaPermissions);
          console.log('Media permission results:', mediaResults);
          
          // Check if at least one media permission is granted
          const hasMediaPermission = Object.values(mediaResults).some(
            result => result === PermissionsAndroid.RESULTS.GRANTED
          );
          
          return hasMediaPermission;
        } else {
          // For Android 12 and below, request WRITE_EXTERNAL_STORAGE
          const writeStorageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to storage to save invoice PDF files to your Downloads folder.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          console.log('WRITE_EXTERNAL_STORAGE permission result:', writeStorageGranted);
          return writeStorageGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.error('Storage permission error:', err);
        return false;
      }
    }
    return true; // iOS doesn't need this permission
  };

  // Get the best available file path for saving files
  const getFileSavePath = async (fileName) => {
    if (Platform.OS === 'android') {
      // Always try Downloads first for better user experience
      try {
        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        console.log('Trying Downloads path:', downloadPath);
        return downloadPath;
      } catch (error) {
        console.log('Downloads path failed, using Documents:', error);
        return `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }
    } else {
      // iOS - use Documents directory
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
  };

  // Ensure directory exists before saving file
  const ensureDirectoryExists = async (filePath) => {
    try {
      const directory = filePath.substring(0, filePath.lastIndexOf('/'));
      const exists = await RNFS.exists(directory);
      if (!exists) {
        await RNFS.mkdir(directory);
        console.log('Created directory:', directory);
      }
    } catch (error) {
      console.log('Directory creation error:', error);
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  };

  // Share generated file
  const shareFile = async (filePath, fileName) => {
    try {
      console.log('Sharing file:', filePath);
      
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      console.log('File exists:', fileExists);
      
      if (!fileExists) {
        Alert.alert('Error', 'File not found. Please try generating the invoice again.');
        return;
      }
      
      const shareOptions = {
        title: 'Order Invoice',
        message: `Here's the invoice for order ORD-${order.order_id}: ${fileName}`,
        url: `file://${filePath}`,
        type: 'application/pdf',
      };
      
      console.log('Share options:', shareOptions);
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Share cancelled or failed:', error);
      Alert.alert('Share Error', 'Failed to share the file. Please try again.');
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    if (!isEligibleForInvoice()) {
      Alert.alert('Invoice Not Available', 'Invoice can only be downloaded for delivered or cancelled orders.');
      return;
    }

    try {
      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        setInvoiceErrorMessage('Storage permission is required to save invoice files. Please grant permission in your device settings.\n\nGo to: Settings > Apps > VegetableMarket > Permissions > Storage');
        setShowInvoiceErrorModal(true);
        return;
      }

      // Download invoice from API
      const result = await dispatch(downloadOrderInvoice(order.order_id)).unwrap();
      console.log('Invoice download result:', result);

      if (result.success && result.pdf_base64) {
        // Save PDF file
        const fileName = result.file_name || `invoice_order_${order.order_id}.pdf`;
        const filePath = await getFileSavePath(fileName);
        
        console.log('Saving invoice to:', filePath);
        
        // Ensure directory exists
        await ensureDirectoryExists(filePath);
        
        // Write the base64 PDF data to file
        await RNFS.writeFile(filePath, result.pdf_base64, 'base64');
        console.log('Invoice saved successfully to:', filePath);
        
        setLastGeneratedInvoice({ path: filePath, name: fileName });
        
        const saveLocation = filePath.includes('DownloadDirectoryPath') 
          ? 'Downloads folder' 
          : 'Documents folder';
        setInvoiceSuccessMessage(`Invoice saved to ${saveLocation}: ${fileName}\n\nYou can find it in your ${saveLocation} or use the Share button to send it.`);
        setShowInvoiceSuccessModal(true);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      
      let errorMessage = 'Failed to download invoice. ';
      if (error.message?.includes('permission')) {
        errorMessage += 'Please grant storage permission in your device settings and try again.';
      } else if (error.message?.includes('ENOENT')) {
        errorMessage += 'Unable to access storage. Please check your device storage and try again.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      setInvoiceErrorMessage(errorMessage);
      setShowInvoiceErrorModal(true);
    }
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
      
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#019a34']}
            tintColor="#019a34"
            title="Pull to refresh"
            titleColor="#019a34"
          />
        }
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

        {/* Delivery Boy Information */}
        {order.delivery_boy && (
          <View style={styles.deliveryBoyCard}>
            <Text style={styles.sectionTitle}>Delivery Agent</Text>
            
            <View style={styles.deliveryBoyInfo}>
              <View style={styles.deliveryBoyHeader}>
                <View style={styles.deliveryBoyAvatar}>
                  <Icon name="user" size={24} color="#019a34" />
                </View>
                <View style={styles.deliveryBoyDetails}>
                  <Text style={styles.deliveryBoyName}>{order.delivery_boy.name}</Text>
                  <Text style={styles.deliveryBoyId}>ID: {order.delivery_boy.id}</Text>
                </View>
              </View>
              
              <View style={styles.deliveryBoyContact}>
                <View style={styles.contactRow}>
                  <Icon name="envelope" size={14} color="#666" />
                  <Text style={styles.contactText}>{order.delivery_boy.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Icon name="phone" size={14} color="#666" />
                  <Text style={styles.contactText}>{order.delivery_boy.phone}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
          
          {/* Download Invoice Button - Only show for delivered and cancelled orders */}
          {isEligibleForInvoice() && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton, downloadInvoiceLoading && styles.buttonDisabled]}
              onPress={handleDownloadInvoice}
              disabled={downloadInvoiceLoading}
            >
              {downloadInvoiceLoading ? (
                <Icon name="spinner" size={14} color="#019a34" />
              ) : (
                <Icon name="download" size={14} color="#019a34" />
              )}
              <Text style={styles.secondaryButtonText}>
                {downloadInvoiceLoading ? 'Downloading...' : 'Download Invoice'}
              </Text>
            </TouchableOpacity>
          )}
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

      {/* Invoice Success Modal */}
      <SuccessModal
        visible={showInvoiceSuccessModal}
        onClose={() => setShowInvoiceSuccessModal(false)}
        title="Invoice Downloaded!"
        message={invoiceSuccessMessage}
        buttonText="OK"
        onButtonPress={() => setShowInvoiceSuccessModal(false)}
        showSecondaryButton={!!lastGeneratedInvoice}
        secondaryButtonText="Share"
        onSecondaryButtonPress={lastGeneratedInvoice ? () => {
          shareFile(lastGeneratedInvoice.path, lastGeneratedInvoice.name);
          setShowInvoiceSuccessModal(false);
        } : undefined}
      />

      {/* Invoice Error Modal */}
      <ErrorModal
        visible={showInvoiceErrorModal}
        onClose={() => setShowInvoiceErrorModal(false)}
        title="Download Failed"
        message={invoiceErrorMessage}
        buttonText="OK"
        onButtonPress={() => setShowInvoiceErrorModal(false)}
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
    paddingHorizontal: p(16),
  },
  scrollContent: {
    paddingBottom: p(16),
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginTop: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  orderDate: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(4),
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },

  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(12),
  },
  statusTimeline: {
    gap: p(16),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(2),
  },
  statusTime: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Delivery Card
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deliveryInfo: {
    gap: p(8),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(18),
    marginLeft: p(20),
  },

  // Delivery Boy Card
  deliveryBoyCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deliveryBoyInfo: {
    gap: p(12),
  },
  deliveryBoyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(12),
  },
  deliveryBoyAvatar: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryBoyDetails: {
    flex: 1,
  },
  deliveryBoyName: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(2),
  },
  deliveryBoyId: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  deliveryBoyContact: {
    gap: p(6),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  contactText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Items Card
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(12),
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
    width: p(48),
    height: p(48),
    borderRadius: p(24),
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: p(24),
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  itemQuantity: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(2),
  },
  itemFarmer: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(2),
  },
  itemUnitPrice: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(6),
  },
  itemStatusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(8),
    minWidth: p(64),
    alignItems: 'center',
  },
  itemStatusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },

  // Price Card
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(6),
  },
  priceLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  priceValue: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: p(8),
    paddingTop: p(12),
  },
  totalPriceLabel: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  totalPriceValue: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: p(12),
    marginBottom: p(16),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    borderRadius: p(8),
    gap: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#019a34',
  },
  secondaryButtonText: {
    color: '#019a34',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },

  // Cancel Order Button
  cancelOrderButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelOrderButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
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
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  acceptPartialButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Review Order Button
  reviewOrderButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewOrderButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Review Status Indicator
  reviewStatusContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginTop: p(12),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reviewedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  reviewedStatusText: {
    fontSize: fontSizes.sm,
    color: '#4CAF50',
    fontFamily: 'Poppins-Bold',
  },
  pendingReviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  pendingReviewStatusText: {
    fontSize: fontSizes.sm,
    color: '#FF9800',
    fontFamily: 'Poppins-Bold',
  },

});

export default OrderDetailsScreen;
