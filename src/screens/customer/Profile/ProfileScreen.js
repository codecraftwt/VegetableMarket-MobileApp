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
  Alert
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { CustomModal, SuccessModal, ErrorModal, ConfirmationModal, SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';
import { fetchProfile, updateProfile, deleteProfile } from '../../../redux/slices/profileSlice';
import { fetchWishlist, loadGuestWishlist } from '../../../redux/slices/wishlistSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { requestCameraPermissionAndroid, requestStoragePermissionAndroid } from '../../../utils/permissions';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const { user, address, profile, loading, deleteProfileLoading, deleteProfileError } = profileState;
  const { isLoggedIn } = useSelector(state => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchWishlist());
    } else {
      // Load guest wishlist when not logged in
      dispatch(loadGuestWishlist());
    }
  }, [dispatch, isLoggedIn]);

  // Handle delete profile success
  useEffect(() => {
    if (deleteProfileError) {
      setErrorMessage(deleteProfileError);
      setShowErrorModal(true);
    }
  }, [deleteProfileError]);

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

  const handleMyRefundsPress = () => {
    navigation.navigate('MyRefunds');
  };

  const handleFavoritesPress = () => {
    // Navigate to Wishlist screen
    navigation.navigate('Wishlist');
  };

  const handleLoginPress = () => {
    // Navigate to Login screen
    navigation.navigate('Login');
  };

  const handleHelpCenterPress = () => {
    navigation.navigate('HelpCenter');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);

    try {
      const result = await dispatch(deleteProfile()).unwrap();

      if (result.success) {
        // Show success message
        setSuccessMessage(result.message || 'Your profile has been deleted successfully.');
        setShowSuccessModal(true);

        // Navigate to customer dashboard (guest mode) after successful deletion
        setTimeout(() => {
          dispatch(logout());
          navigation.reset({
            index: 0,
            routes: [{ name: 'App' }],
          });
        }, 2000);
      }
    } catch (error) {
      // Error is handled in the useEffect above
      console.error('Delete profile error:', error);
    }
  };
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'App' }],
    });
  };


  const handleCameraPress = () => {
    setShowPhotoModal(true);
  };

  const handleModalClose = () => {
    setShowPhotoModal(false);
  };

  const handleCameraOption = () => {
    setShowPhotoModal(false);
    setTimeout(() => {
      openCamera();
    }, Platform.OS === 'ios' ? 300 : 100);
  };

  const handleGalleryOption = () => {
    setShowPhotoModal(false);
    setTimeout(() => {
      openGallery();
    }, Platform.OS === 'ios' ? 300 : 100);
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setIsProcessingImage(true);

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

      // Add address fields - always include them (like ProfileEditScreen does)
      updateData.address_label = address?.address_label || '';
      updateData.address_line = address?.address_line || '';
      updateData.city = address?.city || '';
      updateData.taluka = address?.taluka || '';
      updateData.district = address?.district || '';
      updateData.state = address?.state || '';
      updateData.country = address?.country || '';
      updateData.pincode = address?.pincode || '';

      const result = await dispatch(updateProfile(updateData)).unwrap();
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

      const options = Platform.OS === 'ios' ? {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'front',
        maxWidth: 800,
        maxHeight: 800,
        presentationStyle: 'pageSheet',
      } : {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'back',
        maxWidth: 800,
        maxHeight: 800,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };
      const response = await launchCamera(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setErrorMessage(`Camera error: ${response.errorMessage}`);
        setShowErrorModal(true);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        if (asset.uri) {
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
    try {
      // Check permissions first
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;

        if (androidVersion < 33) {
          const hasStoragePermission = await requestStoragePermissionAndroid();
          if (!hasStoragePermission) {
            setErrorMessage('Photo access permission is required to select images from your gallery.');
            setShowErrorModal(true);
            return;
          }
        }
      }

      const options = Platform.OS === 'ios' ? {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
        maxWidth: 800,
        maxHeight: 800,
        presentationStyle: 'pageSheet',
      } : {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
        maxWidth: 800,
        maxHeight: 800,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {

        // If it's the intent error, try with different options
        // if (response.errorMessage?.includes('No Activity found to handle Intent')) {
        //   await tryAlternativeGallery();
        //   return;
        // }

        let errorMsg = 'Failed to access gallery. ';

        if (response.errorMessage?.includes('permission')) {
          errorMsg += 'Please grant photo access permission in your device settings.';
        } else {
          errorMsg += response.errorMessage || 'Please try again.';
        }

        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
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

      // If it's the intent error, try alternative method
      // if (error.message?.includes('No Activity found to handle Intent')) {
      //   await tryAlternativeGallery();
      //   return;
      // }

      let errorMsg = 'Failed to access gallery. ';

      if (error.message?.includes('permission')) {
        errorMsg += 'Please grant photo access permission in your device settings.';
      } else {
        errorMsg += error.message || 'Please try again.';
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  // const tryAlternativeGallery = async () => {
  //   try {
  //     const alternativeOptions = {
  //       mediaType: 'photo',
  //       quality: 0.7,
  //       includeBase64: false,
  //       selectionLimit: 1,
  //       maxWidth: 600,
  //       maxHeight: 600,
  //       presentationStyle: 'pageSheet',
  //       includeExtra: false,
  //       storageOptions: {
  //         skipBackup: true,
  //         path: 'images',
  //       },
  //     };

  //     const response = await launchImageLibrary(alternativeOptions);

  //     if (response.didCancel) {
  //       return;
  //     }

  //     if (response.errorCode) {
  //       setErrorMessage('No gallery app found on your device. Please install a gallery app or use the camera instead.');
  //       setShowErrorModal(true);
  //       return;
  //     }

  //     if (response.assets && response.assets.length > 0) {
  //       const asset = response.assets[0];

  //       if (asset.uri) {
  //         await uploadProfilePicture(asset.uri);
  //       } else {
  //         console.error('No URI in alternative gallery response');
  //         setErrorMessage('Failed to select image. Please try again.');
  //         setShowErrorModal(true);
  //       }
  //     } else {
  //       console.error('No assets in alternative gallery response');
  //       setErrorMessage('No image selected. Please try again.');
  //       setShowErrorModal(true);
  //     }
  //   } catch (error) {
  //     console.error('Alternative gallery error:', error);
  //     setErrorMessage('No gallery app found on your device. Please install a gallery app or use the camera instead.');
  //     setShowErrorModal(true);
  //   }
  // };

  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity style={styles.avatar} onPress={handleCameraPress}>
          {profile?.profile_picture ? (
            <Image
              source={{ uri: `https://kisancart.in/storage/${profile.profile_picture}` }}
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
      <Text style={styles.userName}>{user?.name || 'Loading...'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>
    </View>
  );

  const GuestProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Icon name="user-circle" size={60} color="#019a34" />
        </View>
      </View>
      <Text style={styles.userName}>Guest User</Text>
      <Text style={styles.userEmail}>Login to access your profile</Text>
    </View>
  );

  const GuestActionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Favorites</Text>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={handleFavoritesPress}
      >
        <View style={styles.actionIcon}>
          <Icon name="heart" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Favorites</Text>
          <Text style={styles.actionSubtitle}>
            {wishlistItems?.length > 0 
              ? `${wishlistItems.length} saved item${wishlistItems.length !== 1 ? 's' : ''}`
              : 'Your saved items'}
          </Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionItem, styles.loginActionItem]}
        onPress={handleLoginPress}
      >
        <View style={[styles.actionIcon, styles.loginIcon]}>
          <Icon name="sign-in" size={20} color="#fff" />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, styles.loginTitle]}>Login or Register</Text>
          <Text style={styles.actionSubtitle}>Sign in to access all features</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#019a34" />
      </TouchableOpacity>
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

      <TouchableOpacity style={styles.actionItem} onPress={handleMyRefundsPress}>
        <View style={styles.actionIcon}>
          <Icon name="money" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>My Refunds</Text>
          <Text style={styles.actionSubtitle}>Track your refund requests</Text>
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

      <TouchableOpacity
        style={styles.actionItem}
        onPress={handleHelpCenterPress}
      >
        <View style={styles.actionIcon}>
          <Icon name="life-ring" size={20} color="#019a34" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Help Center</Text>
          <Text style={styles.actionSubtitle}>Get support and help</Text>
        </View>
        <Icon name="chevron-right" size={16} color="#999" />
      </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity
        style={[styles.actionItem, deleteProfileLoading && styles.actionItemDisabled]}
        onPress={handleDeleteAccount}
        disabled={deleteProfileLoading}
      >
        <View style={styles.actionIcon}>
          <Icon name="trash" size={20} color="#dc3545" />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, styles.logoutTitle]}>
            {deleteProfileLoading ? 'Deleting Account...' : 'Delete Account'}
          </Text>
          <Text style={[styles.actionSubtitle]}>
            Delete your account
          </Text>
        </View>
        {deleteProfileLoading ? (
          <SkeletonLoader type="category" width={16} height={16} borderRadius={8} />
        ) : (
          <Icon name="chevron-right" size={16} color="#999" />
        )}
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
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Profile"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {!isLoggedIn ? (
        // Guest User View
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GuestProfileHeader />
          <GuestActionsSection />
        </ScrollView>
      ) : loading ? (
        // Loading State (Logged In)
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
        // Error State (Logged In)
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Logged In User View
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

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText={deleteProfileLoading ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        type="danger"
        confirmDisabled={deleteProfileLoading}
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
    paddingHorizontal: p(16),
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: p(24),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: p(12),
  },
  avatar: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
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
    borderRadius: p(40),
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#019a34',
    borderRadius: p(16),
    width: p(32),
    height: p(32),
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
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(4),
    fontFamily: 'Poppins-Bold',
  },
  userEmail: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(16),
    fontFamily: 'Poppins-Bold',
  },

  // Action Items
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(2),
    fontFamily: 'Poppins-SemiBold',
  },
  actionSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  logoutIcon: {
    backgroundColor: '#ffebee', // A light red background for destructive actions
  },
  logoutTitle: {
    color: '#dc3545', // Red color for destructive action
  },
  loginActionItem: {
    marginTop: p(8),
    backgroundColor: '#f0f8f0',
    borderRadius: p(8),
    paddingHorizontal: p(12),
  },
  loginIcon: {
    backgroundColor: '#019a34',
  },
  loginTitle: {
    color: '#019a34',
  },
  // Skeleton Loader Styles
  skeletonProfileHeader: {
    alignItems: 'center',
    paddingVertical: p(24),
  },
  skeletonAvatarContainer: {
    alignItems: 'center',
    marginBottom: p(12),
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
    marginBottom: p(4),
  },
  skeletonUserEmail: {
    marginTop: p(4),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  skeletonSectionTitle: {
    marginBottom: p(16),
  },
  skeletonActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonActionContent: {
    flex: 1,
    marginLeft: p(12),
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
    padding: p(16),
  },
  errorText: {
    marginTop: p(8),
    fontSize: fontSizes.sm,
    color: '#dc3545',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: p(16),
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ProfileScreen;
