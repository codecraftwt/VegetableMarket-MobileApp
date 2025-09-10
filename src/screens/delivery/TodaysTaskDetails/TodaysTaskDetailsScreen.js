import React, { useState } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { updateTaskStatus, updatePaymentStatus } from '../../../redux/slices/todaysTaskSlice';

const TodaysTaskDetailsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { taskData } = route.params;
  const { loading: updatePaymentStatusLoading } = useSelector(state => state.todaysTask);
  
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallFarmer = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleStatusChange = (taskId, newStatus) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to mark this delivery as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(updateTaskStatus({ taskId, status: newStatus }));
            // Navigate back after status update
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handlePaymentStatusChange = (orderId, paymentStatus) => {
    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to mark payment as ${paymentStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(updatePaymentStatus({ orderId, paymentStatus }));
            // Navigate back after payment status update
            navigation.goBack();
          },
        },
      ]
    );
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
    if (!taskData) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="hashtag" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>#{taskData.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Order Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(taskData.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="credit-card" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Payment:</Text>
            <Text style={styles.infoValue}>
              {taskData.payment_method} ({taskData.payment_status})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="truck" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(taskData.delivery_status) }]}>
              <Text style={styles.statusText}>{getStatusText(taskData.delivery_status)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="rupee" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={[styles.infoValue, styles.totalAmount]}>₹{taskData.total_amount}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCustomerInfo = () => {
    if (!taskData?.delivery_address) return null;
    
    const address = `${taskData.delivery_address.address_line}, ${taskData.delivery_address.city}, ${taskData.delivery_address.state} - ${taskData.delivery_address.pincode}`;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={p(16)} color="#019a34" />
            <Text style={styles.infoValue}>{address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="building" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>District:</Text>
            <Text style={styles.infoValue}>{taskData.delivery_address.district}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="globe" size={p(16)} color="#019a34" />
            <Text style={styles.infoLabel}>Country:</Text>
            <Text style={styles.infoValue}>{taskData.delivery_address.country}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUPIQR = () => {
    if (!taskData?.upi_qr_url) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment QR Code</Text>
        <View style={styles.infoCard}>
          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: taskData.upi_qr_url }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrText}>Scan QR code for payment</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderItems = () => {
    if (!taskData?.order_items) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.infoCard}>
          {taskData.order_items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.vegetable.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity_kg}kg × ₹{item.price_per_kg} = ₹{item.subtotal}
                </Text>
                <Text style={styles.itemDescription}>{item.vegetable.description}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemMetaText}>Grade: {item.vegetable.grade}</Text>
                  <Text style={styles.itemMetaText}>Organic: {item.vegetable.is_organic ? 'Yes' : 'No'}</Text>
                </View>
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

  const renderFarmerInfo = () => {
    if (!taskData?.uniqueFarmers || taskData.uniqueFarmers.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farmer Information</Text>
        {taskData.uniqueFarmers.map((farmer, index) => (
          <View key={index} style={styles.farmerCard}>
            <View style={styles.farmerHeader}>
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>{farmer.name}</Text>
                <TouchableOpacity onPress={() => handleCallFarmer(farmer.phone)}>
                  <Text style={[styles.farmerPhone, styles.phoneNumber]}>{farmer.phone}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.farmerBadge}>
                <Icon name="user" size={p(16)} color="#019a34" />
              </View>
            </View>
            <View style={styles.farmerDetails}>
              <View style={styles.farmerDetailRow}>
                <Icon name="envelope" size={p(14)} color="#666" />
                <Text style={styles.farmerDetailText}>{farmer.email}</Text>
              </View>
              <View style={styles.farmerDetailRow}>
                <Icon name="calendar" size={p(14)} color="#666" />
                <Text style={styles.farmerDetailText}>
                  Joined: {new Date(farmer.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!taskData) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.actionButtonsContainer}>
          {taskData.delivery_status === 'ready_for_delivery' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusChange(taskData.id, 'in_progress')}
            >
              <Icon name="play" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          )}
          
          {taskData.delivery_status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange(taskData.id, 'delivered')}
            >
              <Icon name="check" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}

          {taskData.delivery_status === 'delivered' && (
            <View style={styles.completedIndicator}>
              <Icon name="check-circle" size={p(20)} color="#28a745" />
              <Text style={styles.completedText}>Delivery Completed</Text>
            </View>
          )}

          {taskData.payment_status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton, updatePaymentStatusLoading && styles.disabledButton]}
              onPress={() => handlePaymentStatusChange(taskData.id, 'paid')}
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
        </View>
      </View>
    );
  };

  if (!taskData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Task Details"
          showBackButton={true}
          onBackPress={handleBackPress}
          navigation={navigation}
        />
        <View style={styles.emptyContainer}>
          <Icon name="exclamation-triangle" size={p(60)} color="#ccc" />
          <Text style={styles.emptyText}>No task data found</Text>
          <Text style={styles.emptySubtext}>Unable to load task information</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Task Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderInfo()}
        {renderCustomerInfo()}
        {renderUPIQR()}
        {renderOrderItems()}
        {renderFarmerInfo()}
        {renderActionButtons()}
      </ScrollView>
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
  qrContainer: {
    alignItems: 'center',
    paddingVertical: p(16),
  },
  qrImage: {
    width: p(160),
    height: p(160),
    marginBottom: p(8),
  },
  qrText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: p(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: p(8),
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
    marginBottom: p(2),
  },
  itemDescription: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginBottom: p(6),
    fontStyle: 'italic',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: p(8),
  },
  itemMetaText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#019a34',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: p(6),
    paddingVertical: p(2),
    borderRadius: p(6),
  },
  itemStatus: {
    paddingHorizontal: p(6),
    paddingVertical: p(2),
    borderRadius: p(8),
    alignSelf: 'flex-start',
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
  farmerName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  farmerPhone: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#019a34',
    textDecorationLine: 'underline',
  },
  farmerBadge: {
    backgroundColor: '#f0f8f0',
    padding: p(6),
    borderRadius: p(16),
  },
  farmerDetails: {
    gap: p(6),
  },
  farmerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerDetailText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: p(6),
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
});

export default TodaysTaskDetailsScreen;
