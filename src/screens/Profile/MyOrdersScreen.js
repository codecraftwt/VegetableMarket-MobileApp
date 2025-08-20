import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const MyOrdersScreen = ({ navigation }) => {

  // Sample order data (this would come from Redux/API)
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      date: '2 minutes ago',
      finalTotal: 45.00,
      paymentStatus: 'Pending',
      paymentStatusColor: '#FF9800',
      deliveryStatus: 'Processing',
      deliveryStatusColor: '#2196F3',
      deliveryAddress: 'House 10, Road 5, Block J, Baridhara, Dhaka, 1212',
      items: [
        {
          id: 1,
          name: 'Fresh Tomatoes',
          quantity: '2 KG',
          unitPrice: 22.50,
          farmer: 'Organic Farm Co.',
          totalPrice: 45.00,
          status: 'Processing',
          image: require('../../assets/vegebg.png')
        }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      date: '1 hour ago',
      finalTotal: 120.00,
      paymentStatus: 'Paid',
      paymentStatusColor: '#4CAF50',
      deliveryStatus: 'Out for Delivery',
      deliveryStatusColor: '#FF9800',
      deliveryAddress: 'Apartment B3, House 25, Road 10, Banani Dhaka, 1213',
      items: [
        {
          id: 1,
          name: 'Organic Carrots',
          quantity: '3 KG',
          unitPrice: 40.00,
          farmer: 'Green Valley Farm',
          totalPrice: 120.00,
          status: 'Out for Delivery',
          image: require('../../assets/vegebg.png')
        }
      ]
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      date: '3 hours ago',
      finalTotal: 89.99,
      paymentStatus: 'Paid',
      paymentStatusColor: '#4CAF50',
      deliveryStatus: 'Delivered',
      deliveryStatusColor: '#6C757D',
      deliveryAddress: 'House 15, Road 8, Block K, Gulshan, Dhaka, 1212',
      items: [
        {
          id: 1,
          name: 'Fresh Onions',
          quantity: '2 KG',
          unitPrice: 25.00,
          farmer: 'Fresh Harvest',
          totalPrice: 50.00,
          image: require('../../assets/vegebg.png')
        },
        {
          id: 2,
          name: 'Green Bell Peppers',
          quantity: '1 KG',
          unitPrice: 39.99,
          farmer: 'Organic Garden',
          totalPrice: 39.99,
          image: require('../../assets/vegebg.png')
        }
      ]
    }
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCancelOrder = (order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`,
      [
        {
          text: 'No, Keep Order',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: () => {
            // Here you would typically make an API call to cancel the order
            console.log('Order cancelled:', order.orderNumber);
            // You could also update the local state to reflect the cancellation
          },
        },
      ]
    );
  };



  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'processing':
        return 'clock-o';
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
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.totalAmount}>${order.finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusItem}>
            <Icon name="credit-card" size={14} color={order.paymentStatusColor} />
            <Text style={styles.statusText}>{order.paymentStatus}</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon name={getStatusIcon(order.deliveryStatus)} size={14} color={order.deliveryStatusColor} />
            <Text style={styles.statusText}>{order.deliveryStatus}</Text>
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
        {order.deliveryStatus !== 'Delivered' && order.deliveryStatus !== 'Cancelled' && (
          <View style={styles.cancelSection}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(order)}
              activeOpacity={0.8}
            >
              <Icon name="times-circle" size={14} color="#dc3545" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
              <OrderCard key={order.id} order={order} />
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
});

export default MyOrdersScreen;
