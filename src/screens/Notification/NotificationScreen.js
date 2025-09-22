import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import useNotification from '../../hooks/useNotification';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Confirmed!',
      message: 'Your order #ORD-2024-001 has been confirmed and is being processed.',
      time: '2 minutes ago',
      isRead: false,
      icon: 'check-circle',
      iconColor: '#4CAF50',
    },
    {
      id: 2,
      type: 'delivery',
      title: 'Out for Delivery',
      message: 'Your order #ORD-2024-001 is out for delivery. Expected delivery in 2-3 hours.',
      time: '1 hour ago',
      isRead: false,
      icon: 'truck',
      iconColor: '#2196F3',
    },
    {
      id: 3,
      type: 'promo',
      title: 'Special Offer!',
      message: 'Get 20% off on all fruits this weekend. Use code: FRESH20',
      time: '3 hours ago',
      isRead: true,
      icon: 'gift',
      iconColor: '#FF9800',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of ₹15.99 has been processed successfully.',
      time: '5 hours ago',
      isRead: true,
      icon: 'credit-card',
      iconColor: '#4CAF50',
    },
    {
      id: 5,
      type: 'system',
      title: 'App Update Available',
      message: 'A new version of Vegetable Market is available. Update now for better experience.',
      time: '1 day ago',
      isRead: true,
      icon: 'download',
      iconColor: '#9C27B0',
    },
  ]);
  
  const {
    fcmToken,
    isInitialized,
    isLoading,
    error,
    permissionGranted,
    getToken,
    refreshToken,
    requestPermission,
  } = useNotification();

  // Initialize FCM on component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeFCM();
    }
  }, [isInitialized]);

  const initializeFCM = async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates about your orders.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const token = await getToken();
      if (token) {
        console.log('FCM Token generated:', token);
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
      // Don't show error alert for FCM, just log it
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (notification) => {
    console.log('Notification pressed:', notification);
    // Mark as read when pressed
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  // Notification Item Component
  const NotificationItem = ({ notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: notification.iconColor + '20' }
        ]}>
          <Icon 
            name={notification.icon} 
            size={16} 
            color={notification.iconColor} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {notification.time}
          </Text>
        </View>
      </View>
      
      {!notification.isRead && (
        <View style={styles.unreadDot} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Notifications"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <View style={styles.notificationCount}>
          <Text style={styles.countText}>
            {getUnreadCount()} unread notification{getUnreadCount() !== 1 ? 's' : ''}
          </Text>
        </View>
        {getUnreadCount() > 0 && (
          <TouchableOpacity style={styles.markAllReadButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-slash" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Check back later for new updates.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </View>
        )}
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
    paddingHorizontal: p(16),
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingVertical: p(10),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  notificationCount: {
    flex: 1,
  },
  countText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  markAllReadButton: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    backgroundColor: '#019a34',
    borderRadius: p(15),
  },
  markAllReadText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginTop: p(15),
    marginBottom: p(8),
    fontFamily: 'Montserrat-Bold',
  },
  emptySubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(18),
    fontFamily: 'Poppins-Regular',
  },

  // Notifications List
  notificationsList: {
    paddingTop: p(8),
  },

  // Notification Item
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(14),
    marginBottom: p(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#019a34',
    backgroundColor: '#f8fffe',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSizes.sm,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(3),
  },
  unreadTitle: {
    color: '#019a34',
  },
  notificationMessage: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(16),
    marginBottom: p(5),
  },
  notificationTime: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  unreadDot: {
    width: p(8),
    height: p(8),
    borderRadius: p(4),
    backgroundColor: '#019a34',
  },
});

export default NotificationScreen;
