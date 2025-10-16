import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchDeliveryDashboard } from '../../../redux/slices/deliveryDashboardSlice';

const { width } = Dimensions.get('window');

const DeliveryDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { dashboardData, loading, error } = useSelector(state => state.deliveryDashboard);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      await dispatch(fetchDeliveryDashboard());
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'deliveries':
        navigation.navigate('Deliveries');
        break;
      case 'todaysTask':
        navigation.navigate('TodaysTask');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const renderStatsCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={p(24)} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (title, icon, color, onPress) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={p(28)} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
        <SkeletonLoader height={p(16)} width="40%" borderRadius={p(4)} />
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <View style={styles.skeletonStats}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.skeletonStatCard}>
              <SkeletonLoader height={p(36)} width={p(36)} borderRadius={p(18)} />
              <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
              <SkeletonLoader height={p(12)} width="60%" borderRadius={p(4)} />
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <View style={styles.skeletonActions}>
          {[1, 2].map((index) => (
            <SkeletonLoader key={index} height={p(80)} width="45%" borderRadius={p(8)} />
          ))}
        </View>
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <View style={styles.skeletonDeliveries}>
          {[1, 2, 3].map((index) => (
            <SkeletonLoader key={index} height={p(60)} width="100%" borderRadius={p(8)} />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Dashboard"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'Delivery Agent'}</Text>
              </View>
              <View style={styles.profileImageContainer}>
                {user?.profile_image ? (
                  <Image
                    source={{ uri: `https://kisancart.in/storage/${user.profile_image}` }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileIcon}>
                    <Icon name="user" size={p(20)} color="#fff" />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {renderStatsCard(
                'Total Deliveries',
                dashboardData?.total_deliveries || '0',
                'truck',
                '#019a34',
                () => handleQuickAction('deliveries')
              )}
              {renderStatsCard(
                'Pending Deliveries',
                dashboardData?.pending_deliveries || '0',
                'clock-o',
                '#ffc107',
                () => handleQuickAction('deliveries')
              )}
              {renderStatsCard(
                'Completed Deliveries',
                dashboardData?.completed_deliveries || '0',
                'check-circle',
                '#28a745',
                () => handleQuickAction('todaysTask')
              )}
              {renderStatsCard(
                'Deliveries Today',
                dashboardData?.todays_deliveries_count || '0',
                'calendar',
                '#17a2b8',
                () => handleQuickAction('todaysTask')
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {renderQuickAction(
                'View Today\'s',
                'calendar',
                '#019a34',
                () => handleQuickAction('todaysTask')
              )}
              {renderQuickAction(
                'Delivery History',
                'history',
                '#28a745',
                () => navigation.navigate('DeliveryHistory')
              )}
            </View>
          </View>

          {/* Assigned Deliveries */}
          <View style={styles.assignedDeliveriesSection}>
            <Text style={styles.sectionTitle}>Assigned Deliveries</Text>
            <View style={styles.deliveriesCard}>
              {dashboardData?.assigned_deliveries && dashboardData.assigned_deliveries.length > 0 ? (
                dashboardData.assigned_deliveries.map((delivery, index) => (
                  <View key={index} style={styles.deliveryItem}>
                    <View style={styles.deliveryIcon}>
                      <Icon name="truck" size={p(20)} color="#019a34" />
                    </View>
                    <View style={styles.deliveryContent}>
                      <Text style={styles.deliveryTitle}>Order #{delivery.order_id || delivery.id}</Text>
                      <Text style={styles.deliverySubtitle}>
                        {delivery.customer_name || 'Customer'} • {delivery.delivery_address?.city || 'Location'}
                      </Text>
                      <Text style={styles.deliveryStatus}>
                        Status: {delivery.delivery_status || 'Pending'}
                      </Text>
                    </View>
                    <View style={styles.deliveryAction}>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('Deliveries')}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDeliveries}>
                  <Icon name="truck" size={p(40)} color="#ccc" />
                  <Text style={styles.emptyDeliveriesText}>No assigned deliveries</Text>
                  <Text style={styles.emptyDeliveriesSubtext}>Check back later for new assignments</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
    padding: p(16),
  },
  welcomeSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(4),
  },
  userName: {
    fontSize: p(20),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileIcon: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    backgroundColor: '#019a34',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: p(50),
    height: p(50),
    borderRadius: p(25),
    borderWidth: 2,
    borderColor: '#019a34',
  },
  statsSection: {
    marginBottom: p(16),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(12),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(8),
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    alignItems: 'center',
    width: (width - p(48)) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  statIcon: {
    width: p(36),
    height: p(36),
    borderRadius: p(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(6),
  },
  statValue: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(2),
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    marginBottom: p(16),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: p(8),
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  quickActionText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  assignedDeliveriesSection: {
    marginBottom: p(16),
  },
  deliveriesCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deliveryIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#019a3420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  deliverySubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(2),
  },
  deliveryStatus: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Medium',
    color: '#019a34',
  },
  deliveryAction: {
    marginLeft: p(8),
  },
  viewButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(4),
  },
  viewButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyDeliveries: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  emptyDeliveriesText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: p(8),
    marginBottom: p(4),
  },
  emptyDeliveriesSubtext: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  // Skeleton Loader
  skeletonContainer: {
    padding: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    gap: p(6),
  },
  skeletonStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(8),
    marginTop: p(12),
  },
  skeletonStatCard: {
    width: (width - p(64)) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    alignItems: 'center',
    gap: p(6),
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: p(8),
    marginTop: p(12),
  },
  skeletonDeliveries: {
    gap: p(8),
    marginTop: p(12),
  },
});

export default DeliveryDashboardScreen;
