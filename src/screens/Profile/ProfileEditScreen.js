import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const ProfileEditScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'address'
  
  // User data (this would come from Redux/API)
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    bio: 'I love fresh vegetables and healthy living!',
  });

  // Address data - now an array to support multiple addresses
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      addressLabel: 'Home',
      addressLine: '123 Main Street',
      city: 'Mumbai',
      taluka: 'Andheri',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400058',
      isDefault: true,
    }
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSaveProfile = () => {
    // Here you would save to API
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSaveAddress = (addressId) => {
    // Here you would save to API
    Alert.alert('Success', 'Address updated successfully!');
  };

  const addNewAddress = () => {
    const newAddress = {
      id: Date.now(), // Simple ID generation
      addressLabel: '',
      addressLine: '',
      city: '',
      taluka: '',
      district: '',
      state: '',
      country: '',
      pincode: '',
      isDefault: false,
    };
    setAddresses([...addresses, newAddress]);
  };

  const removeAddress = (addressId) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } else {
      Alert.alert('Error', 'You must have at least one address');
    }
  };

  const setDefaultAddress = (addressId) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const updateAddress = (addressId, field, value) => {
    setAddresses(addresses.map(addr => 
      addr.id === addressId ? { ...addr, [field]: value } : addr
    ));
  };

  const TabButton = ({ title, tab, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon name={icon} size={20} color={activeTab === tab ? '#fff' : '#019a34'} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const ProfileTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={userData.name}
            onChangeText={(text) => setUserData({...userData, name: text})}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={userData.email}
            onChangeText={(text) => setUserData({...userData, email: text})}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.textInput}
            value={userData.phone}
            onChangeText={(text) => setUserData({...userData, phone: text})}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={userData.bio}
            onChangeText={(text) => setUserData({...userData, bio: text})}
            placeholder="Tell us about yourself..."
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const AddressTab = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.tabContent}>
        <View style={styles.addressHeader}>
          <Text style={styles.sectionTitle}>Delivery Addresses</Text>
          <TouchableOpacity style={styles.addAddressButton} onPress={addNewAddress}>
            <Icon name="plus" size={12} color="#fff" />
            <Text style={styles.addAddressButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>
        
        {addresses.map((address, index) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressCardHeader}>
              <Text style={styles.addressTitle}>Address {index + 1}</Text>
              <View style={styles.addressActions}>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => setDefaultAddress(address.id)}
                  >
                    <Text style={styles.setDefaultButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                {addresses.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeAddress(address.id)}
                  >
                    <Icon name="trash" size={16} color="#dc3545" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Left Column */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Label</Text>
              <TextInput
                style={styles.textInput}
                value={address.addressLabel}
                onChangeText={(text) => updateAddress(address.id, 'addressLabel', text)}
                placeholder="Enter Address Label e.g. Home, Farm, etc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line</Text>
              <TextInput
                style={styles.textInput}
                value={address.addressLine}
                onChangeText={(text) => updateAddress(address.id, 'addressLine', text)}
                placeholder="Enter Address Line"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
                <Text style={styles.inputLabel}>City/Village</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.city}
                  onChangeText={(text) => updateAddress(address.id, 'city', text)}
                  placeholder="Enter City"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Taluka</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.taluka}
                  onChangeText={(text) => updateAddress(address.id, 'taluka', text)}
                  placeholder="Enter Taluka"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.district}
                  onChangeText={(text) => updateAddress(address.id, 'district', text)}
                  placeholder="Enter District"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.state}
                  onChangeText={(text) => updateAddress(address.id, 'state', text)}
                  placeholder="Enter State"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: p(10) }]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.country}
                  onChangeText={(text) => updateAddress(address.id, 'country', text)}
                  placeholder="Enter Country"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.textInput}
                  value={address.pincode}
                  onChangeText={(text) => updateAddress(address.id, 'pincode', text)}
                  placeholder="Enter Pincode"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => handleSaveAddress(address.id)}
            >
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Edit Profile"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton title="Profile" tab="profile" icon="user" />
        <TabButton title="Address" tab="address" icon="map-marker" />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {activeTab === 'profile' ? <ProfileTab /> : <AddressTab />}
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    paddingBottom: p(20),
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: p(20),
    marginTop: p(20),
    borderRadius: p(25),
    padding: p(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(20),
    gap: p(8),
  },
  activeTabButton: {
    backgroundColor: '#019a34',
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Tab Content
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginTop: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(25),
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  textInput: {
    fontSize: fontSizes.base,
    color: '#333',
    paddingVertical: p(15),
    paddingHorizontal: p(20),
    backgroundColor: '#f8f9fa',
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontFamily: 'Poppins-Regular',
  },
  bioInput: {
    height: p(100), // Adjust height for multiline text input
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(15),
    paddingHorizontal: p(30),
    borderRadius: p(25),
    alignItems: 'center',
    marginTop: p(20),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Address Specific Styles
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  addAddressButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(4),
    paddingHorizontal: p(10),
    borderRadius: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(15),
  },
  addressTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  addressActions: {
    flexDirection: 'row',
    gap: p(10),
  },
  defaultBadge: {
    backgroundColor: '#019a34',
    paddingVertical: p(5),
    paddingHorizontal: p(10),
    borderRadius: p(10),
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  setDefaultButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(5),
    paddingHorizontal: p(10),
    borderRadius: p(10),
  },
  setDefaultButtonText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  removeButton: {
    padding: p(5),
  },
});

export default ProfileEditScreen;
