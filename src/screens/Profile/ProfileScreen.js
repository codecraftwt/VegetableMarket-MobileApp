import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // User data (this would come from Redux/API)
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: require('../../assets/vegebg.png'),
  };

  const handleNotificationPress = () => {
    console.log('Profile notification pressed');
  };

  const handleEditPress = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image source={userData.avatar} style={styles.avatar} />
        <View style={styles.cameraIconOverlay}>
          <Icon name="camera" size={16} color="#fff" />
        </View>
      </View>
      <Text style={styles.userName}>{userData.name}</Text>
      <Text style={styles.userEmail}>{userData.email}</Text>
    </View>
  );

  const QuickActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <TouchableOpacity style={styles.actionItem} onPress={handleEditPress}>
        <View style={styles.actionIcon}>
          <Icon name="user" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Manage Profile</Text>
          <Text style={styles.actionSubtitle}>Edit personal information & address</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}>
          <Icon name="lock" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Change Password</Text>
          <Text style={styles.actionSubtitle}>Update your account password</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}>
          <Icon name="shopping-bag" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>My Orders</Text>
          <Text style={styles.actionSubtitle}>View your order history</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}>
          <Icon name="heart" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Favorites</Text>
          <Text style={styles.actionSubtitle}>Your saved items</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
        <View style={[styles.actionIcon, styles.logoutIcon]}>
          <Icon name="sign-out" size={20} color="#dc3545" />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, styles.logoutTitle]}>Logout</Text>
          <Text style={styles.actionSubtitle}>Sign out of your account</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Profile"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileHeader />
        <QuickActionsSection />
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
  
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: p(15),
  },
  avatar: {
    width: p(100),
    height: p(100),
    borderRadius: p(50),
    borderWidth: 3,
    borderColor: '#019a34',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#019a34',
    borderRadius: p(20),
    width: p(40),
    height: p(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(5),
    fontFamily: 'Montserrat-Bold',
  },
  userEmail: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(20),
    fontFamily: 'Montserrat-Bold',
  },
  
  // Action Items
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSizes.base,
    color: '#333',
    marginBottom: p(2),
    fontFamily: 'Poppins-SemiBold',
  },
  actionSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  logoutIcon: {
    backgroundColor: '#ffebee', // A light red background for destructive actions
  },
  logoutTitle: {
    color: '#dc3545', // Red color for destructive action
  },
});

export default ProfileScreen;

