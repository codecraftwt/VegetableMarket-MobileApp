import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeFCM } from '../redux/slices/notificationSlice';
import firebaseMessagingService from '../services/firebaseMessaging';

const NotificationInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitialized, fcmToken } = useSelector(state => state.notification);

  useEffect(() => {
    // Initialize FCM when the app starts
    const initializeNotifications = async () => {
      try {
        if (!isInitialized) {
          await dispatch(initializeFCM()).unwrap();
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, [dispatch, isInitialized]);

  // Set up message handlers when FCM is initialized
  useEffect(() => {
    if (isInitialized && fcmToken) {
      const unsubscribe = firebaseMessagingService.setupMessageHandlers();
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [isInitialized, fcmToken]);

  return children;
};

export default NotificationInitializer;
