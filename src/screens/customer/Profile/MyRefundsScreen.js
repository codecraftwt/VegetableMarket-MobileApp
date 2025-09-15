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
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyRefunds, clearRefundsError } from '../../../redux/slices/ordersSlice';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { createBackPressHandler } from '../../../utils/navigationUtils';

const MyRefundsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { refunds, refundsLoading, refundsError } = useSelector(state => state.orders);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyRefunds());
  }, [dispatch]);

  useEffect(() => {
    if (refundsError) {
      Alert.alert('Error', refundsError);
      dispatch(clearRefundsError());
    }
  }, [refundsError, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyRefunds()).unwrap();
    } catch (error) {
      // Error is already handled by the slice
    } finally {
      setRefreshing(false);
    }
  };

  const handleBackPress = createBackPressHandler(navigation, 'MyRefunds');

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'clock-o';
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'times-circle';
      default:
        return 'info-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'full':
        return '#2196F3';
      case 'partial':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RefundCard = ({ refund }) => {
    return (
      <View style={styles.refundCard}>
        {/* Refund Header */}
        <View style={styles.refundHeader}>
          <View style={styles.refundInfo}>
            <Text style={styles.refundId}>REF-{refund.id}</Text>
            <Text style={styles.orderId}>Order #{refund.order_id}</Text>
          </View>
          <View style={styles.refundAmount}>
            <Text style={styles.amountText}>₹{refund.amount}</Text>
          </View>
        </View>

        {/* Type and Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusItem}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(refund.type) }]}>
              <Text style={styles.typeText}>{refund.type}</Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Icon name={getStatusIcon(refund.status)} size={14} color={getStatusColor(refund.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(refund.status) }]}>
              {refund.status}
            </Text>
          </View>
        </View>

        {/* Requested Date */}
        <View style={styles.dateSection}>
          <Icon name="calendar" size={14} color="#666" />
          <Text style={styles.dateText}>Requested: {formatDate(refund.requested_at)}</Text>
        </View>

        {/* Rejection Reason - Only show if rejected */}
        {refund.status.toLowerCase() === 'rejected' && refund.rejected_reason && (
          <View style={styles.rejectionSection}>
            <Icon name="exclamation-triangle" size={14} color="#F44336" />
            <Text style={styles.rejectionText}>
              Reason: {refund.rejected_reason}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (refundsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader 
          screenName="My Refunds"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          navigation={navigation}
        />
        <View style={styles.loadingContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Skeleton Header Section */}
            <View style={styles.headerSection}>
              <SkeletonLoader type="text" width="60%" height={p(28)} style={styles.skeletonTitle} />
              <SkeletonLoader type="text" width="85%" height={p(16)} />
            </View>
            
            {/* Skeleton Refund Cards */}
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonRefundCard}>
                {/* Refund Header Skeleton */}
                <View style={styles.skeletonRefundHeader}>
                  <View style={styles.skeletonRefundInfo}>
                    <SkeletonLoader type="text" width="75%" height={p(22)} style={styles.skeletonLine} />
                    <SkeletonLoader type="text" width="55%" height={p(16)} />
                  </View>
                  <View style={styles.skeletonRefundAmount}>
                    <SkeletonLoader type="text" width="65%" height={p(22)} />
                  </View>
                </View>

                {/* Status Section Skeleton */}
                <View style={styles.skeletonStatusSection}>
                  <View style={styles.skeletonStatusItem}>
                    <SkeletonLoader type="category" width={p(50)} height={p(20)} borderRadius={p(10)} />
                  </View>
                  <View style={styles.skeletonStatusItem}>
                    <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                    <SkeletonLoader type="text" width="60%" height={p(16)} style={styles.skeletonStatusText} />
                  </View>
                </View>

                {/* Date Section Skeleton */}
                <View style={styles.skeletonDateSection}>
                  <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                  <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonDateText} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="My Refunds"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        navigation={navigation}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#019a34']} />
        }
      >
        {refunds.length > 0 ? (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Refund History</Text>
              <Text style={styles.sectionSubtitle}>
                Track your refund requests and their status
              </Text>
            </View>
            
            {refunds.map((refund) => (
              <RefundCard key={refund.id} refund={refund} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="money" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Refunds Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              You haven't requested any refunds yet
            </Text>
            <TouchableOpacity 
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('App', { screen: 'BucketTab' })}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: p(16),
  },

  // Header Section
  headerSection: {
    marginTop: p(16),
    marginBottom: p(12),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  sectionSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  
  // Refund Card
  refundCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  // Refund Header
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
    paddingBottom: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  refundInfo: {
    flex: 1,
  },
  refundId: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  orderId: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  refundAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },

  // Status Section
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
    paddingBottom: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  typeText: {
    fontSize: fontSizes.xs,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(6),
  },

  // Date Section
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  dateText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(6),
  },

  // Rejection Section
  rejectionSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffebee',
    padding: p(8),
    borderRadius: p(6),
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  rejectionText: {
    fontSize: fontSizes.xs,
    color: '#F44336',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(6),
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(64),
  },
  emptyStateTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(18),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(24),
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  shopNowText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(40),
  },

  // Skeleton styles
  skeletonTitle: {
    marginBottom: p(4),
  },
  skeletonLine: {
    marginBottom: p(4),
  },
  skeletonRefundCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  skeletonRefundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
    paddingBottom: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonRefundInfo: {
    flex: 1,
  },
  skeletonRefundAmount: {
    alignItems: 'flex-end',
  },
  skeletonStatusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(12),
    paddingBottom: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeletonStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonStatusText: {
    marginLeft: p(6),
  },
  skeletonDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  skeletonDateText: {
    marginLeft: p(6),
  },
});

export default MyRefundsScreen;
