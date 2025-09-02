import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFarmerDashboard } from '../../../redux/slices/salesReportSlice';
import { fetchProfile } from '../../../redux/slices/profileSlice';

const { width } = Dimensions.get('window');

const FarmerDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { dashboardData, dashboardLoading } = useSelector(state => state.salesReport);
  const { user } = useSelector(state => state.auth);
  const { profile } = useSelector(state => state.profile);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchFarmerDashboard()),
        dispatch(fetchProfile())
      ]);
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addFarm':
        navigation.navigate('AddFarm');
        break;
      case 'addVegetable':
        navigation.navigate('AddVegetable');
        break;
      case 'viewOrders':
        navigation.navigate('FarmerOrders');
        break;
      case 'salesReport':
        navigation.navigate('SalesReport');
        break;
      case 'myFarms':
        navigation.navigate('MyFarms');
        break;
      case 'myVegetables':
        navigation.navigate('FarmerBucket');
        break;
    }
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome Back, {user?.name || 'Farmer'}!</Text>
        <Text style={styles.welcomeSubtitle}>Manage your farms and vegetables</Text>
      </View>
      <View style={styles.profileContainer}>
        {profile?.profile_picture ? (
          <Image 
            source={{ uri: `https://vegetables.walstarmedia.com/storage/${profile.profile_picture}` }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={styles.profileIcon}>
            <Icon name="user" size={24} color="#fff" />
          </View>
        )}
      </View>
    </View>
  );

  const renderStatsCards = () => {
    const data = dashboardData?.data || {};
    const totalVegetables = data.total_vegetables || 0;
    const activeVegetables = data.active_vegetables || 0;
    const totalOrders = data.orders_received || 0;
    const totalEarnings = data.total_earnings || 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="leaf" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{totalVegetables}</Text>
            <Text style={styles.statLabel}>Total Vegetables</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="check-circle" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{activeVegetables}</Text>
            <Text style={styles.statLabel}>Active Items</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="shopping-cart" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Orders Received</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="rupee" size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>₹{totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickAction('addFarm')}
        >
          <View style={styles.quickActionIcon}>
            <Icon name="plus" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Add Farm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickAction('addVegetable')}
        >
          <View style={styles.quickActionIcon}>
            <Icon name="plus" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Add Vegetable</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => handleQuickAction('salesReport')}
        >
          <View style={styles.quickActionIcon}>
            <Icon name="bar-chart" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>Sales Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );



  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
        <SkeletonLoader height={p(16)} width="40%" borderRadius={p(4)} />
      </View>
      
      <View style={styles.skeletonStats}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.skeletonStatCard}>
            <SkeletonLoader height={p(40)} width={p(40)} borderRadius={p(20)} />
            <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
            <SkeletonLoader height={p(12)} width="60%" borderRadius={p(4)} />
          </View>
        ))}
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <View style={styles.skeletonActions}>
          {[1, 2, 3, 4].map((index) => (
            <SkeletonLoader key={index} height={p(80)} width="45%" borderRadius={p(8)} />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Dashboard"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {dashboardLoading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderWelcomeSection()}
          {renderStatsCards()}
          {renderQuickActions()}
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
  // Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: p(4),
  },
  welcomeSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: p(18),
  },
  profileContainer: {
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
  // Stats Section
  statsContainer: {
    marginBottom: p(20),
  },
  statsRow: {
    flexDirection: 'row',
    gap: p(12),
    marginBottom: p(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#019a34',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  statValue: {
    fontSize: p(22),
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: p(2),
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(16),
  },
  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: p(16),
  },
  viewAllText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: p(12),
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: p(12),
    padding: p(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: p(48),
    height: p(48),
    borderRadius: p(24),
    backgroundColor: '#019a34',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  quickActionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: p(18),
  },
  // Recent Activity
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#019a3420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  activitySubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'capitalize',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(40),
  },
  emptyStateText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: p(8),
  },
  // Skeleton Loader
  skeletonContainer: {
    padding: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(16),
    gap: p(8),
  },
  skeletonStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(12),
    marginBottom: p(16),
  },
  skeletonStatCard: {
    width: (width - p(80)) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: p(12),
    padding: p(16),
    alignItems: 'center',
    gap: p(8),
  },
  skeletonActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(12),
  },
});

export default FarmerDashboardScreen;
