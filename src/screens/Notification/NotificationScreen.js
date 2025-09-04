import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

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
    {
      id: 6,
      type: 'delivery',
      title: 'Delivery Completed',
      message: 'Your order #ORD-2024-001 has been delivered successfully. Enjoy your fresh vegetables!',
      time: '2 days ago',
      isRead: true,
      icon: 'home',
      iconColor: '#4CAF50',
    },
    {
      id: 7,
      type: 'promo',
      title: 'Weekend Sale!',
      message: 'Don\'t miss our weekend sale! Up to 30% off on selected items.',
      time: '3 days ago',
      isRead: true,
      icon: 'tag',
      iconColor: '#F44336',
    },
    {
      id: 8,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-2024-002 has been shipped and is on its way to you.',
      time: '4 days ago',
      isRead: true,
      icon: 'shipping-fast',
      iconColor: '#2196F3',
    },
  ]);

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
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
      onPress={() => handleMarkAsRead(notification.id)}
    >
      <View style={styles.notificationLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: notification.iconColor + '20' }
        ]}>
          <Icon 
            name={notification.icon} 
            size={20} 
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
            <Icon name="bell-slash" size={80} color="#ccc" />
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
    paddingHorizontal: p(20),
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(20),
    paddingVertical: p(15),
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
    paddingHorizontal: p(15),
    paddingVertical: p(8),
    backgroundColor: '#019a34',
    borderRadius: p(20),
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
    paddingVertical: p(80),
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginTop: p(20),
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
  },

  // Notifications List
  notificationsList: {
    paddingTop: p(10),
  },

  // Notification Item
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#019a34',
    backgroundColor: '#f8fffe',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(15),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(5),
  },
  unreadTitle: {
    color: '#019a34',
  },
  notificationMessage: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(18),
    marginBottom: p(8),
  },
  notificationTime: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  unreadDot: {
    width: p(12),
    height: p(12),
    borderRadius: p(6),
    backgroundColor: '#019a34',
  },
});

export default NotificationScreen;
