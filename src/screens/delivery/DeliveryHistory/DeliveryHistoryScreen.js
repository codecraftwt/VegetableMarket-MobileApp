import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { fetchDeliveryHistory } from '../../../redux/slices/deliveryHistorySlice';

const DeliveryHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { deliveries, loading, error } = useSelector(state => state.deliveryHistory);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      loadDeliveryHistory();
    }, [])
  );

  useEffect(() => {
    filterDeliveries();
  }, [searchQuery, selectedFilter, deliveries]);

  const loadDeliveryHistory = async () => {
    try {
      await dispatch(fetchDeliveryHistory());
    } catch (error) {
      console.log('Error loading delivery history:', error);
    }
  };

  const filterDeliveries = () => {
    let filtered = deliveries || [];

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.delivery_status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(delivery =>
        delivery.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (delivery.customer && delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredDeliveries(filtered);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDeliveryPress = (delivery) => {
    // Navigate to delivery details
    console.log('Delivery pressed:', delivery);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'failed':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name="star"
          size={p(12)}
          color={i <= rating ? '#ffc107' : '#e9ecef'}
        />
      );
    }
    return stars;
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={p(16)} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search delivery history..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times" size={p(16)} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {['all', 'completed', 'cancelled'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.activeFilterButtonText,
            ]}
          >
            {filter === 'all' ? 'All' : getStatusText(filter)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDeliveryCard = (delivery) => {
    const customerName = delivery.customer ? delivery.customer.name : 'Customer';
    const customerPhone = delivery.customer ? delivery.customer.phone : 'N/A';
    
    const items = delivery.order_items ? 
      delivery.order_items.map(item => `${item.quantity_kg}kg`).join(', ') : 
      'Items not available';

    const deliveryAssignment = delivery.delivery_assignments && delivery.delivery_assignments.length > 0 
      ? delivery.delivery_assignments[0] 
      : null;

    const deliveryDate = deliveryAssignment && deliveryAssignment.delivered_time 
      ? new Date(deliveryAssignment.delivered_time).toLocaleDateString()
      : new Date(delivery.created_at).toLocaleDateString();

    const deliveryTime = deliveryAssignment && deliveryAssignment.delivered_time 
      ? new Date(deliveryAssignment.delivered_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

    return (
      <TouchableOpacity
        key={delivery.id}
        style={styles.deliveryCard}
        onPress={() => handleDeliveryPress(delivery)}
      >
        <View style={styles.deliveryHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{delivery.id}</Text>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.delivery_status) }]}>
            <Text style={styles.statusText}>{getStatusText(delivery.delivery_status)}</Text>
          </View>
        </View>

        <View style={styles.deliveryDetails}>
          <View style={styles.detailRow}>
            <Icon name="phone" size={p(14)} color="#666" />
            <Text style={styles.detailText}>{customerPhone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="credit-card" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Payment: {delivery.payment_method} ({delivery.payment_status})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Delivered: {deliveryDate} at {deliveryTime}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryFooter}>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsLabel}>Items:</Text>
            <Text style={styles.itemsText}>{items}</Text>
          </View>
          <Text style={styles.totalAmount}>₹{delivery.total_amount}</Text>
        </View>

        {delivery.delivery_status === 'delivered' && (
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Delivery Status:</Text>
              <Text style={styles.ratingValue}>Successfully Delivered</Text>
            </View>
            {deliveryAssignment && deliveryAssignment.delivered_time && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackLabel}>Delivery Time:</Text>
                <Text style={styles.feedbackText}>
                  {new Date(deliveryAssignment.delivered_time).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStatsSummary = () => {
    const totalDeliveries = deliveries ? deliveries.length : 0;
    const completedDeliveries = deliveries ? deliveries.filter(d => d.delivery_status === 'delivered').length : 0;
    const cancelledDeliveries = deliveries ? deliveries.filter(d => d.delivery_status === 'cancelled').length : 0;
    const totalRevenue = deliveries ? deliveries.reduce((sum, d) => sum + parseFloat(d.total_amount || 0), 0) : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalDeliveries}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedDeliveries}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cancelledDeliveries}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Delivery History"
        showBackButton={true}
        showNotification={true}
        onBackPress={handleBackPress}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map((index) => (
              <View key={index} style={styles.skeletonCard}>
                <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
                <SkeletonLoader height={p(16)} width="40%" borderRadius={p(4)} />
                <SkeletonLoader height={p(14)} width="80%" borderRadius={p(4)} />
                <SkeletonLoader height={p(14)} width="70%" borderRadius={p(4)} />
              </View>
            ))}
          </View>
        ) : (
          <>
            {renderStatsSummary()}
            {renderSearchBar()}
            {renderFilterButtons()}

            <ScrollView style={styles.deliveriesList} showsVerticalScrollIndicator={false}>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(renderDeliveryCard)
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="history" size={p(60)} color="#ccc" />
                  <Text style={styles.emptyText}>No delivery history found</Text>
                  <Text style={styles.emptySubtext}>
                    {searchQuery ? 'Try adjusting your search' : 'No deliveries completed yet'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>
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
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: p(20),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(4),
  },
  statLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  searchContainer: {
    marginBottom: p(16),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(12),
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: p(12),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: p(16),
    gap: p(8),
  },
  filterButton: {
    paddingHorizontal: p(16),
    paddingVertical: p(8),
    borderRadius: p(20),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterButton: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  filterButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  deliveriesList: {
    flex: 1,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(4),
  },
  customerName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(16),
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  deliveryDetails: {
    marginBottom: p(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  detailText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginLeft: p(8),
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  itemsContainer: {
    flex: 1,
  },
  itemsLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  itemsText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  totalAmount: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  ratingSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: p(12),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  ratingLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginRight: p(8),
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: p(8),
  },
  ratingValue: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  feedbackContainer: {
    marginTop: p(4),
  },
  feedbackLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(2),
  },
  feedbackText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    gap: p(8),
  },
});

export default DeliveryHistoryScreen;
