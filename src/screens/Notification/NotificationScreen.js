import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import useNotification from '../../hooks/useNotification';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  clearNotificationsError,
  addNotification,
  sendTestNotification
} from '../../redux/slices/notificationSlice';

const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    notifications, 
    notificationsLoading, 
    notificationsError,
    markAsReadLoading,
    markAllAsReadLoading
  } = useSelector(state => state.notification);
  
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

  // Fetch notifications on component mount
  useEffect(() => {
    // Try to fetch from API, but don't show error if route doesn't exist
    dispatch(fetchNotifications()).catch(error => {
      console.log('📱 Notifications API not available, using local notifications only');
    });
  }, [dispatch]);

  // Handle notifications error
  useEffect(() => {
    if (notificationsError && !notificationsError.includes('could not be found')) {
      Alert.alert('Error', notificationsError);
      dispatch(clearNotificationsError());
    } else if (notificationsError && notificationsError.includes('could not be found')) {
      // Don't show error for missing API route, just log it
      console.log('📱 Notifications API route not found, using local notifications only');
      dispatch(clearNotificationsError());
    }
  }, [notificationsError, dispatch]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchNotifications()).unwrap();
    } catch (error) {
      console.log('Failed to refresh notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification) => {
    console.log('📱 Notification pressed:', notification);
    // Mark as read when pressed if not already read
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleSendTestNotification = () => {
    const testNotification = {
      title: 'OTP Generated',
      message: 'Your OTP for order #44 is : 123456',
      type: 'otp',
      order_id: 44
    };
    
    console.log('📱 Sending test notification:', testNotification);
    dispatch(sendTestNotification(testNotification));
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.is_read).length;
  };

  // Format notification time
  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return 'Just now';
    
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Get notification icon and color based on type
  const getNotificationIcon = (notification) => {
    // Check if it's an OTP notification
    if (notification.message && notification.message.includes('OTP')) {
      return {
        icon: 'key',
        color: '#6f42c1'
      };
    }
    
    // Check notification type or title for other icons
    const type = notification.type || '';
    const title = notification.title || '';
    
    if (type.includes('order') || title.includes('Order')) {
      return {
        icon: 'shopping-cart',
        color: '#4CAF50'
      };
    }
    
    if (type.includes('delivery') || title.includes('Delivery') || title.includes('delivery')) {
      return {
        icon: 'truck',
        color: '#2196F3'
      };
    }
    
    if (type.includes('payment') || title.includes('Payment')) {
      return {
        icon: 'credit-card',
        color: '#4CAF50'
      };
    }
    
    if (type.includes('promo') || title.includes('Offer') || title.includes('Discount')) {
      return {
        icon: 'gift',
        color: '#FF9800'
      };
    }
    
    // Default icon
    return {
      icon: 'bell',
      color: '#666'
    };
  };

  // Notification Item Component
  const NotificationItem = ({ notification }) => {
    const iconInfo = getNotificationIcon(notification);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.is_read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={styles.notificationLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: iconInfo.color + '20' }
          ]}>
            <Icon 
              name={iconInfo.icon} 
              size={16} 
              color={iconInfo.color} 
            />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[
              styles.notificationTitle,
              !notification.is_read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatNotificationTime(notification.created_at)}
            </Text>
          </View>
        </View>
        
        {!notification.is_read && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

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
      {/* <View style={styles.headerActions}>
        <View style={styles.notificationCount}>
          <Text style={styles.countText}>
            {getUnreadCount()} unread notification{getUnreadCount() !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.testNotificationButton} 
            onPress={handleSendTestNotification}
          >
            <Text style={styles.testNotificationText}>Test OTP</Text>
          </TouchableOpacity>
          {getUnreadCount() > 0 && (
            <TouchableOpacity 
              style={[styles.markAllReadButton, markAllAsReadLoading && styles.buttonDisabled]} 
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadLoading}
            >
              <Text style={styles.markAllReadText}>
                {markAllAsReadLoading ? 'Marking...' : 'Mark all as read'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View> */}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#019a34']}
            tintColor="#019a34"
            title="Pull to refresh"
            titleColor="#019a34"
          />
        }
      >
        {notificationsLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="spinner" size={30} color="#019a34" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
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
  headerButtons: {
    flexDirection: 'row',
    gap: p(8),
  },
  testNotificationButton: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    backgroundColor: '#6f42c1',
    borderRadius: p(15),
  },
  testNotificationText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
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
  buttonDisabled: {
    opacity: 0.7,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    marginTop: p(10),
    fontFamily: 'Poppins-Regular',
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
