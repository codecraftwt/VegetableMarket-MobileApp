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
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchAssignedDeliveryDetails,
  clearDeliveryError
} from '../../../redux/slices/deliverySlice';
import { updateOrderStatus, updateAssignmentStatus, updatePaymentStatus, clearTodaysTaskSuccess } from '../../../redux/slices/todaysTaskSlice';
import { generateOTP, verifyOTP, getOTPStatus, clearOTPError, clearOTPSuccess, setOTPGenerated, setOTPVerified } from '../../../redux/slices/otpSlice';
import { addNotification } from '../../../redux/slices/notificationSlice';
import ErrorModal from '../../../components/ErrorModal';
import SuccessModal from '../../../components/SuccessModal';
import OTPModal from '../../../components/OTPModal';

const AssignedDeliveryDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { assignedDeliveryDetails, loadingAssignedDetails, error } = useSelector(state => state.delivery);
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
  const { 
    generateLoading: generateOTPLoading,
    verifyLoading: verifyOTPLoading,
    statusLoading: otpStatusLoading,
    error: otpError,
    success: otpSuccess,
    message: otpMessage,
    otpGenerated,
    otpVerified,
    otpStatus,
    actualOTP
  } = useSelector(state => state.otp);
  // const { orderId } = route.params;
  const { orderId, deliveryId } = route.params;
  const actualOrderId = orderId || deliveryId

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  
  // Local state to track current order and payment status for immediate UI updates
  const [currentDeliveryStatus, setCurrentDeliveryStatus] = useState(null);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      // Clear any lingering success state when screen comes into focus
      dispatch(clearTodaysTaskSuccess());
      dispatch(clearOTPSuccess());

      //     if (orderId) {
      //       dispatch(fetchAssignedDeliveryDetails(orderId));
      //     }
      //   }, [orderId, dispatch])
      // );
      if (actualOrderId) {
        dispatch(fetchAssignedDeliveryDetails(actualOrderId));
      }
    }, [actualOrderId, dispatch])
  );

  // Debug the API response structure and initialize local state
  useEffect(() => {
    if (assignedDeliveryDetails) {
      console.log('Assigned delivery details received:', JSON.stringify(assignedDeliveryDetails, null, 2));
      console.log('QR URL location:', assignedDeliveryDetails?.order?.upi_qr_url);
      
      // Initialize local state with current values
      setCurrentDeliveryStatus(assignedDeliveryDetails.order?.delivery_status);
      setCurrentPaymentStatus(assignedDeliveryDetails.order?.payment_status);
      
      // Check for existing OTP if order is out for delivery and payment is paid
      const deliveryStatus = assignedDeliveryDetails.order?.delivery_status;
      const paymentStatus = assignedDeliveryDetails.order?.payment_status;
      
      if (deliveryStatus === 'out_for_delivery' && paymentStatus === 'paid') {
        console.log('🔍 Checking for existing OTP:', {
          orderId: assignedDeliveryDetails.order.id,
          deliveryStatus,
          paymentStatus
        });
        dispatch(getOTPStatus(assignedDeliveryDetails.order.id));
      }
    }
  }, [assignedDeliveryDetails]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearDeliveryError());
    }
  }, [error]);

  useEffect(() => {
    if (updateOrderStatusSuccess && updateOrderStatusMessage) {
      setShowSuccessModal(true);
      
      // Update local state immediately based on the action performed
      if (updateOrderStatusMessage.includes('out_for_delivery') || updateOrderStatusMessage.includes('started')) {
        setCurrentDeliveryStatus('out_for_delivery');
      } else if (updateOrderStatusMessage.includes('delivered') || updateOrderStatusMessage.includes('completed')) {
        setCurrentDeliveryStatus('delivered');
      }
    }
  }, [updateOrderStatusSuccess, updateOrderStatusMessage]);

  useEffect(() => {
    if (updateOrderStatusError || updatePaymentStatusError) {
      setShowErrorModal(true);
      
      // Revert local state changes if API call failed
      if (updateOrderStatusError) {
        // Revert to original state from Redux
        if (assignedDeliveryDetails?.order?.delivery_status) {
          setCurrentDeliveryStatus(assignedDeliveryDetails.order.delivery_status);
        }
      }
      if (updatePaymentStatusError) {
        // Revert to original state from Redux
        if (assignedDeliveryDetails?.order?.payment_status) {
          setCurrentPaymentStatus(assignedDeliveryDetails.order.payment_status);
        }
      }
    }
  }, [updateOrderStatusError, updatePaymentStatusError, assignedDeliveryDetails]);

  useEffect(() => {
    if (updatePaymentStatusSuccess && updatePaymentStatusMessage) {
      setShowSuccessModal(true);
      
      // Update local payment status immediately
      if (updatePaymentStatusMessage.includes('paid') || updatePaymentStatusMessage.includes('payment')) {
        setCurrentPaymentStatus('paid');
      }
    }
  }, [updatePaymentStatusSuccess, updatePaymentStatusMessage]);

  // OTP related useEffect hooks
  useEffect(() => {
    if (otpError && !otpError.includes('OTP has already been sent and is still valid')) {
      console.log('🚨 OTP Error Detected (Non-Exists):', otpError);
      setShowErrorModal(true);
      dispatch(clearOTPError());
    }
  }, [otpError]);

  useEffect(() => {
    if (otpSuccess && otpMessage) {
      console.log('🎉 OTP Success Effect Triggered:', {
        message: otpMessage,
        otpGenerated: otpGenerated,
        otpVerified: otpVerified
      });
      
      if (otpMessage.includes('generated')) {
        console.log('📱 OTP Generated - Opening Modal');
        setShowSuccessModal(true);
        setShowOTPModal(true);
        
        // Add OTP notification to the notification list
        const otpNotification = {
          id: Date.now(),
          title: 'OTP Generated',
          message: `Your OTP for order #${assignedDeliveryDetails?.order?.id} is : ${actualOTP || otpStatus?.otp || 'Generated'}`,
          type: 'otp',
          is_read: false,
          created_at: new Date().toISOString(),
          order_id: assignedDeliveryDetails?.order?.id
        };
        
        console.log('📱 Adding OTP Notification:', otpNotification);
        dispatch(addNotification(otpNotification));
        
      } else if (otpMessage.includes('verified')) {
        console.log('✅ OTP Verified - Closing Modal and Enabling Mark Complete');
        setShowOTPModal(false);
        setShowSuccessModal(true);
        // After OTP verification, allow marking complete
        dispatch(setOTPVerified(true));
      }
    }
  }, [otpSuccess, otpMessage, otpStatus, actualOTP, assignedDeliveryDetails, dispatch]);

  // Handle OTP already exists scenario
  useEffect(() => {
    if (otpError && otpError.includes('OTP has already been sent and is still valid')) {
      console.log('🔄 OTP Already Exists - Opening Verification Modal');
      setShowOTPModal(true);
      dispatch(setOTPGenerated(true)); // Mark as generated so button doesn't show
      dispatch(clearOTPError()); // Clear the error
      
      // Add notification for existing OTP
      const existingOTPNotification = {
        id: Date.now(),
        title: 'OTP Already Generated',
        message: `Your OTP for order #${assignedDeliveryDetails?.order?.id} is already active`,
        type: 'otp',
        is_read: false,
        created_at: new Date().toISOString(),
        order_id: assignedDeliveryDetails?.order?.id
      };
      
      console.log('📱 Adding Existing OTP Notification:', existingOTPNotification);
      dispatch(addNotification(existingOTPNotification));
    }
  }, [otpError, assignedDeliveryDetails, dispatch]);

  // Handle OTP status received - automatically show modal if OTP exists and is not verified
  useEffect(() => {
    console.log('🔍 OTP Status Effect Triggered:', {
      otpStatus: otpStatus,
      otpGenerated: otpGenerated,
      otpVerified: otpVerified
    });
    
    if (otpStatus && otpStatus.exists && !otpStatus.verified) {
      console.log('📱 Existing OTP Found - Opening Verification Modal:', {
        exists: otpStatus.exists,
        verified: otpStatus.verified,
        created_at: otpStatus.created_at,
        expires_at: otpStatus.expires_at
      });
      
      // Check if OTP is not expired
      const now = new Date();
      const expiresAt = new Date(otpStatus.expires_at);
      const isExpired = now > expiresAt;
      
      console.log('⏰ OTP Expiration Check:', {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: isExpired
      });
      
      if (!isExpired) {
        console.log('✅ OTP is valid - Opening modal and marking as generated');
        setShowOTPModal(true);
        dispatch(setOTPGenerated(true)); // Mark as generated so button doesn't show
        
        // Add notification for existing valid OTP
        const existingValidOTPNotification = {
          id: Date.now(),
          title: 'OTP Found',
          message: `Your OTP for order #${assignedDeliveryDetails?.order?.id} is still valid`,
          type: 'otp',
          is_read: false,
          created_at: new Date().toISOString(),
          order_id: assignedDeliveryDetails?.order?.id
        };
        
        console.log('📱 Adding Existing Valid OTP Notification:', existingValidOTPNotification);
        dispatch(addNotification(existingValidOTPNotification));
      } else {
        console.log('⏰ OTP is expired, will show Generate OTP button');
      }
    } else if (otpStatus) {
      console.log('📊 OTP Status Details:', {
        exists: otpStatus.exists,
        verified: otpStatus.verified,
        reason: !otpStatus.exists ? 'OTP does not exist' : 'OTP already verified'
      });
    }
  }, [otpStatus]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenAddressInMaps = (address, coordinates = null) => {
    if (!address && !coordinates) {
      Alert.alert('Error', 'No address or coordinates available to open in maps');
      return;
    }

    let mapsUrl;
    
    // If we have coordinates, use them for more accurate location
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const { latitude, longitude } = coordinates;
      
      if (Platform.OS === 'ios') {
        // For iOS, use Apple Maps with coordinates
        mapsUrl = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(address || 'Location')}`;
      } else {
        // For Android, use Google Maps with coordinates
        mapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(address || 'Location')})`;
      }
    } else {
      // Fallback to address-based search with better formatting
      const encodedAddress = encodeURIComponent(address);
      
      if (Platform.OS === 'ios') {
        // For iOS, use Apple Maps with address
        mapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;
      } else {
        // For Android, use Google Maps with address
        mapsUrl = `geo:0,0?q=${encodedAddress}`;
      }
    }

    // Try to open the maps URL
    Linking.openURL(mapsUrl).catch(err => {
      console.error('Failed to open maps:', err);
      
      // Enhanced fallback with coordinates if available
      let fallbackUrl;
      if (coordinates && coordinates.latitude && coordinates.longitude) {
        fallbackUrl = `https://www.google.com/maps/@${coordinates.latitude},${coordinates.longitude},15z`;
      } else {
        fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }
      
      Linking.openURL(fallbackUrl).catch(fallbackErr => {
        console.error('Failed to open fallback maps:', fallbackErr);
        Alert.alert('Error', 'Unable to open maps. Please check your device settings.');
      });
    });
  };

  const handleStartDelivery = () => {
    if (assignedDeliveryDetails?.order?.id) {
      // Update local state immediately for instant UI feedback
      setCurrentDeliveryStatus('out_for_delivery');
      dispatch(updateOrderStatus({ orderId: assignedDeliveryDetails.order.id, status: 'out_for_delivery' }));
    }
  };

  const handleMarkComplete = () => {
    if (assignedDeliveryDetails?.order?.id) {
      // Update local state immediately for instant UI feedback
      setCurrentDeliveryStatus('delivered');
      dispatch(updateOrderStatus({ orderId: assignedDeliveryDetails.order.id, status: 'delivered' }));
    }
  };

  const handleUpdateAssignmentStatus = (assignmentId, status) => {
    dispatch(updateAssignmentStatus({ assignmentId, status }));
  };

  const handleUpdatePaymentStatus = (orderId, paymentStatus) => {
    dispatch(updatePaymentStatus({ orderId, paymentStatus }));
  };

  const handleMarkPaymentPaid = () => {
    if (assignedDeliveryDetails?.order?.id) {
      // Update local state immediately for instant UI feedback
      setCurrentPaymentStatus('paid');
      dispatch(updatePaymentStatus({ orderId: assignedDeliveryDetails.order.id, paymentStatus: 'paid' }));
    }
  };

  const handleGenerateOTP = () => {
    if (assignedDeliveryDetails?.order?.id) {
      console.log('🎯 Generate OTP Button Clicked:', {
        orderId: assignedDeliveryDetails.order.id,
        orderIdType: typeof assignedDeliveryDetails.order.id,
        orderStatus: currentDeliveryStatus || assignedDeliveryDetails.order.delivery_status,
        paymentStatus: currentPaymentStatus || assignedDeliveryDetails.order.payment_status,
        fullOrderData: assignedDeliveryDetails.order
      });
      
      // Ensure orderId is a number
      const orderId = parseInt(assignedDeliveryDetails.order.id);
      console.log('🔢 Parsed Order ID:', {
        original: assignedDeliveryDetails.order.id,
        parsed: orderId,
        isValid: !isNaN(orderId)
      });
      
      dispatch(generateOTP({ orderId: orderId }));
    } else {
      console.log('❌ Cannot generate OTP - Missing order data:', {
        assignedDeliveryDetails: assignedDeliveryDetails,
        orderExists: !!assignedDeliveryDetails?.order,
        orderIdExists: !!assignedDeliveryDetails?.order?.id
      });
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (assignedDeliveryDetails?.order?.id) {
      console.log('🔍 Verify OTP Button Clicked:', {
        orderId: assignedDeliveryDetails.order.id,
        otp: otp,
        otpLength: otp.length
      });
      
      // Check OTP status before verification
      console.log('🔍 Current OTP Status Before Verification:', {
        otpStatus: otpStatus,
        otpGenerated: otpGenerated,
        otpVerified: otpVerified
      });
      
      try {
        await dispatch(verifyOTP({ orderId: assignedDeliveryDetails.order.id, otp })).unwrap();
      } catch (error) {
        console.log('🚨 Verify OTP failed:', error);
        
        // Check if it's a 422 error (validation error)
        if (error.message && error.message.includes('422')) {
          console.log('🚨 OTP Validation Error - Possible causes:');
          console.log('   - OTP is incorrect');
          console.log('   - OTP has expired');
          console.log('   - OTP has already been used');
          console.log('   - Order ID mismatch');
          
          // Check if OTP has expired
          if (otpStatus && otpStatus.expires_at) {
            const now = new Date();
            const expiresAt = new Date(otpStatus.expires_at);
            const isExpired = now > expiresAt;
            console.log('🕐 OTP Expiration Check:', {
              now: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
              isExpired: isExpired,
              timeRemaining: isExpired ? 'EXPIRED' : `${Math.floor((expiresAt - now) / 1000 / 60)} minutes`
            });
          }
        }
      }
    }
  };

  const handleResendOTP = () => {
    handleGenerateOTP();
  };

  const handleOTPModalClose = () => {
    setShowOTPModal(false);
    dispatch(clearOTPSuccess());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_delivery':
        return '#ffc107';
      case 'out_for_delivery':
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
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderOrderInfo = () => {
    if (!assignedDeliveryDetails?.order) return null;
    
    const { order } = assignedDeliveryDetails;
    
    // Use local state for immediate UI updates, fallback to Redux state
    const deliveryStatus = currentDeliveryStatus || order.delivery_status;
    const paymentStatus = currentPaymentStatus || order.payment_status;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="credit-card" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Payment:</Text>
            <Text style={styles.infoValue}>
              {order.payment_method} ({paymentStatus})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="truck" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={styles.infoSpacer} />
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deliveryStatus) }]}>
              <Text style={styles.statusText}>{getStatusText(deliveryStatus)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="rupee" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={[styles.infoValue, styles.totalAmount]}>₹{order.final_total}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="user" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Assignment:</Text>
            <Text style={styles.infoValue}>ID #{order.assignment_id} - {order.assignment_status}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerInfo = () => {
    if (!assignedDeliveryDetails?.order?.customer_name) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="user" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{assignedDeliveryDetails.order.customer_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Address:</Text>
            <TouchableOpacity 
              style={styles.addressContainer}
              onPress={() => handleOpenAddressInMaps(
                assignedDeliveryDetails.order.customer_address,
                assignedDeliveryDetails.order.customer_coordinates || 
                assignedDeliveryDetails.order.coordinates
              )}
              activeOpacity={0.7}
            >
              <Text style={[styles.infoValue, styles.clickableAddress]}>
                {assignedDeliveryDetails.order.customer_address}
              </Text>
              <Icon name="external-link" size={p(12)} color="#019a34" style={styles.externalLinkIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderUPIQR = () => {
    // Check for QR URL in multiple possible locations
    const qrUrl = assignedDeliveryDetails?.order?.upi_qr_url || 
                  assignedDeliveryDetails?.upi_qr_url ||
                  assignedDeliveryDetails?.data?.order?.upi_qr_url;
    
    if (!qrUrl) {
      return null;
    }
    
    const handleOpenQRUrl = () => {
      Linking.openURL(qrUrl).catch(err => {
        console.error('Failed to open QR URL:', err);
        Alert.alert('Error', 'Failed to open payment link');
      });
    };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment QR Code</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={handleOpenQRUrl}
            activeOpacity={0.7}
          >
            <View style={styles.qrIconContainer}>
              <Icon name="qrcode" size={p(60)} color="#019a34" />
            </View>
            <Text style={styles.qrButtonText}>Tap to Open Payment QR</Text>
            <Text style={styles.qrSubtext}>This will open the payment link in your browser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFarmerAddresses = () => {
    if (!assignedDeliveryDetails?.order?.farmer_addresses) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farmer Addresses</Text>
        {assignedDeliveryDetails.order.farmer_addresses.map((farmer, index) => (
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
            <TouchableOpacity 
              style={styles.farmerAddress}
              onPress={() => handleOpenAddressInMaps(
                farmer.address,
                farmer.coordinates || farmer.latitude && farmer.longitude ? {
                  latitude: farmer.latitude,
                  longitude: farmer.longitude
                } : null
              )}
              activeOpacity={0.7}
            >
              <Icon name="map-marker" size={p(14)} color="#019a34" />
              <Text style={[styles.addressText, styles.clickableAddress]}>{farmer.address}</Text>
              <Icon name="external-link" size={p(10)} color="#019a34" style={styles.externalLinkIcon} />
            </TouchableOpacity>
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
    if (!assignedDeliveryDetails?.order) return null;
    
    const { order } = assignedDeliveryDetails;
    
    // Use local state for immediate UI updates, fallback to Redux state
    const deliveryStatus = currentDeliveryStatus || order.delivery_status;
    const paymentStatus = currentPaymentStatus || order.payment_status;
    
    console.log('🎯 Action Buttons Render Check:', {
      deliveryStatus,
      paymentStatus,
      otpGenerated,
      otpVerified,
      showGenerateOTP: deliveryStatus === 'out_for_delivery' && paymentStatus === 'paid' && !otpGenerated,
      showMarkComplete: deliveryStatus === 'out_for_delivery' && paymentStatus === 'paid' && otpVerified
    });
    
    return (
      <View style={styles.section}>
        <View style={styles.actionButtonsContainer}>
          {/* Step 1: ONLY Start Delivery button when ready for delivery */}
          {deliveryStatus === 'ready_for_delivery' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton, updateOrderStatusLoading && styles.disabledButton]}
              onPress={handleStartDelivery}
              disabled={updateOrderStatusLoading}
            >
              {updateOrderStatusLoading ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="play" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {updateOrderStatusLoading ? 'Starting...' : 'Start Delivery'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Step 2: ONLY Mark Payment Paid button when out for delivery and payment is pending */}
          {deliveryStatus === 'out_for_delivery' && paymentStatus === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton, updatePaymentStatusLoading && styles.disabledButton]}
              onPress={handleMarkPaymentPaid}
              disabled={updatePaymentStatusLoading}
            >
              {updatePaymentStatusLoading ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="credit-card" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {updatePaymentStatusLoading ? 'Updating...' : 'Mark Payment Paid'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Step 3: Generate OTP button when out for delivery and payment is paid */}
          {deliveryStatus === 'out_for_delivery' && paymentStatus === 'paid' && !otpGenerated && (
            <TouchableOpacity
              style={[styles.actionButton, styles.otpButton, generateOTPLoading && styles.disabledButton]}
              onPress={handleGenerateOTP}
              disabled={generateOTPLoading}
            >
              {generateOTPLoading ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="key" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {generateOTPLoading ? 'Generating...' : 'Generate OTP'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Step 4: Mark Complete button when OTP is verified */}
          {deliveryStatus === 'out_for_delivery' && paymentStatus === 'paid' && otpVerified && (
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

          {/* Final State: Delivery Completed */}
          {deliveryStatus === 'delivered' && (
            <View style={styles.completedIndicator}>
              <Icon name="check-circle" size={p(20)} color="#28a745" />
              <Text style={styles.completedText}>Delivery Completed</Text>
            </View>
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
        screenName="Assigned Delivery Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        {loadingAssignedDetails ? (
          renderSkeletonLoader()
        ) : assignedDeliveryDetails ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {renderOrderInfo()}
            {renderCustomerInfo()}
            {renderUPIQR()}
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
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearTodaysTaskSuccess());
          dispatch(clearOTPSuccess());
        }}
        title="Success"
        message={updateOrderStatusMessage || updatePaymentStatusMessage || otpMessage || "Action completed successfully!"}
        buttonText="OK"
        onButtonPress={() => {
          setShowSuccessModal(false);
          dispatch(clearTodaysTaskSuccess());
          dispatch(clearOTPSuccess());
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || updateOrderStatusError || updatePaymentStatusError || otpError || "Failed to load delivery details. Please try again."}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />

      {/* OTP Modal */}
      <OTPModal
        visible={showOTPModal}
        onClose={handleOTPModalClose}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        loading={verifyOTPLoading}
        error={otpError}
        orderId={assignedDeliveryDetails?.order?.id}
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
    marginBottom: p(50),
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
    textAlign: 'right',
    marginLeft: 'auto',
  },
  phoneNumber: {
    color: '#019a34',
    textDecorationLine: 'underline',
  },
  addressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  clickableAddress: {
    color: '#019a34',
    textDecorationLine: 'underline',
    flex: 1,
  },
  externalLinkIcon: {
    marginLeft: p(4),
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
    marginLeft: 'auto',
  },
  infoSpacer: {
    flex: 1,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  qrButton: {
    alignItems: 'center',
    paddingVertical: p(20),
    paddingHorizontal: p(16),
  },
  qrIconContainer: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(12),
    borderWidth: 2,
    borderColor: '#019a34',
    borderStyle: 'dashed',
  },
  qrButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    textAlign: 'center',
    marginBottom: p(6),
  },
  qrSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(16),
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
  farmerName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
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
  otpButton: {
    backgroundColor: '#6f42c1',
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(8),
    backgroundColor: '#d4edda',
    borderRadius: p(8),
    gap: p(6),
  },
  completedText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#28a745',
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
});

export default AssignedDeliveryDetailsScreen;
