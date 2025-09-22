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
      console.log('Firebase Messaging initialized successfully');
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
          console.log('Notification permission denied');
          return false;
        }
      }

      // Request iOS permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission denied');
        return false;
      }

      console.log('Notification permission granted');
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
      
      // Print FCM token in console
      console.log('=== FCM TOKEN ===');
      console.log(token);
      console.log('================');
      
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
        
        // Replace with your actual API endpoint
        const response = await fetch('YOUR_BACKEND_API/fcm-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`, // Adjust based on your auth structure
          },
          body: JSON.stringify({
            fcm_token: token,
            user_id: user.id,
            platform: Platform.OS,
            app_version: '1.0.0', // You can get this from package.json
          }),
        });

        if (response.ok) {
          console.log('FCM token sent to backend successfully');
        } else {
          console.log('Failed to send FCM token to backend');
        }
      }
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
    }
  }

  // Set up basic message handlers
  setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
    });

    // Handle notification tap when app is in background/quit
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
    });

    // Handle notification tap when app is quit
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
        }
      });
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
      
      // Print FCM token in console
      console.log('=== FCM TOKEN REFRESHED ===');
      console.log(token);
      console.log('============================');
      
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
