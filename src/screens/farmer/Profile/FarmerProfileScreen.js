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
} from 'react-native';
import { SkeletonLoader } from '../../../components';
import CommonHeader from '../../../components/CommonHeader';
import { CustomModal, SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';
import { fetchProfile, setProfileImage, updateProfile } from '../../../redux/slices/profileSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const FarmerProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const profileState = useSelector(state => state.profile);
  const { address, profile, loading, error } = profileState;
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
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
      console.log('Requesting camera permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take profile photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('Camera permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Camera permission error:', err);
      return false;
    }
  };

  const requestStoragePermissionAndroid = async () => {
    try {
      console.log('Requesting storage permission...');
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
      console.log('Storage permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Storage permission error:', err);
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
      setIsProcessingImage(true);
      console.log('Starting profile picture upload for URI:', imageUri);
      
      // Validate image URI
      if (!imageUri) {
        throw new Error('Invalid image URI');
      }
      
      // Validate image URI format
      if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://') && !imageUri.startsWith('http')) {
        throw new Error('Invalid image URI format');
      }

      // Create data object for profile update
      const updateData = {
        profile_picture: {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile_picture.jpg'
        }
      };

      // Add other required fields with current values
      if (user?.name) updateData.name = user.name;
      if (user?.phone) updateData.phone = user.phone;
      if (profile?.bio) updateData.bio = profile.bio;
      
      // Add address fields if they exist
      if (address) {
        if (address.address_label) updateData.address_label = address.address_label;
        if (address.address_line) updateData.address_line = address.address_line;
        if (address.city) updateData.city = address.city;
        if (address.taluka) updateData.taluka = address.taluka;
        if (address.district) updateData.district = address.district;
        if (address.state) updateData.state = address.state;
        if (address.country) updateData.country = address.country;
        if (address.pincode) updateData.pincode = address.pincode;
      }

      console.log('Update data prepared, dispatching updateProfile...');
      const result = await dispatch(updateProfile(updateData)).unwrap();
      console.log('Update profile result:', result);
      
      console.log('Profile picture updated successfully, refreshing profile...');
      // Refresh profile data to get the new image
      dispatch(fetchProfile());
      
      // Show success modal
      setSuccessMessage('Profile picture updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Upload error:', error);
      // Show error modal with more specific error message
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const openCamera = async () => {
    console.log('Opening camera...');

    try {
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
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      console.log('Launching camera with options:', options);
      const response = await launchCamera(options);
      console.log('Camera response:', response);

      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorCode) {
        console.log('Camera error:', response.errorMessage);
        setErrorMessage(`Camera error: ${response.errorMessage}`);
        setShowErrorModal(true);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log('Camera asset:', asset);
        
        if (asset.uri) {
          console.log('Processing image URI:', asset.uri);
          await uploadProfilePicture(asset.uri);
        } else {
          console.error('No URI in camera response');
          setErrorMessage('Failed to capture image. Please try again.');
          setShowErrorModal(true);
        }
      } else {
        console.error('No assets in camera response');
        setErrorMessage('No image captured. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setErrorMessage(`Camera error: ${error.message || 'Unknown error'}`);
      setShowErrorModal(true);
    }
  };

  const openGallery = async () => {
    console.log('Opening gallery...');

    try {
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
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      console.log('Launching gallery with options:', options);
      const response = await launchImageLibrary(options);
      console.log('Gallery response:', response);

      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (response.errorCode) {
        console.log('Gallery error:', response.errorMessage);
        setErrorMessage(`Gallery error: ${response.errorMessage}`);
        setShowErrorModal(true);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log('Gallery asset:', asset);
        
        if (asset.uri) {
          console.log('Processing image URI:', asset.uri);
          await uploadProfilePicture(asset.uri);
        } else {
          console.error('No URI in gallery response');
          setErrorMessage('Failed to select image. Please try again.');
          setShowErrorModal(true);
        }
      } else {
        console.error('No assets in gallery response');
        setErrorMessage('No image selected. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      setErrorMessage(`Gallery error: ${error.message || 'Unknown error'}`);
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
          style={[styles.cameraIconOverlay, isProcessingImage && styles.cameraIconDisabled]}
          onPress={handleCameraPress}
          disabled={isProcessingImage}
        >
          {isProcessingImage ? (
            <SkeletonLoader type="category" width={16} height={16} borderRadius={8} />
          ) : (
            <Icon name="camera" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
    </View>
  );

  const QuickActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ProfileEdit')}>
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

      <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChangePassword')}>
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

      <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyFarms')}>
        <View style={styles.actionIcon}>
          <Icon name="leaf" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>My Farms</Text>
          <Text style={styles.actionSubtitle}>Manage your farm locations</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SalesReport')}>
        <View style={styles.actionIcon}>
          <Icon name="bar-chart" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Sales Report</Text>
          <Text style={styles.actionSubtitle}>View your sales analytics</Text>
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
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        <View style={styles.content}>
          {/* Skeleton loader for profile header */}
          <View style={styles.skeletonProfileHeader}>
            <View style={styles.skeletonAvatarContainer}>
              <SkeletonLoader type="category" width={p(100)} height={p(100)} borderRadius={p(50)} />
              <View style={styles.skeletonCameraIcon}>
                <SkeletonLoader type="category" width={p(40)} height={p(40)} borderRadius={p(20)} />
              </View>
            </View>
            <SkeletonLoader type="text" width="60%" height={p(24)} style={styles.skeletonUserName} />
            <SkeletonLoader type="text" width="40%" height={p(16)} style={styles.skeletonUserEmail} />
          </View>

          {/* Skeleton loader for quick actions */}
          <View style={styles.skeletonSection}>
            <SkeletonLoader type="text" width="40%" height={p(20)} style={styles.skeletonSectionTitle} />
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.skeletonActionItem}>
                <SkeletonLoader type="category" width={p(40)} height={p(40)} borderRadius={p(20)} />
                <View style={styles.skeletonActionContent}>
                  <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonActionTitle} />
                  <SkeletonLoader type="text" width="50%" height={p(12)} style={styles.skeletonActionSubtitle} />
                </View>
                <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
              </View>
            ))}
          </View>
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
  cameraIconDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
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

  // Skeleton Loader Styles
  skeletonProfileHeader: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  skeletonAvatarContainer: {
    alignItems: 'center',
    marginBottom: p(15),
    position: 'relative',
  },
  skeletonCameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  skeletonUserName: {
    marginBottom: p(5),
  },
  skeletonUserEmail: {
    marginTop: p(5),
  },
  skeletonSection: {
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
  skeletonSectionTitle: {
    marginBottom: p(20),
  },
  skeletonActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonActionContent: {
    flex: 1,
    marginLeft: p(15),
  },
  skeletonActionTitle: {
    marginBottom: p(2),
  },
  skeletonActionSubtitle: {
    marginTop: p(2),
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

export default FarmerProfileScreen;
