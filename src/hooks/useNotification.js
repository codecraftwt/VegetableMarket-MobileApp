import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeFCM,
  getFCMToken,
  setPermissionStatus,
} from '../redux/slices/notificationSlice';
import firebaseMessagingService from '../services/firebaseMessaging';

const useNotification = () => {
  const dispatch = useDispatch();
  const {
    fcmToken,
    isInitialized,
    isLoading,
    error,
    permissionGranted,
  } = useSelector(state => state.notification);

  // Initialize FCM on mount
  useEffect(() => {
    initializeNotification();
  }, []);

  const initializeNotification = async () => {
    try {
      await dispatch(initializeFCM()).unwrap();
      console.log('FCM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }
  };

  const getToken = useCallback(async () => {
    try {
      const token = await dispatch(getFCMToken()).unwrap();
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      const token = await firebaseMessagingService.refreshToken();
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await firebaseMessagingService.requestPermission();
      dispatch(setPermissionStatus(granted));
      return granted;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }, [dispatch]);

  return {
    // State
    fcmToken,
    isInitialized,
    isLoading,
    error,
    permissionGranted,

    // Actions
    getToken,
    refreshToken,
    requestPermission,
  };
};

export default useNotification;
