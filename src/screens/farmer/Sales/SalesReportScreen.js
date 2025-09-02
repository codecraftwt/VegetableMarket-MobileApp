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
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalesReport, clearSalesReportError, clearSalesReport } from '../../../redux/slices/salesReportSlice';

const { width } = Dimensions.get('window');

const SalesReportScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { salesReport, loading, error } = useSelector(state => state.salesReport);
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setTempStartDate(thirtyDaysAgo);
    setTempEndDate(today);
    
    // Fetch initial data with proper date format
    fetchReportData(startDateStr, endDateStr);
  }, []);

  // Handle navigation focus to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (startDate && endDate) {
        fetchReportData(startDate, endDate);
      }
    });
    return unsubscribe;
  }, [navigation, startDate, endDate]);

  const fetchReportData = (start, end) => {
    console.log('Fetching sales report with dates:', { start, end });
    console.log('Date format check - Start:', start, 'End:', end);
    dispatch(clearSalesReport());
    dispatch(fetchSalesReport({ start_date: start, end_date: end }));
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleRefreshData = () => {
    // Refresh with current date range
    if (startDate && endDate) {
      fetchReportData(startDate, endDate);
    }
  };



  const handleDateRangeSelect = (range) => {
    const today = new Date();
    let start, end;
    
    switch (range) {
      case 'Last 7 Days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'Last 30 Days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'Last 90 Days':
        start = new Date(today);
        start.setDate(today.getDate() - 90);
        break;
      default:
        start = new Date(today);
        start.setDate(today.getDate() - 30);
    }
    
    end = today;
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setSelectedRange(range);
    setShowDateModal(false);
    
    fetchReportData(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setTempStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setTempEndDate(selectedDate);
    }
  };

  const handleCustomDateSubmit = () => {
    const startDateStr = tempStartDate.toISOString().split('T')[0];
    const endDateStr = tempEndDate.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setSelectedRange('Custom Range');
    setShowDateModal(false);
    fetchReportData(startDateStr, endDateStr);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderDateSelector = () => (
    <View style={styles.topSection}>
      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity 
          style={styles.dateRangeButton}
          onPress={() => setShowDateModal(true)}
        >
          <Icon name="calendar" size={18} color="#019a34" />
          <Text style={styles.dateRangeText}>
            {formatDate(startDate)} to {formatDate(endDate)}
          </Text>
          <Icon name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.exportButtons}>
        <TouchableOpacity style={styles.pdfButton}>
          <Icon name="file-pdf-o" size={16} color="#dc3545" />
          <Text style={styles.pdfButtonText}>Export PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.excelButton}>
          <Icon name="file-excel-o" size={16} color="#fff" />
          <Text style={styles.excelButtonText}>Export Excel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsCards = () => {
    const totalOrders = salesReport?.total_orders || 0;
    const totalRevenue = salesReport?.total_revenue || 0;
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Icon name="shopping-cart" size={20} color="#019a34" />
          </View>
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Icon name="rupee" size={20} color="#019a34" />
          </View>
          <Text style={styles.statValue}>₹{totalRevenue}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    console.log('Sales Report Data:', salesReport);
    
    // Check if we have data and if it's not all zeros
    const hasData = salesReport?.daily_revenue && salesReport?.daily_orders;
    const hasNonZeroData = hasData && (
      Object.values(salesReport.daily_revenue).some(val => Number(val) > 0) ||
      Object.values(salesReport.daily_orders).some(val => Number(val) > 0)
    );
    
    if (!hasData || !hasNonZeroData) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          <View style={styles.noDataContainer}>
            <Icon name="bar-chart" size={p(60)} color="#ccc" />
            <Text style={styles.noDataText}>No sales data available for the selected period</Text>
          </View>
        </View>
      );
    }

    const revenueData = Object.entries(salesReport.daily_revenue);
    const ordersData = Object.entries(salesReport.daily_orders);
    
    const labels = revenueData.map(([date]) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    const revenueValues = revenueData.map(([, value]) => Number(value) || 0);
    const orderValues = ordersData.map(([, value]) => Number(value) || 0);

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: revenueValues,
          color: (opacity = 1) => `rgba(1, 154, 52, ${opacity})`, // Green color
          strokeWidth: 3,
        },
        {
          data: orderValues,
          color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Light green color
          strokeWidth: 3,
        },
      ],
    };

    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#019a34',
      },
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <LineChart
          data={chartData}
          width={width - p(64)}
          height={p(220)}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#019a34' }]} />
            <Text style={styles.legendText}>Revenue (₹)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
            <Text style={styles.legendText}>Total Orders</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTopVegetables = () => {
    const hasVegetableData = salesReport?.top_vegetables && salesReport.top_vegetables.length > 0;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="star" size={20} color="#019a34" />
          <Text style={styles.sectionTitle}>Top Vegetables Sold</Text>
        </View>
        
        {hasVegetableData ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Vegetable</Text>
              <Text style={styles.tableHeaderText}>Quantity Sold</Text>
              <Text style={styles.tableHeaderText}>Total Earnings</Text>
            </View>
            
            {salesReport.top_vegetables.map((vegetable, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.vegetableName}>{vegetable.name}</Text>
                <Text style={styles.vegetableQuantity}>
                  {vegetable.total_quantity} {vegetable.unit_type}
                </Text>
                <Text style={styles.vegetableEarnings}>₹{vegetable.total_earnings}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="leaf" size={p(40)} color="#ccc" />
            <Text style={styles.noDataText}>No vegetable sales data available</Text>
          </View>
        )}
      </View>
    );
  };

  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dateModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickRanges}>
            <Text style={styles.quickRangeTitle}>Quick Range</Text>
            {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.quickRangeButton, selectedRange === range && styles.activeQuickRange]}
                onPress={() => handleDateRangeSelect(range)}
              >
                <Text style={[styles.quickRangeText, selectedRange === range && styles.activeQuickRangeText]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.customRange}>
            <Text style={styles.customRangeTitle}>Custom Range</Text>
            <View style={styles.dateInputs}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon name="calendar" size={16} color="#019a34" />
                  <Text style={styles.datePickerText}>
                    {tempStartDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Icon name="calendar" size={16} color="#019a34" />
                  <Text style={styles.datePickerText}>
                    {tempEndDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleCustomDateSubmit}>
              <Text style={styles.submitButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <View style={styles.skeletonStats}>
          {[1, 2].map((index) => (
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
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(200)} width="100%" borderRadius={p(8)} />
      </View>
      
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="50%" borderRadius={p(4)} />
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.skeletonVegetableItem}>
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
          {renderDateSelector()}
          {renderStatsCards()}
          {renderChart()}
          {renderTopVegetables()}
          
          {/* Debug Section - Remove in production */}
          {__DEV__ && salesReport && (
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>Total Orders: {salesReport.total_orders}</Text>
              <Text style={styles.debugText}>Total Revenue: {salesReport.total_revenue}</Text>
              <Text style={styles.debugText}>Has Daily Revenue: {salesReport.daily_revenue ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>Has Daily Orders: {salesReport.daily_orders ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>Top Vegetables Count: {salesReport.top_vegetables?.length || 0}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Date Selection Modal */}
      {renderDateModal()}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={tempStartDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={tempEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: p(16),
  },
  topSection: {
    marginBottom: p(24),
  },
  dateSelectorContainer: {
    marginBottom: p(16),
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: p(20),
    paddingVertical: p(16),
    borderRadius: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateRangeText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: p(12),
    justifyContent: 'space-between',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: p(6),
    borderWidth: 1,
    borderColor: '#019a34',
    flex: 1,
  },
  refreshButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },

  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: p(6),
    borderWidth: 1,
    borderColor: '#dc3545',
    flex: 1,
  },
  pdfButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc3545',
  },
  excelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: p(6),
    flex: 1,
  },
  excelButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: p(16),
    marginBottom: p(24),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#019a3420',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: p(24),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(2),
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chartTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(16),
  },
  chart: {
    marginVertical: p(8),
    borderRadius: p(16),
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: p(20),
    marginTop: p(16),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(6),
  },
  legendColor: {
    width: p(12),
    height: p(12),
    borderRadius: p(2),
  },
  legendText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(16),
    gap: p(8),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: p(12),
    borderBottomWidth: 2,
    borderBottomColor: '#019a34',
    marginBottom: p(8),
  },
  tableHeaderText: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  vegetableName: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  vegetableQuantity: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  vegetableEarnings: {
    flex: 1,
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    paddingVertical: p(20),
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(40),
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateModalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    width: '90%',
    maxWidth: p(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: p(20),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  quickRanges: {
    padding: p(20),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickRangeTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(12),
  },
  quickRangeButton: {
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    marginBottom: p(8),
  },
  activeQuickRange: {
    backgroundColor: '#019a34',
  },
  quickRangeText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  activeQuickRangeText: {
    color: '#fff',
  },
  customRange: {
    padding: p(20),
  },
  customRangeTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(12),
  },
  dateInputs: {
    gap: p(12),
    marginBottom: p(16),
  },
  dateInputContainer: {
    gap: p(6),
  },
  dateInputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(12),
    gap: p(8),
  },
  datePickerText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    borderRadius: p(8),
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  // Skeleton styles
  skeletonContainer: {
    padding: p(16),
    gap: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: p(12),
    marginTop: p(16),
  },
  skeletonStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: p(12),
    borderRadius: p(8),
  },
  skeletonStatContent: {
    flex: 1,
    marginLeft: p(12),
    gap: p(8),
  },
  skeletonVegetableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: p(12),
  },
  // Debug styles
  debugSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    marginTop: p(16),
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    color: '#495057',
    marginBottom: p(8),
  },
  debugText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
    marginBottom: p(4),
  },
});

export default SalesReportScreen;