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
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const SalesReportScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Mock data for sales report - replace with actual API call
  const [salesData, setSalesData] = useState({
    totalSales: 125000,
    totalOrders: 245,
    averageOrderValue: 510,
    topSellingProducts: [
      { name: 'Tomatoes', sales: 25000, quantity: 500 },
      { name: 'Onions', sales: 20000, quantity: 400 },
      { name: 'Carrots', sales: 18000, quantity: 360 },
      { name: 'Spinach', sales: 15000, quantity: 300 },
    ],
    monthlyData: [
      { month: 'Jan', sales: 10000 },
      { month: 'Feb', sales: 12000 },
      { month: 'Mar', sales: 15000 },
      { month: 'Apr', sales: 18000 },
      { month: 'May', sales: 20000 },
      { month: 'Jun', sales: 22000 },
    ],
    recentOrders: [
      { id: 1, customer: 'John Doe', amount: 850, date: '2024-01-15', status: 'Completed' },
      { id: 2, customer: 'Jane Smith', amount: 650, date: '2024-01-14', status: 'Completed' },
      { id: 3, customer: 'Mike Johnson', amount: 1200, date: '2024-01-13', status: 'Pending' },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    // Simulate loading sales data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleExportReport = () => {
    // Implement export functionality
    console.log('Exporting sales report...');
  };

  const handleViewOrderDetails = (order) => {
    console.log('Viewing order details:', order);
  };

  const StatCard = ({ title, value, icon, color = '#019a34' }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>₹{value.toLocaleString()}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sales Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Sales"
          value={salesData.totalSales}
          icon="rupee"
          color="#019a34"
        />
        <StatCard
          title="Total Orders"
          value={salesData.totalOrders}
          icon="shopping-cart"
          color="#007bff"
        />
        <StatCard
          title="Avg Order Value"
          value={salesData.averageOrderValue}
          icon="chart-line"
          color="#28a745"
        />
        <StatCard
          title="Growth Rate"
          value={15.5}
          icon="trending-up"
          color="#ffc107"
        />
      </View>
    </View>
  );

  const renderTopProducts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Selling Products</Text>
      {salesData.topSellingProducts.map((product, index) => (
        <View key={index} style={styles.productItem}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productQuantity}>{product.quantity} kg sold</Text>
          </View>
          <View style={styles.productSales}>
            <Text style={styles.productSalesValue}>₹{product.sales.toLocaleString()}</Text>
            <View style={styles.salesBar}>
              <View 
                style={[
                  styles.salesBarFill, 
                  { width: `${(product.sales / salesData.topSellingProducts[0].sales) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRecentOrders = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {salesData.recentOrders.map((order) => (
        <TouchableOpacity 
          key={order.id} 
          style={styles.orderItem}
          onPress={() => handleViewOrderDetails(order)}
        >
          <View style={styles.orderInfo}>
            <Text style={styles.customerName}>{order.customer}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.orderAmount}>₹{order.amount}</Text>
            <View style={[
              styles.statusBadge, 
              order.status === 'Completed' ? styles.completedBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                order.status === 'Completed' ? styles.completedText : styles.pendingText
              ]}>
                {order.status}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <View style={styles.skeletonStatsGrid}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.skeletonStatCard}>
              <SkeletonLoader height={p(40)} width={p(40)} borderRadius={p(20)} />
              <View style={styles.skeletonStatContent}>
                <SkeletonLoader height={p(16)} width="80%" borderRadius={p(4)} />
                <SkeletonLoader height={p(12)} width="60%" borderRadius={p(4)} />
              </View>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="50%" borderRadius={p(4)} />
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.skeletonProductItem}>
            <SkeletonLoader height={p(16)} width="40%" borderRadius={p(4)} />
            <SkeletonLoader height={p(12)} width="60%" borderRadius={p(4)} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Sales Report"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'weekly' && styles.activePeriodButton]}
              onPress={() => setSelectedPeriod('weekly')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.activePeriodButtonText]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'monthly' && styles.activePeriodButton]}
              onPress={() => setSelectedPeriod('monthly')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.activePeriodButtonText]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'yearly' && styles.activePeriodButton]}
              onPress={() => setSelectedPeriod('yearly')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'yearly' && styles.activePeriodButtonText]}>
                Yearly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
            <Icon name="download" size={16} color="#019a34" />
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>

          {renderStatsSection()}
          {renderTopProducts()}
          {renderRecentOrders()}
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(4),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: p(8),
    alignItems: 'center',
    borderRadius: p(6),
  },
  activePeriodButton: {
    backgroundColor: '#019a34',
  },
  periodButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderRadius: p(8),
    marginBottom: p(16),
    alignSelf: 'flex-end',
    gap: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(12),
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: p(12),
    borderRadius: p(8),
    flex: 1,
    minWidth: (width - p(60)) / 2,
  },
  statIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  statTitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  productQuantity: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  productSales: {
    alignItems: 'flex-end',
  },
  productSalesValue: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(4),
  },
  salesBar: {
    width: p(60),
    height: p(4),
    backgroundColor: '#e9ecef',
    borderRadius: p(2),
  },
  salesBarFill: {
    height: '100%',
    backgroundColor: '#019a34',
    borderRadius: p(2),
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  orderDate: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(4),
  },
  statusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  completedBadge: {
    backgroundColor: '#d4edda',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  completedText: {
    color: '#155724',
  },
  pendingText: {
    color: '#856404',
  },
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
  },
  skeletonStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(12),
    marginTop: p(16),
  },
  skeletonStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: p(12),
    borderRadius: p(8),
    flex: 1,
    minWidth: (width - p(60)) / 2,
  },
  skeletonStatContent: {
    flex: 1,
    marginLeft: p(12),
    gap: p(8),
  },
  skeletonProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: p(12),
  },
});

export default SalesReportScreen;
