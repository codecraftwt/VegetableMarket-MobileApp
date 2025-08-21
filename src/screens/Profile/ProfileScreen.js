import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import { CustomModal, SuccessModal, ErrorModal, ConfirmationModal } from '../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { fetchProfile, setProfileImage, updateProfile } from '../../redux/slices/profileSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const { user, address, profile, loading, error } = profileState;
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Debug logging
  console.log('ProfileScreen - Redux State:', profileState);
  console.log('ProfileScreen - Error:', profileState.error);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleNotificationPress = () => {
    console.log('Profile notification pressed');
  };

  const handleEditPress = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleChangePasswordPress = () => {
    navigation.navigate('ChangePassword');
  };

  const handleMyOrdersPress = () => {
    navigation.navigate('MyOrders');
  };

  const handleFavoritesPress = () => {
    navigation.navigate('Cart');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const requestCameraPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'This app needs access to your camera to take profile photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestStoragePermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage to select photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleCameraPress = () => {
    console.log('Camera button pressed!');
    setShowPhotoModal(true);
  };

  const handleModalClose = () => {
    setShowPhotoModal(false);
  };

  const handleCameraOption = () => {
    console.log('Camera option selected');
    setShowPhotoModal(false);
    openCamera();
  };

  const handleGalleryOption = () => {
    console.log('Gallery option selected');
    setShowPhotoModal(false);
    openGallery();
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('profile_picture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile_picture.jpg'
      });

      // Add other required fields with current values
      if (user?.name) formData.append('name', user.name);
      if (user?.phone) formData.append('phone', user.phone);
      if (profile?.bio) formData.append('bio', profile.bio);
      
      // Add address fields if they exist
      if (address) {
        if (address.address_label) formData.append('address_label', address.address_label);
        if (address.address_line) formData.append('address_line', address.address_line);
        if (address.city) formData.append('city', address.city);
        if (address.taluka) formData.append('taluka', address.taluka);
        if (address.district) formData.append('district', address.district);
        if (address.state) formData.append('state', address.state);
        if (address.country) formData.append('country', address.country);
        if (address.pincode) formData.append('pincode', address.pincode);
      }

      await dispatch(updateProfile(formData)).unwrap();
      
      // Refresh profile data to get the new image
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Profile picture updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Upload error:', error);
      // Show error modal
      setErrorMessage('Failed to upload profile picture. Please try again.');
      setShowErrorModal(true);
    }
  };

  const openCamera = async () => {
    console.log('Opening camera...');

    // Check if launchCamera is available
    if (!launchCamera) {
      console.error('launchCamera is not available');
      setErrorMessage('Camera functionality is not available. Please restart the app.');
      setShowErrorModal(true);
      return;
    }

    // Check permissions first
    if (Platform.OS === 'android') {
      const hasCameraPermission = await requestCameraPermissionAndroid();
      if (!hasCameraPermission) {
        setErrorMessage('Camera permission is required to take photos.');
        setShowErrorModal(true);
        return;
      }
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      saveToPhotos: false,
      cameraType: 'front',
      maxWidth: 800,
      maxHeight: 800,
    };

    try {
      const response = await launchCamera(options);
      console.log('Camera response:', response);

      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera error:', response.errorMessage);
        setErrorMessage('Failed to open camera. Please try again.');
        setShowErrorModal(true);
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          await uploadProfilePicture(imageUri);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage('Failed to open camera. Please try again.');
      setShowErrorModal(true);
    }
  };

  const openGallery = async () => {
    console.log('Opening gallery...');

    // Check if launchImageLibrary is available
    if (!launchImageLibrary) {
      console.error('launchImageLibrary is not available');
      setErrorMessage('Gallery functionality is not available. Please restart the app.');
      setShowErrorModal(true);
      return;
    }

    // Check permissions first
    if (Platform.OS === 'android') {
      const hasStoragePermission = await requestStoragePermissionAndroid();
      if (!hasStoragePermission) {
        setErrorMessage('Storage permission is required to select photos.');
        setShowErrorModal(true);
        return;
      }
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      selectionLimit: 1,
      maxWidth: 800,
      maxHeight: 800,
    };

    try {
      const response = await launchImageLibrary(options);
      console.log('Gallery response:', response);

      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.errorCode) {
        console.log('Gallery error:', response.errorMessage);
        setErrorMessage('Failed to open gallery. Please try again.');
        setShowErrorModal(true);
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          await uploadProfilePicture(imageUri);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      setErrorMessage('Failed to open gallery. Please try again.');
      setShowErrorModal(true);
    }
  };

  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatar} onPress={handleCameraPress}>
          {profile?.profile_picture ? (
            <Image 
              source={{ uri: `https://vegetables.walstarmedia.com/storage/${profile.profile_picture}` }} 
              style={styles.profileImage} 
            />
          ) : (
            <Icon name="user" size={40} color="#019a34" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cameraIconOverlay}
          onPress={handleCameraPress}
        >
          <Icon name="camera" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
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
          <Text style={styles.actionSubtitle}>
            Edit personal information & address
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={handleChangePasswordPress}
      >
        <View style={styles.actionIcon}>
          <Icon name="lock" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Change Password</Text>
          <Text style={styles.actionSubtitle}>
            Update your account password
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={handleMyOrdersPress}>
        <View style={styles.actionIcon}>
          <Icon name="shopping-bag" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>My Orders</Text>
          <Text style={styles.actionSubtitle}>View your order history</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={handleFavoritesPress}
      >
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : profileState.error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ProfileHeader />
          <QuickActionsSection />
        </ScrollView>
      )}

      <CustomModal
        visible={showPhotoModal}
        onClose={handleModalClose}
        onCameraPress={handleCameraOption}
        onGalleryPress={handleGalleryOption}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        type="warning"
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
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: p(50),
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
  },
  loadingText: {
    marginTop: p(10),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
    padding: p(20),
  },
  errorText: {
    marginTop: p(10),
    fontSize: fontSizes.base,
    color: '#dc3545',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: p(20),
    backgroundColor: '#019a34',
    paddingVertical: p(10),
    paddingHorizontal: p(20),
    borderRadius: p(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ProfileScreen;
