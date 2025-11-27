import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../../redux/slices/cartSlice';
import { fetchProfile, setPrimaryAddress } from '../../../redux/slices/profileSlice';
import { placeOrder, verifyRazorpayPayment, clearOrderData } from '../../../redux/slices/ordersSlice';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import RazorpayCheckout from 'react-native-razorpay';
import { useFocusEffect } from '@react-navigation/native';

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { totalAmount, loading, cartItems, addresses: cartAddresses, paymentSettings } = useSelector(state => state.cart);
  const { user, profile, loading: profileLoading } = useSelector(state => state.profile);
  const { isLoggedIn } = useSelector(state => state.auth);


  const {
    orderData,
    razorpayOrderId,
    razorpayKey,
    razorpayAmount,
    razorpayCurrency,
    razorpayName,
    razorpayEmail,
    razorpayContact,
    couponData,
    discountAmount,
    finalAmount,
    placeOrderLoading,
    error: orderError,
    success: orderSuccess,
    paymentVerified,
    paymentVerificationError,
    paymentVerificationLoading
  } = useSelector(state => state.orders);

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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [localDiscountAmount, setLocalDiscountAmount] = useState(0);
  const [localFinalAmount, setLocalFinalAmount] = useState(0);

  // Use addresses from cart instead of profile
  const addresses = cartAddresses || [];

  // Check if user is logged in, if not redirect to login
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login', {
        redirectTo: 'Checkout',
        message: 'Please login or register to proceed with checkout'
      });
      return;
    }
  }, [isLoggedIn, navigation]);

  // Fetch cart and profile when component mounts
  useEffect(() => {
    if (!isLoggedIn) return;

    dispatch(fetchCart());
    dispatch(fetchProfile()); // Fetch profile to ensure user data is available

    // Cleanup function
    return () => {
      dispatch(clearOrderData());
    };
  }, [dispatch, clearOrderData, isLoggedIn]);

  // Reset state when screen comes into focus (e.g., when navigating back from MyOrdersScreen)
  useFocusEffect(
    useCallback(() => {
      // Clear all modal states
      setShowSuccessModal(false);
      setShowErrorModal(false);
      setShowSetPrimaryModal(false);
      setShowConfirmPaymentModal(false);
      setShowAddAddressModal(false);
      setShowAddPaymentModal(false);

      // Clear messages
      setSuccessMessage('');
      setErrorMessage('');

      // Clear coupon state
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      setLocalDiscountAmount(0);
      setLocalFinalAmount(0);

      // Clear order data from Redux
      dispatch(clearOrderData());

      // Reset address and payment selections to defaults
      if (addresses && addresses.length > 0) {
        setSelectedAddress(addresses[0]); // Select first address by default
      }
      if (paymentSettings && paymentSettings.length > 0) {
        const activePaymentMethod = paymentSettings.find(payment => payment.status === 'active');
        if (activePaymentMethod) {
          setSelectedPaymentMethod(activePaymentMethod);
        }
      }
    }, [addresses, paymentSettings, dispatch])
  );

  // Set default selections when data loads
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setSelectedAddress(addresses[0]); // Select first address by default
    }
    // Set default payment method from cart data - only if it's active
    if (paymentSettings && paymentSettings.length > 0) {
      const activePaymentMethod = paymentSettings.find(payment => payment.status === 'active');
      if (activePaymentMethod) {
        setSelectedPaymentMethod(activePaymentMethod);
      }
    }
  }, [addresses, paymentSettings, setSelectedAddress, setSelectedPaymentMethod]);

  // Handle order placement and Razorpay integration
  useEffect(() => {
    // Normalize payment method for comparison
    const normalizedPaymentMethod = selectedPaymentMethod?.payment_method?.trim().toUpperCase();
    const isRazorpayMethod = normalizedPaymentMethod === 'RAZORPAY' || normalizedPaymentMethod === 'RAZORPAYX';

    if (orderSuccess && razorpayOrderId && isRazorpayMethod) {
      // Initialize Razorpay payment
      handleRazorpayPayment();
    } else if (orderSuccess && !isRazorpayMethod) {
      // For non-Razorpay methods (COD, UPI_AT_DOOR), show success directly
      const paymentMethodName = formatPaymentMethod(selectedPaymentMethod?.payment_method);
      setSuccessMessage(`Order placed successfully using ${paymentMethodName}!`);
      setShowSuccessModal(true);
      dispatch(clearOrderData());
    }

    // Update local discount values with server response if available
    if (orderSuccess && discountAmount > 0) {
      setLocalDiscountAmount(discountAmount);
      setLocalFinalAmount(finalAmount);
    }
  }, [orderSuccess, razorpayOrderId, selectedPaymentMethod, dispatch, handleRazorpayPayment, setSuccessMessage, setShowSuccessModal, discountAmount, finalAmount]);

  // Handle payment verification
  useEffect(() => {
    if (paymentVerified) {
      setSuccessMessage('Order confirmed! Your payment was successful and order has been placed.');
      setShowSuccessModal(true);
      // Don't clear order data immediately, let user see the modal first
    }

    // Handle payment verification errors
    if (paymentVerificationError) {
      // Check if this is a backend error or payment verification error
      if (paymentVerificationError.status === 500 || paymentVerificationError.status === 400) {
        console.error('Backend error during payment verification');
        setErrorMessage('Server error during payment verification. Please contact support.');
      } else {
        setErrorMessage(paymentVerificationError.message || 'Payment verification failed. Please contact support.');
      }

      setShowErrorModal(true);
      // Clear the error after showing it
      dispatch(clearOrderData());
    }
  }, [paymentVerified, paymentVerificationError, dispatch]);

  // Handle order errors
  useEffect(() => {
    if (orderError) {
      console.error('Order error details:', orderError);

      let errorMessage = 'Failed to place order. Please try again.';

      if (typeof orderError === 'object' && orderError.message) {
        errorMessage = orderError.message;
      } else if (typeof orderError === 'string') {
        errorMessage = orderError;
      }

      // Add more specific error messages based on common validation errors
      if (errorMessage.toLowerCase().includes('validation')) {
        errorMessage = 'Please check your order details and try again.';
      } else if (errorMessage.toLowerCase().includes('address')) {
        errorMessage = 'Please select a valid delivery address.';
      } else if (errorMessage.toLowerCase().includes('payment')) {
        errorMessage = 'Please select a valid payment method.';
      }

      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    }
  }, [orderError, setErrorMessage, setShowErrorModal]);

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

  // Define the payment handler function outside of the main function
  const handlePaymentSuccess = useCallback((response) => {

    // Validate payment response
    if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
      console.error('Invalid Razorpay response:', response);
      setErrorMessage('Invalid payment response. Please contact support.');
      setShowErrorModal(true);
      return;
    }

    // Validate required data
    if (!selectedAddress || !selectedAddress.id) {
      console.error('Selected address is null or missing ID');
      setErrorMessage('No delivery address selected. Please select an address and try again.');
      setShowErrorModal(true);
      return;
    }

    // Try to get user data from profile or use fallback
    const currentUser = user || profile?.user || { id: razorpayEmail }; // Fallback to email if no user ID

    if (!currentUser || !currentUser.id) {
      console.error('User is null or missing ID. User object:', currentUser);
      setErrorMessage('User session expired. Please login again.');
      setShowErrorModal(true);
      return;
    }

    // Validate that the order_id from response matches our expected order_id
    if (response.razorpay_order_id !== razorpayOrderId) {
      console.error('ORDER ID MISMATCH!');
      console.error('Expected order_id:', razorpayOrderId);
      console.error('Received order_id:', response.razorpay_order_id);
      setErrorMessage('Order ID mismatch detected. Please contact support.');
      setShowErrorModal(true);
      return;
    }

    // Payment successful, verify with backend
    // CRITICAL: Use the order_id from Razorpay response, not from Redux state
    const paymentData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      user_id: currentUser.id,
      address_id: selectedAddress.id,
      total_amount: totalAmount,
      cart_items: cartItems.map(item => ({
        id: item.id,
        cart_id: item.cart_id,
        vegetable_id: item.vegetable_id,
        quantity_kg: item.quantity_kg,
        price_per_kg: item.price_per_kg,
        subtotal: item.subtotal,
        created_at: item.created_at,
        updated_at: item.updated_at,
        vegetable: {
          id: item.vegetable_id,
          farmer_id: item.farmer_id,
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          price_per_kg: item.price_per_kg,
          unit_type: item.unit_type,
          stock_kg: item.stock_kg,
          quantity_available: item.quantity_available,
          status: item.status,
          is_organic: item.is_organic,
          harvest_date: item.harvest_date,
          grade: item.grade,
          is_deleted: item.is_deleted,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }
      })),
      // Add coupon data if coupon is applied
      ...(appliedCoupon && {
        coupon_id: couponData?.coupon_id || 1, // Use server coupon_id if available, fallback to 1
        discount_amount: localDiscountAmount || discountAmount || 0,
        final_amount: localFinalAmount || finalAmount || totalAmount
      })
    };

    try {
      dispatch(verifyRazorpayPayment(paymentData));
      // Show loading state for payment verification
      setSuccessMessage('Payment successful! Verifying payment and creating your order...');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error dispatching verifyRazorpayPayment:', error);
      setErrorMessage('Failed to verify payment. Please contact support.');
      setShowErrorModal(true);
    }
  }, [razorpayOrderId, user, selectedAddress, totalAmount, cartItems, dispatch, setErrorMessage, setShowErrorModal, setSuccessMessage]);

  const handleRazorpayPayment = useCallback(() => {
    if (!razorpayKey || !razorpayOrderId || !razorpayAmount) {
      setErrorMessage('Razorpay configuration error. Please try again.');
      setShowErrorModal(true);
      return;
    }

    const options = {
      description: 'Vegetable Market Order',
      image: 'https://your-logo-url.com/logo.png',
      currency: razorpayCurrency || 'INR',
      key: razorpayKey,
      amount: razorpayAmount,
      name: razorpayName || 'Vegetable Market',
      order_id: razorpayOrderId,
      prefill: {
        email: razorpayEmail || user?.email,
        contact: razorpayContact || user?.phone,
        name: razorpayName || user?.name,
      },
      theme: { color: '#019a34' },
      // Test mode configuration
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Pay using UPI',
              instruments: [
                {
                  method: 'card'
                },
                {
                  method: 'netbanking'
                },
                {
                  method: 'wallet'
                }
              ]
            }
          }
        }
      },
      modal: {
        ondismiss: function () {
          // Payment modal dismissed
          console.log('=== RAZORPAY MODAL DISMISSED ===');
        }
      },
      // Add additional debugging
      notes: {
        address: 'Vegetable Market Order'
      }
    };

    try {
      RazorpayCheckout.open(options)
        .then((response) => {
          handlePaymentSuccess(response);
        })
        .catch((error) => {
          console.error('Razorpay payment failed:', error);
          setErrorMessage('Payment failed. Please try again.');
          setShowErrorModal(true);
        });
    } catch (error) {
      console.error('Razorpay error:', error);
      setErrorMessage('Failed to open payment gateway. Please try again.');
      setShowErrorModal(true);
    }
  }, [razorpayKey, razorpayOrderId, razorpayAmount, razorpayCurrency, razorpayName, razorpayEmail, razorpayContact, user, selectedAddress, totalAmount, cartItems, dispatch]);

  const handleConfirmPayment = () => {
    setShowConfirmPaymentModal(false);

    // Validate required data before proceeding
    if (!selectedAddress || !selectedAddress.id) {
      setErrorMessage('Please select a valid delivery address');
      setShowErrorModal(true);
      return;
    }

    if (!selectedPaymentMethod || !selectedPaymentMethod.payment_method) {
      setErrorMessage('Please select a valid payment method');
      setShowErrorModal(true);
      return;
    }

    // Place order with coupon code if applied
    // Normalize payment method - convert RAZORPAYX to RAZORPAY
    let normalizedPaymentMethod = selectedPaymentMethod.payment_method.trim().toUpperCase();
    if (normalizedPaymentMethod === 'RAZORPAYX') {
      normalizedPaymentMethod = 'RAZORPAY';
    }

    const orderData = {
      address_id: selectedAddress.id,
      payment_method: normalizedPaymentMethod,
      ...(appliedCoupon && { coupon_code: appliedCoupon.trim() })
    };
    dispatch(placeOrder(orderData));
  };

  const handleAddNewAddress = () => {
    navigation.navigate('ProfileEdit', { activeTab: 'address', fromCheckout: true });
  };

  const handleEditAddress = (address) => {
    navigation.navigate('ProfileEdit', { activeTab: 'address', editAddress: address, fromCheckout: true });
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

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Check minimum order amount for coupon (₹100)
    const minimumOrderAmount = 100;
    if (totalAmount < minimumOrderAmount) {
      setCouponError(`Minimum order amount for this coupon is ₹${minimumOrderAmount}.00`);
      return;
    }

    // Calculate local discount (10% for "save10" coupon)
    let discountPercent = 0;
    if (couponCode.trim().toLowerCase() === 'save10') {
      discountPercent = 0.10; // 10% discount
    }

    if (discountPercent > 0) {
      const discount = totalAmount * discountPercent;
      const finalAmount = totalAmount - discount;

      setAppliedCoupon(couponCode.trim());
      setLocalDiscountAmount(discount);
      setLocalFinalAmount(finalAmount);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setLocalDiscountAmount(0);
    setLocalFinalAmount(0);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Clear order data after closing modal
    dispatch(clearOrderData());
    // Navigate to App (BottomTabNavigator) and then to BucketTab
    navigation.navigate('App', { screen: 'BucketTab' });
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleRetryPaymentVerification = () => {
    setShowErrorModal(false);
    // Retry payment verification with the same data
    if (orderData && selectedAddress && selectedPaymentMethod) {
      const paymentData = {
        razorpay_payment_id: orderData.razorpay_payment_id,
        razorpay_order_id: orderData.razorpay_order_id,
        razorpay_signature: orderData.razorpay_signature,
        user_id: user?.id,
        address_id: selectedAddress?.id,
        total_amount: totalAmount,
        cart_items: cartItems.map(item => ({
          id: item.id,
          cart_id: item.cart_id,
          vegetable_id: item.vegetable_id,
          quantity_kg: item.quantity_kg,
          price_per_kg: item.price_per_kg,
          subtotal: item.subtotal,
          created_at: item.created_at,
          updated_at: item.updated_at,
          vegetable: {
            id: item.vegetable_id,
            farmer_id: item.farmer_id,
            category_id: item.category_id,
            name: item.name,
            description: item.description,
            price_per_kg: item.price_per_kg,
            unit_type: item.unit_type,
            stock_kg: item.stock_kg,
            quantity_available: item.quantity_available,
            status: item.status,
            is_organic: item.is_organic,
            harvest_date: item.harvest_date,
            grade: item.grade,
            is_deleted: item.is_deleted,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }
        })),
        // Add coupon data if coupon is applied
        ...(appliedCoupon && {
          coupon_id: couponData?.coupon_id || 1,
          discount_amount: localDiscountAmount || discountAmount || 0,
          final_amount: localFinalAmount || finalAmount || totalAmount
        })
      };
      dispatch(verifyRazorpayPayment(paymentData));
    }
  };

  // Helper functions for payment methods
  const getPaymentIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case 'COD':
        return 'money';
      case 'UPI_AT_DOOR':
        return 'mobile';
      case 'RAZORPAY':
        return 'rupee';
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
        return 'Online Payment';
      default:
        return paymentMethod;
    }
  };

  if (loading || placeOrderLoading || paymentVerificationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Checkout"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>
            {placeOrderLoading ? 'Processing order...' :
              paymentVerificationLoading ? 'Verifying payment and creating order...' :
                'Loading checkout...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
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
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

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

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Have a Coupon?</Text>
          <View style={styles.couponContainer}>
            <View style={styles.couponInputContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                placeholderTextColor="#999"
                value={couponCode}
                onChangeText={setCouponCode}
                editable={!appliedCoupon}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {!appliedCoupon ? (
                <TouchableOpacity
                  style={styles.applyCouponButton}
                  onPress={handleApplyCoupon}
                >
                  <Text style={styles.applyCouponButtonText}>Apply</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.removeCouponButton}
                  onPress={handleRemoveCoupon}
                >
                  <Icon name="times" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            {appliedCoupon && (
              <View style={styles.appliedCouponContainer}>
                <Icon name="check-circle" size={16} color="#28a745" />
                <Text style={styles.appliedCouponText}>Coupon "{appliedCoupon}" applied</Text>
              </View>
            )}
            {couponError ? (
              <Text style={styles.couponErrorText}>{couponError}</Text>
            ) : null}
            {!appliedCoupon && totalAmount < 100 && (
              <View style={styles.couponInfoContainer}>
                <Icon name="info-circle" size={14} color="#666" />
                <Text style={styles.couponInfoText}>Minimum order ₹100 required for coupon</Text>
              </View>
            )}
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
          {appliedCoupon && localDiscountAmount > 0 && (
            <View style={[styles.summaryRow, styles.discountRow]}>
              <Text style={styles.discountLabel}>Coupon Discount</Text>
              <Text style={styles.discountValue}>-₹{localDiscountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>
              ₹{appliedCoupon && localFinalAmount > 0 ? localFinalAmount.toFixed(2) : totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalAmount}>
            ₹{appliedCoupon && localFinalAmount > 0 ? localFinalAmount.toFixed(2) : totalAmount.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!selectedAddress || !selectedPaymentMethod || placeOrderLoading || paymentVerificationLoading) && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!selectedAddress || !selectedPaymentMethod || placeOrderLoading || paymentVerificationLoading}
        >
          {(placeOrderLoading || paymentVerificationLoading) ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.paymentButtonText}>Proceed</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => { }} // Prevent closing on outside click
        title="Order Confirmed!"
        message={successMessage}
        buttonText="Continue"
        onButtonPress={handleSuccessModalClose}
        showSecondaryButton={true}
        secondaryButtonText="View Orders"
        onSecondaryButtonPress={() => {
          setShowSuccessModal(false);
          dispatch(clearOrderData());
          navigation.replace('MyOrders');
        }}
        buttonStyle={styles.successModalButton}
        closeOnBackdropPress={false}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title={paymentVerificationError ? "Payment Verification Failed" : "Error"}
        message={paymentVerificationError ?
          `${errorMessage}\n\nYour payment was successful, but we couldn't verify it. Click 'Retry' to try again or contact support if the issue persists.` :
          errorMessage}
        buttonText={paymentVerificationError ? "Retry" : "OK"}
        onButtonPress={paymentVerificationError ? handleRetryPaymentVerification : handleErrorModalClose}
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
    paddingHorizontal: p(16),
    paddingTop: p(16),
  },
  scrollContent: {
    paddingBottom: p(120), // Increased padding to account for the improved bottom bar
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  addNewButton: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Medium',
    paddingVertical: p(6),
    paddingHorizontal: p(12),
    backgroundColor: '#f0fff4',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#019a34',
  },
  sectionInstruction: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(8),
    marginBottom: p(12),
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: p(8),
    marginBottom: p(8),
  },
  selectedAddressCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    backgroundColor: '#f8fff8',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addressIconContainer: {
    width: p(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButton: {
    width: p(18),
    height: p(18),
    borderRadius: p(9),
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  addressContent: {
    flex: 1,
    marginLeft: p(14),
  },
  addressLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(4),
  },
  addressText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(16),
  },
  editButton: {
    padding: p(5),
  },
  noAddressCard: {
    alignItems: 'center',
    paddingVertical: p(16),
  },
  noAddressText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(8),
  },
  addAddressButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    marginTop: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: p(14),
    paddingHorizontal: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: p(8),
    marginBottom: p(8),
  },
  selectedPaymentCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    backgroundColor: '#f8fff8',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
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
    width: p(36),
    height: p(36),
    borderRadius: p(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(3),
  },
  paymentNumber: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(4),
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatusDot: {
    width: p(6),
    height: p(6),
    borderRadius: p(3),
    marginRight: p(6),
  },
  paymentStatus: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
  },
  paymentSelection: {
    width: p(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
    paddingBottom: p(10),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemsCount: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Medium',
    backgroundColor: '#f8f9fa',
    paddingVertical: p(3),
    paddingHorizontal: p(8),
    borderRadius: p(8),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: p(10),
    paddingVertical: p(8),
    paddingHorizontal: p(10),
    backgroundColor: '#f8f9fa',
    borderRadius: p(6),
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Medium',
  },
  summaryValue: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  totalRow: {
    marginTop: p(14),
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
    paddingTop: p(12),
    backgroundColor: '#f0fff4',
    borderRadius: p(8),
  },
  totalLabel: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  totalValue: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(6),
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    backgroundColor: '#fafafa',
    borderRadius: p(6),
    marginBottom: p(5),
  },
  cartItemInfo: {
    flex: 1,
    marginRight: p(10),
  },
  cartItemName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Medium',
    marginBottom: p(2),
  },
  cartItemDetails: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  cartItemSubtotal: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    backgroundColor: '#f0fff4',
    paddingVertical: p(4),
    paddingHorizontal: p(8),
    borderRadius: p(8),
  },
  summaryDivider: {
    height: p(6),
    backgroundColor: '#f0f0f0',
    marginTop: p(10),
    marginBottom: p(10),
  },
  bottomBar: {
    position: 'absolute',
    // bottom: 16,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: p(16),
    paddingVertical: p(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 32
  },
  totalContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  paymentButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(6),
    paddingHorizontal: p(12),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    minWidth: p(112),
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
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
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  primaryIndicator: {
    fontSize: fontSizes.xs,
    color: '#019a34',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(4),
  },
  deliveryInfo: {
    marginTop: p(12),
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  deliveryText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(8),
  },

  // Coupon Section Styles
  couponContainer: {
    marginTop: p(12),
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  couponInput: {
    flex: 1,
    height: p(44),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fafafa',
    marginRight: p(8),
  },
  applyCouponButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  removeCouponButton: {
    backgroundColor: '#dc3545',
    paddingVertical: p(12),
    paddingHorizontal: p(12),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingVertical: p(8),
    paddingHorizontal: p(12),
    borderRadius: p(6),
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  appliedCouponText: {
    fontSize: fontSizes.sm,
    color: '#155724',
    fontFamily: 'Poppins-Medium',
    marginLeft: p(6),
  },
  couponErrorText: {
    fontSize: fontSizes.xs,
    color: '#dc3545',
    fontFamily: 'Poppins-Regular',
    marginTop: p(4),
  },
  couponInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: p(6),
    paddingHorizontal: p(10),
    borderRadius: p(6),
    marginTop: p(6),
    borderLeftWidth: 3,
    borderLeftColor: '#6c757d',
  },
  couponInfoText: {
    fontSize: fontSizes.xs,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(6),
  },

  // Discount Row Styles
  discountRow: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  discountLabel: {
    fontSize: fontSizes.sm,
    color: '#155724',
    fontFamily: 'Poppins-Medium',
  },
  discountValue: {
    fontSize: fontSizes.base,
    color: '#28a745',
    fontFamily: 'Poppins-Bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(16),
    backgroundColor: '#f6fbf7',
  },
  emptyCartTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
  },
  emptyCartText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(8),
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    marginTop: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  paymentButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#95a5a6',
    shadowColor: '#95a5a6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  noPaymentCard: {
    alignItems: 'center',
    paddingVertical: p(16),
  },
  noPaymentText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(8),
  },
  selectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: p(12),
    backgroundColor: '#fff3cd',
    paddingVertical: p(8),
    paddingHorizontal: p(12),
    borderRadius: p(6),
    borderLeftWidth: 4,
    borderLeftColor: '#ffeeba',
  },
  selectionWarningText: {
    fontSize: fontSizes.xs,
    color: '#856404',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(4),
  },
  successModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(10),
    paddingHorizontal: p(16),
    backgroundColor: '#019a34',
    borderRadius: p(8),
    minHeight: p(40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
});

export default CheckoutScreen;
