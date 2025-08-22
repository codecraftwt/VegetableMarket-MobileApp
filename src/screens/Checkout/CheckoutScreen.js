import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../redux/slices/cartSlice';
import { fetchProfile, setPrimaryAddress } from '../../redux/slices/profileSlice';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../components';

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { totalAmount, loading, cartItems, addresses: cartAddresses, paymentSettings } = useSelector(state => state.cart);
  const { user, profile, loading: profileLoading } = useSelector(state => state.profile);
  
  // Local state
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSetPrimaryModal, setShowSetPrimaryModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [addressToSetPrimary, setAddressToSetPrimary] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Use addresses from cart instead of profile
  const addresses = cartAddresses || [];

  // Fetch cart when component mounts (cart already includes addresses and payment settings)
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Set default selections when data loads
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddress(addresses[0]); // Select first address by default
    }
    // Set default payment method from cart data - only if it's active
    if (paymentSettings.length > 0) {
      const activePaymentMethod = paymentSettings.find(payment => payment.status === 'active');
      if (activePaymentMethod) {
        setSelectedPaymentMethod(activePaymentMethod);
      }
    }
  }, [addresses, paymentSettings]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePayment = () => {
    if (!selectedAddress) {
      setErrorMessage('Please select a delivery address');
      setShowErrorModal(true);
      return;
    }
    if (!selectedPaymentMethod) {
      setErrorMessage('Please select a payment method');
      setShowErrorModal(true);
      return;
    }
    
    // Additional safety check
    if (!selectedPaymentMethod.payment_method) {
      setErrorMessage('Invalid payment method selected');
      setShowErrorModal(true);
      return;
    }
    
    // Show confirmation modal before processing payment
    setShowConfirmPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmPaymentModal(false);
    
    // Process payment logic here
    const paymentMethodName = selectedPaymentMethod?.payment_method 
      ? formatPaymentMethod(selectedPaymentMethod.payment_method)
      : 'selected payment method';
    setSuccessMessage(`Payment processed successfully using ${paymentMethodName}!`);
    setShowSuccessModal(true);
  };

  const handleAddNewAddress = () => {
    navigation.navigate('ProfileEdit', { activeTab: 'address' });
  };

  const handleEditAddress = (address) => {
    navigation.navigate('ProfileEdit', { activeTab: 'address', editAddress: address });
  };

  const handleLongPressAddress = (address) => {
    setAddressToSetPrimary(address);
    setShowSetPrimaryModal(true);
  };

  const handleSetPrimaryAddress = () => {
    if (addressToSetPrimary) {
      dispatch(setPrimaryAddress(addressToSetPrimary));
      setSelectedAddress(addressToSetPrimary);
      setShowSetPrimaryModal(false);
      setAddressToSetPrimary(null);
      setSuccessMessage('Primary address updated successfully!');
      setShowSuccessModal(true);
    }
  };

  const handleAddNewPayment = () => {
    setShowAddPaymentModal(true);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentSelect = (payment) => {
    setSelectedPaymentMethod(payment);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('Dashboard'); // Navigate to dashboard after successful payment
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  // Helper functions for payment methods
  const getPaymentIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case 'COD':
        return 'money';
      case 'UPI_AT_DOOR':
        return 'mobile';
      case 'RAZORPAY':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const getPaymentColor = (paymentMethod) => {
    switch (paymentMethod) {
      case 'COD':
        return '#28a745';
      case 'UPI_AT_DOOR':
        return '#007bff';
      case 'RAZORPAY':
        return '#ff6b35';
      default:
        return '#6c757d';
    }
  };

  const formatPaymentMethod = (paymentMethod) => {
    switch (paymentMethod) {
      case 'COD':
        return 'Cash on Delivery';
      case 'UPI_AT_DOOR':
        return 'UPI at Door';
      case 'RAZORPAY':
        return 'Razorpay';
      default:
        return paymentMethod;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#019a34" />
        <CommonHeader 
          screenName="Checkout"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#019a34" />
        <CommonHeader 
          screenName="Checkout"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          navigation={navigation}
        />
        <View style={styles.emptyCartContainer}>
          <Icon name="shopping-cart" size={80} color="#ccc" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartText}>Add some vegetables to your cart to proceed with checkout</Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Checkout"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        navigation={navigation}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Address</Text>
            <TouchableOpacity onPress={handleAddNewAddress}>
              <Text style={styles.addNewButton}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionInstruction}>
            Tap to select • Long press to set as primary
          </Text>
          
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <TouchableOpacity 
                key={addr.id}
                style={[
                  styles.addressCard, 
                  selectedAddress?.id === addr.id && styles.selectedAddressCard
                ]}
                onPress={() => handleAddressSelect(addr)}
                onLongPress={() => handleLongPressAddress(addr)}
              >
                <View style={styles.addressIconContainer}>
                  {selectedAddress?.id === addr.id ? (
                    <Icon name="check-circle" size={20} color="#019a34" />
                  ) : (
                    <View style={styles.radioButton} />
                  )}
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressLabel}>
                    {addr.address_label}
                    {addr.id === profile?.primary_address_id && (
                      <Text style={styles.primaryIndicator}> (Primary)</Text>
                    )}
                  </Text>
                  <Text style={styles.addressText}>
                    {addr.address_line}, {addr.city}, {addr.taluka}, {addr.district}, {addr.state}, {addr.country}, {addr.pincode}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditAddress(addr)}>
                  <Icon name="pencil" size={16} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noAddressCard}>
              <Icon name="map-marker" size={30} color="#ccc" />
              <Text style={styles.noAddressText}>No address found</Text>
              <TouchableOpacity style={styles.addAddressButton} onPress={handleAddNewAddress}>
                <Text style={styles.addAddressButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Selection Status */}
          {!selectedAddress && addresses.length > 0 && (
            <View style={styles.selectionWarning}>
              <Icon name="exclamation-triangle" size={16} color="#ffc107" />
              <Text style={styles.selectionWarningText}>Please select a delivery address to continue</Text>
            </View>
          )}
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <TouchableOpacity onPress={handleAddNewPayment}>
              <Text style={styles.addNewButton}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {paymentSettings.length > 0 ? (
            paymentSettings.map((payment) => (
              <TouchableOpacity 
                key={payment.id}
                style={[
                  styles.paymentCard, 
                  selectedPaymentMethod?.id === payment.id && styles.selectedPaymentCard,
                  payment.status !== 'active' && styles.disabledPaymentCard
                ]}
                onPress={() => payment.status === 'active' && handlePaymentSelect(payment)}
                disabled={payment.status !== 'active'}
              >
                <View style={styles.paymentInfo}>
                  <View style={[styles.paymentLogo, { backgroundColor: getPaymentColor(payment.payment_method) }]}>
                    <Icon name={getPaymentIcon(payment.payment_method)} size={20} color="#fff" />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentType}>{formatPaymentMethod(payment.payment_method)}</Text>
                    <View style={styles.paymentStatusContainer}>
                      <View style={[
                        styles.paymentStatusDot, 
                        { backgroundColor: payment.status === 'active' ? '#28a745' : '#dc3545' }
                      ]} />
                      <Text style={[
                        styles.paymentStatus,
                        { color: payment.status === 'active' ? '#28a745' : '#dc3545' }
                      ]}>
                        {payment.status === 'active' ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.paymentSelection}>
                  {selectedPaymentMethod?.id === payment.id ? (
                    <Icon name="check-circle" size={20} color="#019a34" />
                  ) : (
                    <View style={styles.radioButton} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noPaymentCard}>
              <Icon name="credit-card" size={30} color="#ccc" />
              <Text style={styles.noPaymentText}>No payment methods available</Text>
            </View>
          )}
          
          {/* Selection Status */}
          {!selectedPaymentMethod && paymentSettings.length > 0 && (
            <View style={styles.selectionWarning}>
              <Icon name="exclamation-triangle" size={16} color="#ffc107" />
              <Text style={styles.selectionWarningText}>Please select a payment method to continue</Text>
            </View>
          )}
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryRow}>
              <Icon name="truck" size={16} color="#019a34" />
              <Text style={styles.deliveryText}>Free delivery on orders above ₹100</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Icon name="clock-o" size={16} color="#019a34" />
              <Text style={styles.deliveryText}>Estimated delivery: 2-3 business days</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderSummaryHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <Text style={styles.cartItemsCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
          </View>
          
          {/* Cart Items */}
          {cartItems.map((item, index) => (
            <View key={item.id} style={styles.cartItemRow}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemDetails}>
                  {item.quantity_kg} {item.unit_type} × ₹{item.price_per_kg}
                </Text>
              </View>
              <Text style={styles.cartItemSubtotal}>₹{item.subtotal}</Text>
            </View>
          ))}
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.paymentButton, 
            (!selectedAddress || !selectedPaymentMethod) && styles.paymentButtonDisabled
          ]} 
          onPress={handlePayment}
          disabled={!selectedAddress || !selectedPaymentMethod}
        >
          <Text style={styles.paymentButtonText}>Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Payment Successful!"
        message={successMessage}
        buttonText="Continue Shopping"
        onButtonPress={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
      />

      {/* Add Payment Method Modal */}
      <ConfirmationModal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        title="Add Payment Method"
        message="This feature is coming soon. For now, please use one of the existing payment methods."
        confirmText="OK"
        cancelText="Cancel"
        onConfirm={() => setShowAddPaymentModal(false)}
        onCancel={() => setShowAddPaymentModal(false)}
        type="info"
      />

      {/* Set Primary Address Modal */}
      <ConfirmationModal
        visible={showSetPrimaryModal}
        onClose={() => setShowSetPrimaryModal(false)}
        title="Set Primary Address"
        message={`Are you sure you want to set "${addressToSetPrimary?.address_label}" as your primary address?`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleSetPrimaryAddress}
        onCancel={() => setShowSetPrimaryModal(false)}
        type="warning"
      />

      {/* Confirm Payment Modal */}
      <ConfirmationModal
        visible={showConfirmPaymentModal}
        onClose={() => setShowConfirmPaymentModal(false)}
        title="Confirm Payment"
        message={`Are you sure you want to proceed with payment using ${selectedPaymentMethod?.payment_method ? formatPaymentMethod(selectedPaymentMethod.payment_method) : 'the selected payment method'}?`}
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirmPaymentModal(false)}
        type="warning"
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
    paddingHorizontal: p(25),
    paddingTop: p(25),
  },
  scrollContent: {
    paddingBottom: p(120), // Increased padding to account for the improved bottom bar
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(18),
    padding: p(25),
    marginBottom: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#2c3e50',
    fontFamily: 'Montserrat-Bold',
  },
  addNewButton: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Medium',
    paddingVertical: p(8),
    paddingHorizontal: p(16),
    backgroundColor: '#f0fff4',
    borderRadius: p(20),
    borderWidth: 1,
    borderColor: '#019a34',
  },
  sectionInstruction: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(10),
    marginBottom: p(15),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(18),
    paddingHorizontal: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: p(10),
    marginBottom: p(10),
  },
  selectedAddressCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    backgroundColor: '#f8fff8',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressIconContainer: {
    width: p(45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    width: p(22),
    height: p(22),
    borderRadius: p(11),
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  addressContent: {
    flex: 1,
    marginLeft: p(18),
  },
  addressLabel: {
    fontSize: fontSizes.base,
    color: '#2c3e50',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(6),
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: '#7f8c8d',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(20),
  },
  editButton: {
    padding: p(5),
  },
  noAddressCard: {
    alignItems: 'center',
    paddingVertical: p(20),
  },
  noAddressText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(10),
  },
  addAddressButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(10),
    paddingHorizontal: p(20),
    borderRadius: p(25),
    marginTop: p(20),
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: p(18),
    paddingHorizontal: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: p(10),
    marginBottom: p(10),
  },
  selectedPaymentCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    backgroundColor: '#f8fff8',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledPaymentCard: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentLogo: {
    width: p(45),
    height: p(45),
    borderRadius: p(22.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(4),
  },
  paymentNumber: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(5),
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatusDot: {
    width: p(8),
    height: p(8),
    borderRadius: p(4),
    marginRight: p(8),
  },
  paymentStatus: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
  },
  paymentSelection: {
    width: p(45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: p(18),
    padding: p(25),
    marginBottom: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f8f9fa',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(15),
    paddingBottom: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemsCount: {
    fontSize: fontSizes.base,
    color: '#7f8c8d',
    fontFamily: 'Poppins-Medium',
    backgroundColor: '#f8f9fa',
    paddingVertical: p(4),
    paddingHorizontal: p(10),
    borderRadius: p(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: p(12),
    paddingVertical: p(10),
    paddingHorizontal: p(12),
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
  },
  summaryLabel: {
    fontSize: fontSizes.base,
    color: '#7f8c8d',
    fontFamily: 'Poppins-Medium',
  },
  summaryValue: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  totalRow: {
    marginTop: p(18),
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
    paddingTop: p(15),
    backgroundColor: '#f0fff4',
    borderRadius: p(10),
  },
  totalLabel: {
    fontSize: fontSizes.xl,
    color: '#2c3e50',
    fontFamily: 'Montserrat-Bold',
  },
  totalValue: {
    fontSize: fontSizes.xl,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    backgroundColor: '#fafafa',
    borderRadius: p(6),
    marginBottom: p(6),
  },
  cartItemInfo: {
    flex: 1,
    marginRight: p(12),
  },
  cartItemName: {
    fontSize: fontSizes.base,
    color: '#2c3e50',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(3),
  },
  cartItemDetails: {
    fontSize: fontSizes.sm,
    color: '#7f8c8d',
    fontFamily: 'Poppins-Regular',
  },
  cartItemSubtotal: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
    backgroundColor: '#f0fff4',
    paddingVertical: p(6),
    paddingHorizontal: p(10),
    borderRadius: p(12),
  },
  summaryDivider: {
    height: p(8),
    backgroundColor: '#f0f0f0',
    marginTop: p(12),
    marginBottom: p(12),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: p(25),
    paddingVertical: p(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(4),
  },
  totalAmount: {
    fontSize: fontSizes.xl,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  paymentButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    paddingHorizontal: p(15),
    borderRadius: p(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: p(140),
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
  },
  loadingText: {
    marginTop: p(20),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  primaryIndicator: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(5),
  },
  deliveryInfo: {
    marginTop: p(15),
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(10),
  },
  deliveryText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(10),
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
    backgroundColor: '#f6fbf7',
  },
  emptyCartTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginTop: p(20),
  },
  emptyCartText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(10),
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(15),
    paddingHorizontal: p(30),
    borderRadius: p(25),
    marginTop: p(30),
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  paymentButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#95a5a6',
    shadowColor: '#95a5a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  noPaymentCard: {
    alignItems: 'center',
    paddingVertical: p(20),
  },
  noPaymentText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(10),
  },
  selectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: p(15),
    backgroundColor: '#fff3cd',
    paddingVertical: p(10),
    paddingHorizontal: p(15),
    borderRadius: p(8),
    borderLeftWidth: 5,
    borderLeftColor: '#ffeeba',
  },
  selectionWarningText: {
    fontSize: fontSizes.sm,
    color: '#856404',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(5),
  },
});

export default CheckoutScreen;
