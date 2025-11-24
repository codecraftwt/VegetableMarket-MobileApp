import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FirebaseMessagingService {
  constructor() {
    this.fcmToken = null;
    this.initialized = false;
  }

  // Initialize FCM service
  async initialize() {
    try {
      if (this.initialized) return;

      // Request permission for notifications
      await this.requestPermission();

      // Get FCM token
      await this.getFCMToken();

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error);
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (Platform.OS === 'android') {
        // Request Android notification permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send you updates about your orders and promotions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      // Request iOS permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;

      // Store token in AsyncStorage
      await AsyncStorage.setItem('fcm_token', token);

      // Send token to your backend
      await this.sendTokenToBackend(token);

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Send FCM token to backend
  async sendTokenToBackend(token) {
    try {
      // Get user info from AsyncStorage or Redux store
      const userInfo = await AsyncStorage.getItem('user_info');

      if (userInfo) {
        const user = JSON.parse(userInfo);

        // Use the correct API endpoint
        const response = await fetch('https://kisancart.in/api/fcm-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            fcm_token: token,
            user_id: user.id,
            platform: Platform.OS,
            app_version: '1.0.0',
          }),
        });

        if (response.ok) {
          console.log('✅ FCM token sent to backend successfully');
        } else {
          console.log('❌ Failed to send FCM token to backend:', response.status);
        }
      } else {
        console.log('⚠️ No user info found, cannot send FCM token');
      }
    } catch (error) {
      console.error('❌ Error sending FCM token to backend:', error);
    }
  }

  // Set up message handlers with Redux integration
  setupMessageHandlers(dispatch) {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      // Add notification to Redux store even in background
      if (dispatch && remoteMessage.data) {
        const notificationData = {
          id: remoteMessage.messageId || Date.now(),
          title: remoteMessage.notification?.title || 'New Notification',
          message: remoteMessage.notification?.body || remoteMessage.data.message || '',
          type: remoteMessage.data.type || 'general',
          is_read: false,
          created_at: new Date().toISOString(),
          ...remoteMessage.data
        };
        dispatch({ type: 'notification/addNotification', payload: notificationData });
      }
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {


      // Add notification to Redux store for real-time updates
      if (dispatch && remoteMessage.data) {
        const notificationData = {
          id: remoteMessage.messageId || Date.now(),
          title: remoteMessage.notification?.title || 'New Notification',
          message: remoteMessage.notification?.body || remoteMessage.data.message || '',
          type: remoteMessage.data.type || 'general',
          is_read: false,
          created_at: new Date().toISOString(),
          ...remoteMessage.data
        };
        dispatch({ type: 'notification/addNotification', payload: notificationData });
      }

      // Show local notification for foreground messages
      if (remoteMessage.notification) {
        console.log('📱 Showing local notification:', remoteMessage.notification.title);
      }
    });

    // Handle notification tap when app is in background/quit
    messaging().onNotificationOpenedApp(remoteMessage => {
      this.handleNotificationTap(remoteMessage);
    });

    // Handle notification tap when app is quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  // Handle notification tap
  handleNotificationTap(remoteMessage) {
    // You can add navigation logic here based on notification type
    const data = remoteMessage.data || {};

    if (data.type === 'otp') {
      console.log('📱 OTP notification tapped - order:', data.order_id);
      // Navigate to order details or OTP screen
    } else if (data.type === 'order') {
      console.log('📱 Order notification tapped - order:', data.order_id);
      // Navigate to order details
    } else if (data.type === 'delivery') {
      console.log('📱 Delivery notification tapped - order:', data.order_id);
      // Navigate to order details
    }
  }

  // Get current FCM token
  getCurrentToken() {
    return this.fcmToken;
  }

  // Refresh FCM token
  async refreshToken() {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      await AsyncStorage.setItem('fcm_token', token);
      await this.sendTokenToBackend(token);
      return token;
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      return null;
    }
  }
}

// Create singleton instance
const firebaseMessagingService = new FirebaseMessagingService();

export default firebaseMessagingService;
