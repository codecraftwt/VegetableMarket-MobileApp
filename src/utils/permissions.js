import { Platform, PermissionsAndroid } from 'react-native';

/**
 * Request camera permission for Android
 * @param {Object} options - Optional configuration
 * @param {string} options.title - Title for permission dialog (default: 'Camera Permission')
 * @param {string} options.message - Message for permission dialog (default: 'This app needs access to your camera to take photos.')
 * @returns {Promise<boolean>} - Returns true if permission is granted, false otherwise
 */
export const requestCameraPermissionAndroid = async (options = {}) => {
  if (Platform.OS !== 'android') {
    return true; // iOS handles permissions automatically
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: options.title || 'Camera Permission',
        message: options.message || 'This app needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Camera permission error:', err);
    return false;
  }
};

/**
 * Request storage permission for Android
 * Handles different Android versions (API 33+ uses READ_MEDIA_IMAGES, older versions use READ_EXTERNAL_STORAGE)
 * @param {Object} options - Optional configuration
 * @param {string} options.title - Title for permission dialog (default: 'Storage Permission')
 * @param {string} options.message - Message for permission dialog (default: 'This app needs access to your storage to select photos.')
 * @param {boolean} options.useMediaImages - Force use of READ_MEDIA_IMAGES for Android 13+ (default: false, returns true for Android 13+)
 * @returns {Promise<boolean>} - Returns true if permission is granted or not needed, false otherwise
 */
export const requestStoragePermissionAndroid = async (options = {}) => {
  if (Platform.OS !== 'android') {
    return true; // iOS handles permissions automatically
  }

  try {
    const androidVersion = Platform.Version;

    // For Android 13+ (API level 33+), no permission needed for photo picker by default
    // unless explicitly requested via useMediaImages option
    if (androidVersion >= 33 && !options.useMediaImages) {
      return true;
    }

    let permission;
    if (androidVersion >= 33) {
      // Android 13+ uses READ_MEDIA_IMAGES
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    } else {
      // Older Android versions use READ_EXTERNAL_STORAGE
      permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    }

    const granted = await PermissionsAndroid.request(permission, {
      title: options.title || 'Storage Permission',
      message: options.message || 'This app needs access to your storage to select photos.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error('Storage permission error:', err);
    return false;
  }
};

