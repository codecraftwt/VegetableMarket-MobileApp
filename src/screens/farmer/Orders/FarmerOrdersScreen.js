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
import CommonHeader from '../../../components/CommonHeader';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFarmerOrders, clearFarmerOrdersError, clearFarmerOrdersSuccess } from '../../../redux/slices/farmerOrdersSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal'; 

const FarmerOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, loading, error, success, message } = useSelector(state => state.farmerOrders);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    // Fetch orders data from API
    dispatch(fetchFarmerOrders());
  }, [dispatch]);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh orders data when screen comes into focus
      dispatch(fetchFarmerOrders());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  // Filter orders based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order =>
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery) ||
        order.delivery_address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.payment_status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery_status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [orders, searchQuery]);

  // Handle error states only (remove success modal)
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'cards' ? 'list' : 'cards');
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Icon name="times" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'delivered':
        return '#28a745';
      case 'canceled':
        return '#dc3545';
      case 'in_transit':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffc107';
      case 'paid':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const renderOrderCard = (order) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FarmerOrderDetails', { orderId: order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <Text style={styles.amountText}>₹{order.total_amount}</Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="user" size={14} color="#666" />
          <Text style={styles.detailText}>{order.customer_name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={14} color="#666" />
          <Text style={styles.detailText}>{order.delivery_address.city}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.delivery_status) }]}>
          <Text style={styles.statusText}>{order.delivery_status}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(order.payment_status) }]}>
          <Text style={styles.statusText}>{order.payment_status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.orderIdColumn]}>Order ID</Text>
      <Text style={[styles.tableHeaderText, styles.customerColumn]}>Customer</Text>
      <Text style={[styles.tableHeaderText, styles.amountColumn]}>Total Amount</Text>
      <Text style={[styles.tableHeaderText, styles.dateColumn]}>Ordered Date</Text>
      <Text style={[styles.tableHeaderText, styles.statusColumn]}>Payment Status</Text>
      <Text style={[styles.tableHeaderText, styles.statusColumn]}>Delivery Status</Text>
      <Text style={[styles.tableHeaderText, styles.deliveryBoyColumn]}>Assigned Delivery Boy</Text>
      <Text style={[styles.tableHeaderText, styles.actionColumn]}>Action</Text>
    </View>
  );

  const renderTableRow = (order) => (
    <TouchableOpacity key={order.id} style={styles.tableRow} activeOpacity={0.7}>
      <Text style={[styles.tableCellText, styles.orderIdColumn]}>#{order.id}</Text>
      <Text style={[styles.tableCellText, styles.customerColumn]} numberOfLines={1}>
        {order.customer_name}
      </Text>
      <Text style={[styles.tableCellText, styles.amountColumn]}>₹{order.total_amount}</Text>
      <Text style={[styles.tableCellText, styles.dateColumn]} numberOfLines={1}>
        {new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </Text>
      <View style={styles.statusColumn}>
        <View style={[styles.tableStatusBadge, { backgroundColor: getPaymentStatusColor(order.payment_status) }]}>
          <Text style={styles.tableStatusText}>{order.payment_status}</Text>
        </View>
      </View>
      <View style={styles.statusColumn}>
        <View style={[styles.tableStatusBadge, { backgroundColor: getStatusColor(order.delivery_status) }]}>
          <Text style={styles.tableStatusText}>{order.delivery_status}</Text>
        </View>
      </View>
      <Text style={[styles.tableCellText, styles.deliveryBoyColumn]} numberOfLines={1}>
        {order.assigned_delivery_boy || 'Not Assigned'}
      </Text>
      <View style={styles.actionColumn}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('FarmerOrderDetails', { orderId: order.id })}
        >
          <Icon name="eye" size={14} color="#019a34" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.skeletonCard}>
          <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="60%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
          <SkeletonLoader height={p(16)} width="50%" borderRadius={p(4)} />
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={p(80)} color="#ccc" />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        You haven't received any orders yet. Your orders will appear here once customers start placing them.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Orders"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Orders</Text>
            <TouchableOpacity style={styles.viewModeButton} onPress={toggleViewMode}>
              <Icon 
                name={viewMode === 'cards' ? 'list' : 'th-large'} 
                size={16} 
                color="#019a34" 
              />
            </TouchableOpacity>
          </View>

          {renderSearchBar()}

          {filteredOrders.length === 0 && searchQuery.trim() !== '' ? (
            <View style={styles.noResultsContainer}>
              <Icon name="search" size={p(60)} color="#ccc" />
              <Text style={styles.noResultsTitle}>No Results Found</Text>
              <Text style={styles.noResultsSubtitle}>
                No orders match your search "{searchQuery}"
              </Text>
              <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {viewMode === 'cards' ? (
                <View style={styles.ordersList}>
                  {filteredOrders.map(renderOrderCard)}
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
                  <View style={styles.tableContainer}>
                    {renderTableHeader()}
                    {filteredOrders.map(renderTableRow)}
                  </View>
                </ScrollView>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmerOrdersError());
        }}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  viewModeButton: {
    backgroundColor: '#fff',
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ordersList: {
    gap: p(12),
    paddingBottom: p(20),
  },
  ordersListContainer: {
    paddingBottom: p(20),
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(2),
  },
  orderDate: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  amountText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  orderDetails: {
    marginBottom: p(8),
    gap: p(4),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(6),
  },
  detailText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    gap: p(8),
  },
  statusBadge: {
    paddingHorizontal: p(6),
    paddingVertical: p(3),
    borderRadius: p(8),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  // Table view styles
  tableScrollContainer: {
    flex: 1,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: p(800), // Minimum width to ensure all columns are visible
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: p(16),
    paddingHorizontal: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tableHeaderText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#495057',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: p(16),
    paddingHorizontal: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    alignItems: 'center',
    minHeight: p(60),
  },
  tableCellText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    textAlign: 'center',
  },
  // Column widths with proper spacing
  orderIdColumn: {
    width: p(80),
    textAlign: 'left',
    paddingRight: p(8),
  },
  customerColumn: {
    width: p(120),
    textAlign: 'left',
    paddingRight: p(8),
  },
  amountColumn: {
    width: p(100),
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    paddingRight: p(8),
  },
  dateColumn: {
    width: p(100),
    paddingRight: p(8),
  },
  statusColumn: {
    width: p(120),
    alignItems: 'center',
    paddingRight: p(8),
  },
  deliveryBoyColumn: {
    width: p(140),
    textAlign: 'left',
    paddingRight: p(8),
  },
  actionColumn: {
    width: p(80),
    alignItems: 'center',
  },
  tableStatusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(6),
    minWidth: p(80),
  },
  tableStatusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    padding: p(8),
    borderRadius: p(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search bar styles
  searchContainer: {
    marginBottom: p(20),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(6),
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  clearButton: {
    padding: p(4),
    marginLeft: p(8),
  },
  // No results styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
    minHeight: p(300),
  },
  noResultsTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  noResultsSubtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: p(30),
    lineHeight: p(24),
  },
  clearSearchButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
  },
  clearSearchButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    gap: p(8),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(24),
  },
});

export default FarmerOrdersScreen;

