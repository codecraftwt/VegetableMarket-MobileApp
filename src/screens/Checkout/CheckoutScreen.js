import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  Image
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const CheckoutScreen = ({ navigation, route }) => {
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('mastercard');

  const totalPrice = route.params?.totalPrice || 7.69;

  const handleNotificationPress = () => {
    console.log('Checkout notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  const handleAddNewAddress = () => {
    console.log('Add new address pressed');
    // Add new address logic here
  };

  const handleAddNewPayment = () => {
    console.log('Add new payment method pressed');
    // Add new payment method logic here
  };

  const handleEditAddress = (addressId) => {
    console.log('Edit address:', addressId);
    // Edit address logic here
  };

  const handlePayment = () => {
    console.log('Processing payment...');
    // Payment processing logic here
  };

  // Address Data
  const addresses = [
    {
      id: 'home',
      name: 'Home',
      address: 'House 10, Road 5, Block J, Baridhara, Dhaka, 1212',
      isSelected: selectedAddress === 'home',
    },
    {
      id: 'office',
      name: 'Office',
      address: 'Apartment B3, House 25, Road 10, Banani Dhaka, 1213',
      isSelected: selectedAddress === 'office',
    },
  ];

  // Payment Methods Data
  const paymentMethods = [
    {
      id: 'mastercard',
      name: 'Mastercard',
      cardNumber: '**** **** 8940',
      logo: 'credit-card',
      isSelected: selectedPayment === 'mastercard',
      type: 'mastercard',
    },
    {
      id: 'visacard',
      name: 'Visacard',
      cardNumber: '**** **** 7206',
      logo: 'credit-card',
      isSelected: selectedPayment === 'visacard',
      type: 'visa',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      cardNumber: 'Pay when you receive',
      logo: 'money',
      isSelected: selectedPayment === 'cod',
      type: 'cod',
    },
  ];

  // Address Card Component
  const AddressCard = ({ address }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        address.isSelected && styles.selectedAddressCard
      ]}
      onPress={() => handleAddressSelect(address.id)}
    >
      <View style={styles.addressLeft}>
        <View style={[
          styles.addressRadio,
          address.isSelected && styles.selectedAddressRadio
        ]}>
          {address.isSelected && (
            <Icon name="check" size={12} color="#fff" />
          )}
        </View>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{address.name}</Text>
          <Text style={styles.addressText}>{address.address}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditAddress(address.id)}
      >
        <Icon name="pencil" size={16} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Payment Method Card Component
  const PaymentMethodCard = ({ method }) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        method.isSelected && styles.selectedPaymentCard
      ]}
      onPress={() => handlePaymentSelect(method.id)}
    >
      <View style={styles.paymentCardHeader}>
        {method.type === 'mastercard' && (
          <View style={styles.mastercardLogo}>
            <View style={styles.mastercardCircle1} />
            <View style={styles.mastercardCircle2} />
            <Text style={styles.mastercardText}>MasterCard</Text>
          </View>
        )}
        {method.type === 'visa' && (
          <View style={styles.visaLogo}>
            <View style={styles.visaRectangle}>
              <Text style={styles.visaText}>VISA</Text>
              <View style={styles.visaStripe} />
            </View>
          </View>
        )}
        {method.type === 'cod' && (
          <View style={styles.codLogo}>
            <Icon name="money" size={24} color="#019a34" />
            <Text style={styles.codText}>COD</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.paymentMethodName}>{method.name}</Text>
      <Text style={styles.paymentCardNumber}>{method.cardNumber}</Text>
      
      <View style={[
        styles.paymentRadio,
        method.isSelected && styles.selectedPaymentRadio
      ]}>
        {method.isSelected && (
          <Icon name="check" size={12} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Checkout"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Address</Text>
            <TouchableOpacity onPress={handleAddNewAddress}>
              <Text style={styles.addNewButton}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <TouchableOpacity onPress={handleAddNewPayment}>
              <Text style={styles.addNewButton}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paymentMethodsContainer}
          >
            {paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
          <Text style={styles.paymentButtonText}>Payment</Text>
        </TouchableOpacity>
      </View>
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

  // Section Styles
  section: {
    marginTop: p(10),
    marginBottom: p(30),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(15),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  addNewButton: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },

  // Address Card Styles
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedAddressCard: {
    borderWidth: 2,
    borderColor: '#019a34',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressRadio: {
    width: p(24),
    height: p(24),
    borderRadius: p(12),
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
    backgroundColor: '#fff',
  },
  selectedAddressRadio: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(5),
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(18),
  },
  editButton: {
    padding: p(8),
  },

  // Payment Method Card Styles
  paymentMethodsContainer: {
    paddingRight: p(20),
    marginVertical: p(10),
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginRight: p(15),
    width: p(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPaymentCard: {
    backgroundColor: '#f0f8f0',
    borderWidth: 2,
    borderColor: '#019a34',
  },
  paymentCardHeader: {
    marginBottom: p(15),
  },
  
  // Mastercard Logo
  mastercardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mastercardCircle1: {
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    backgroundColor: '#FF6B35',
    marginRight: p(-8),
  },
  mastercardCircle2: {
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    backgroundColor: '#F7931E',
  },
  mastercardText: {
    fontSize: fontSizes.sm,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginLeft: p(10),
  },
  
  // Visa Logo
  visaLogo: {
    alignItems: 'center',
  },
  visaRectangle: {
    backgroundColor: '#1A1F71',
    paddingHorizontal: p(15),
    paddingVertical: p(8),
    borderRadius: p(8),
    alignItems: 'center',
  },
  visaText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    marginBottom: p(3),
  },
  visaStripe: {
    width: '100%',
    height: p(3),
    backgroundColor: '#F7931E',
    borderRadius: p(2),
  },
  
  // COD Logo
  codLogo: {
    alignItems: 'center',
  },
  codText: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginTop: p(5),
  },

  paymentMethodName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(8),
  },
  paymentCardNumber: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(15),
  },
  paymentRadio: {
    width: p(24),
    height: p(24),
    borderRadius: p(12),
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  selectedPaymentRadio: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
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
  paymentButton: {
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
  paymentButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default CheckoutScreen;
