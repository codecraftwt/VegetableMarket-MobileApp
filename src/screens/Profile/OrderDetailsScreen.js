import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const OrderDetailsScreen = ({ navigation, route }) => {
  const { order } = route.params;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCancelOrder = () => {
    // Show confirmation dialog
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
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
            // Navigate back to orders screen
            navigation.goBack();
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'out for delivery':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      case 'paid':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
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
      >
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{order.finalTotal.toFixed(2)}</Text>
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
                <Text style={styles.statusTime}>{order.date}</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(order.paymentStatus) + '20' }
              ]}>
                <Icon name="credit-card" size={20} color={getStatusColor(order.paymentStatus)} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Payment {order.paymentStatus}</Text>
                <Text style={styles.statusTime}>{order.date}</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[
                styles.statusIconContainer,
                { backgroundColor: getStatusColor(order.deliveryStatus) + '20' }
              ]}>
                <Icon name={getStatusIcon(order.deliveryStatus)} size={20} color={getStatusColor(order.deliveryStatus)} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>{order.deliveryStatus}</Text>
                <Text style={styles.statusTime}>{order.date}</Text>
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
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {order.items.map((item, index) => (
            <View key={item.id} style={[
              styles.itemCard,
              index === order.items.length - 1 && styles.lastItem
            ]}>
              <View style={styles.itemLeft}>
                <View style={styles.itemImageContainer}>
                  <Icon name="image" size={24} color="#ccc" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemFarmer}>Farmer: {item.farmer}</Text>
                  <Text style={styles.itemUnitPrice}>Unit Price: ₹{item.unitPrice.toFixed(2)}</Text>
                </View>
              </View>
              
              <View style={styles.itemRight}>
                <Text style={styles.itemTotalPrice}>₹{item.totalPrice.toFixed(2)}</Text>
                <View style={[
                  styles.itemStatusBadge,
                  { backgroundColor: getStatusColor(order.deliveryStatus) + '20' }
                ]}>
                  <Text style={[
                    styles.itemStatusText,
                    { color: getStatusColor(order.deliveryStatus) }
                  ]}>
                    {item.status || order.deliveryStatus}
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
            <Text style={styles.priceValue}>₹{order.finalTotal.toFixed(2)}</Text>
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
            <Text style={styles.totalPriceValue}>₹{order.finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="phone" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Icon name="download" size={16} color="#019a34" />
            <Text style={styles.secondaryButtonText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Order Button - Only show for cancellable orders */}
        {order.deliveryStatus !== 'Delivered' && order.deliveryStatus !== 'Cancelled' && (
          <TouchableOpacity 
            style={styles.cancelOrderButton}
            onPress={handleCancelOrder}
          >
            <Icon name="times-circle" size={16} color="#fff" />
            <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
          </TouchableOpacity>
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
    paddingVertical: p(15),
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
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#019a34',
  },
  secondaryButtonText: {
    color: '#019a34',
    fontSize: fontSizes.base,
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
});

export default OrderDetailsScreen;
