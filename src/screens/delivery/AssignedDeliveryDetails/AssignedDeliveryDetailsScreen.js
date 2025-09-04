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
import { updateOrderStatus, updateAssignmentStatus, updatePaymentStatus } from '../../../redux/slices/todaysTaskSlice';
import ErrorModal from '../../../components/ErrorModal';
import SuccessModal from '../../../components/SuccessModal';

const AssignedDeliveryDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { assignedDeliveryDetails, loadingAssignedDetails, error } = useSelector(state => state.delivery);
  const { loading: updateOrderStatusLoading, error: updateOrderStatusError, success: updateOrderStatusSuccess, message: updateOrderStatusMessage } = useSelector(state => state.todaysTask);
  const { orderId } = route.params;
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        dispatch(fetchAssignedDeliveryDetails(orderId));
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
    if (updateOrderStatusError) {
      setShowErrorModal(true);
    }
  }, [updateOrderStatusError]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleStartDelivery = () => {
    if (assignedDeliveryDetails?.order?.id) {
      dispatch(updateOrderStatus({ orderId: assignedDeliveryDetails.order.id, status: 'out_for_delivery' }));
    }
  };

  const handleMarkComplete = () => {
    if (assignedDeliveryDetails?.order?.id) {
      dispatch(updateOrderStatus({ orderId: assignedDeliveryDetails.order.id, status: 'delivered' }));
    }
  };

  const handleUpdateAssignmentStatus = (assignmentId, status) => {
    dispatch(updateAssignmentStatus({ assignmentId, status }));
  };

  const handleUpdatePaymentStatus = (orderId, paymentStatus) => {
    dispatch(updatePaymentStatus({ orderId, paymentStatus }));
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

  const renderOrderInfo = () => {
    if (!assignedDeliveryDetails?.order) return null;
    
    const { order } = assignedDeliveryDetails;
    
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
            <Text style={styles.infoValue}>{assignedDeliveryDetails.order.customer_address}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUPIQR = () => {
    if (!assignedDeliveryDetails?.order?.upi_qr_url) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment QR Code</Text>
        <View style={styles.infoCard}>
          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: assignedDeliveryDetails.order.upi_qr_url }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrText}>Scan QR code for payment</Text>
          </View>
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
    if (!assignedDeliveryDetails?.order) return null;
    
    const { order } = assignedDeliveryDetails;
    
    return (
      <View style={styles.section}>
        <View style={styles.actionButtonsContainer}>
          {order.delivery_status === 'ready_for_delivery' && (
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
        message={error || updateOrderStatusError || "Failed to load delivery details. Please try again."}
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
    padding: p(16),
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(12),
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(12),
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginLeft: p(8),
    minWidth: p(80),
  },
  infoValue: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  phoneNumber: {
    color: '#019a34',
    textDecorationLine: 'underline',
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  statusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(16),
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: p(20),
  },
  qrImage: {
    width: p(200),
    height: p(200),
    marginBottom: p(12),
  },
  qrText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  farmerCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  farmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  farmerPhone: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#019a34',
    textDecorationLine: 'underline',
    marginTop: p(4),
  },
  itemCount: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(16),
  },
  itemCountText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  farmerAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(12),
  },
  addressText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: p(8),
    flex: 1,
  },
  farmerItems: {
    gap: p(8),
  },
  farmerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(6),
  },
  farmerItemName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  farmerItemQty: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginRight: p(8),
  },
  farmerItemStatus: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  farmerItemStatusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  actionButtonsContainer: {
    gap: p(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: p(20),
    paddingVertical: p(14),
    borderRadius: p(12),
    gap: p(8),
  },
  startButton: {
    backgroundColor: '#019a34',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    gap: p(8),
  },
});

export default AssignedDeliveryDetailsScreen;
