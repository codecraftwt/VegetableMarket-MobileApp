import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const CartScreen = () => {
  const handleNotificationPress = () => {
    console.log('Cart notification pressed');
  };

  const handleBackPress = () => {
    console.log('Back pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Cart"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyCartContainer}>
          <Icon name="shopping-cart" size={80} color="#ccc" />
          <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Add some items to your cart to get started
          </Text>
          
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
        
        {/* Cart Items will be added here later */}
        <View style={styles.cartItemsContainer}>
          <Text style={styles.sectionTitle}>Cart Items</Text>
          <Text style={styles.noItemsText}>No items in cart yet</Text>
        </View>
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
  cartItemsContainer: {
    marginTop: p(40),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },
  noItemsText: {
    fontSize: fontSizes.base,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
});

export default CartScreen;
