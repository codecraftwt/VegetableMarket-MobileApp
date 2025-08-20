import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Orange',
      category: 'Fruits',
      price: 2.99,
      unit: 'KG',
      quantity: 1,
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 2,
      name: 'Cauli Flower',
      category: 'Veggies',
      price: 1.20,
      unit: 'KG',
      quantity: 1,
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 3,
      name: 'Kiwi',
      category: 'Fruits',
      price: 1.50,
      unit: 'KG',
      quantity: 1,
      image: require('../../assets/vegebg.png'),
    },
  ]);

  const [promoCode, setPromoCode] = useState('');

  const handleNotificationPress = () => {
    console.log('Cart notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleQuantityChange = (itemId, change) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleApplyPromo = () => {
    console.log('Applying promo code:', promoCode);
    // Add promo code logic here
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    navigation.navigate('Checkout', { totalPrice: finalTotal });
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharges = 2.00;
  const discount = 0.00;
  const finalTotal = subtotal + deliveryCharges - discount;

  // Cart Item Component
  const CartItem = ({ item }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.itemLeft}>
        <Image source={item.image} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}/{item.unit}</Text>
        </View>
      </View>
      
      <View style={styles.itemRight}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => handleQuantityChange(item.id, -1)}
          >
            <Icon name="minus" size={16} color="#666" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity} {item.unit}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => handleQuantityChange(item.id, 1)}
          >
            <Icon name="plus" size={16} color="#019a34" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Icon name="trash" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty Cart View
  const EmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Icon name="shopping-cart" size={80} color="#ccc" />
      <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyCartSubtitle}>
        Add some items to your cart to get started
      </Text>
      
      <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('Bucket')}>
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Cart with Items View
  const CartWithItems = () => (
    <>
      {/* Cart Items */}
      <View style={styles.cartItemsSection}>
        <Text style={styles.sectionTitle}>Cart Items</Text>
        {cartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </View>

      {/* Promo Code Section */}
      {/* <View style={styles.promoSection}>
        <Text style={styles.sectionTitle}>Promo Code</Text>
        <View style={styles.promoInputContainer}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter Promo Code"
            placeholderTextColor="#999"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Price Breakdown */}
      <View style={styles.priceBreakdownSection}>
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Sub Total</Text>
          <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={styles.priceValue}>${deliveryCharges.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Discount</Text>
          <Text style={styles.priceValue}>${discount.toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.finalTotalRow]}>
          <Text style={styles.finalTotalLabel}>Final Total</Text>
          <Text style={styles.finalTotalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Cart"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? <EmptyCart /> : <CartWithItems />}
      </ScrollView>

      {/* Bottom Checkout Bar */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>${finalTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
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

  // Empty Cart Styles
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyCartTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginTop: p(20),
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  emptyCartSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    marginBottom: p(30),
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(30),
    paddingVertical: p(15),
    borderRadius: p(25),
  },
  shopNowText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Section Styles
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },

  // Cart Items Section
  cartItemsSection: {
    marginBottom: p(25),
    marginTop: p(10),
  },

  // Cart Item Card
  cartItemCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    marginRight: p(15),
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(3),
  },
  itemCategory: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  itemPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  itemRight: {
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(25),
    paddingHorizontal: p(5),
    marginBottom: p(10),
  },
  quantityButton: {
    width: p(35),
    height: p(35),
    borderRadius: p(17.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    fontSize: fontSizes.sm,
    color: '#333',
    marginHorizontal: p(12),
    fontFamily: 'Poppins-SemiBold',
  },
  removeButton: {
    padding: p(8),
  },

  // Promo Code Section
  promoSection: {
    marginBottom: p(25),
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(15),
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: p(15),
    paddingHorizontal: p(20),
    paddingVertical: p(15),
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  applyButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(25),
    paddingVertical: p(15),
    borderRadius: p(15),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Price Breakdown Section
  priceBreakdownSection: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(25),
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
    marginBottom: p(12),
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
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: p(12),
    marginTop: p(8),
  },
  finalTotalLabel: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  finalTotalValue: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(20),
    paddingVertical: p(15),
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(5),
    fontFamily: 'Poppins-Regular',
  },
  totalPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  checkoutButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(30),
    paddingVertical: p(10),
    borderRadius: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default CartScreen;
