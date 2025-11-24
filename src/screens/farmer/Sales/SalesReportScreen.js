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
  Alert,
  PermissionsAndroid,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSalesReport,
  clearSalesReport,
} from '../../../redux/slices/salesReportSlice';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const SalesReportScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { salesReport, loading} = useSelector(state => state.salesReport);

  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastGeneratedFile, setLastGeneratedFile] = useState(null);

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

  // Format date for API (ensure YYYY-MM-DD format)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const fetchReportData = (start, end) => {
    const formattedStart = formatDateForAPI(start);
    const formattedEnd = formatDateForAPI(end);

    dispatch(clearSalesReport());
    dispatch(fetchSalesReport({ start_date: formattedStart, end_date: formattedEnd }));
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

  // Get the best available file path for saving files
  const getFileSavePath = async (fileName) => {
    if (Platform.OS === 'android') {
      // Always try Downloads first for better user experience
      try {
        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        return downloadPath;
      } catch (error) {
        return `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }
    } else {
      // iOS - use Documents directory
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
  };

  // Ensure directory exists before saving file
  const ensureDirectoryExists = async (filePath) => {
    try {
      const directory = filePath.substring(0, filePath.lastIndexOf('/'));
      const exists = await RNFS.exists(directory);
      if (!exists) {
        await RNFS.mkdir(directory);
      }
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  };

  // Check if Downloads directory is accessible
  const checkDownloadsAccess = async () => {
    try {
      const downloadPath = RNFS.DownloadDirectoryPath;
      // Try to list contents to check access
      const contents = await RNFS.readDir(downloadPath);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Request storage permissions for file operations
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        // For Android 13+ (API 33+)
        if (androidVersion >= 33) {
          try {
            const manageStorageGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'This app needs access to storage to save PDF and Excel files to your Downloads folder.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (manageStorageGranted === PermissionsAndroid.RESULTS.GRANTED) {
              return true;
            }
          } catch (error) {
            console.log('MANAGE_EXTERNAL_STORAGE not available, trying other permissions');
          }

          // Request media permissions for Android 13+
          const mediaPermissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ];

          const mediaResults = await PermissionsAndroid.requestMultiple(mediaPermissions);
          // Check if at least one media permission is granted
          const hasMediaPermission = Object.values(mediaResults).some(
            result => result === PermissionsAndroid.RESULTS.GRANTED
          );

          return hasMediaPermission;
        } else {
          // For Android 12 and below, request WRITE_EXTERNAL_STORAGE
          const writeStorageGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to storage to save PDF and Excel files to your Downloads folder.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return writeStorageGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.error('Storage permission error:', err);
        return false;
      }
    }
    return true;
  };

  // Generate PDF content
  const generatePDFContent = () => {
    const totalOrders = salesReport?.total_orders || 0;
    const totalRevenue = salesReport?.total_revenue || 0;

    let content = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #019a34; text-align: center; margin-bottom: 30px;">Sales Report</h1>
        
        <div style="margin-bottom: 20px;">
          <h3>Report Period</h3>
          <p><strong>From:</strong> ${formatDate(startDate)}</p>
          <p><strong>To:</strong> ${formatDate(endDate)}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3>Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Orders</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${totalOrders}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Revenue</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">₹${totalRevenue}</td>
            </tr>
          </table>
        </div>
    `;

    // Add top vegetables if available
    if (salesReport?.top_vegetables && salesReport.top_vegetables.length > 0) {
      content += `
        <div style="margin-bottom: 30px;">
          <h3>Top Vegetables Sold</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #019a34; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">Vegetable</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Quantity Sold</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Total Earnings</th>
            </tr>
      `;

      salesReport.top_vegetables.forEach((vegetable, index) => {
        content += `
          <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
            <td style="padding: 10px; border: 1px solid #ddd;">${vegetable.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${vegetable.total_quantity} ${vegetable.unit_type}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">₹${vegetable.total_earnings}</td>
          </tr>
        `;
      });

      content += `</table></div>`;
    }

    content += `
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    `;

    return content;
  };

  // Generate Excel data
  const generateExcelData = () => {
    const totalOrders = salesReport?.total_orders || 0;
    const totalRevenue = salesReport?.total_revenue || 0;

    // Summary sheet
    const summaryData = [
      ['Sales Report Summary'],
      [''],
      ['Report Period', 'From', formatDate(startDate), 'To', formatDate(endDate)],
      [''],
      ['Total Orders', totalOrders],
      ['Total Revenue', `₹${totalRevenue}`],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];

    // Top vegetables sheet
    let vegetablesData = [['Top Vegetables Sold'], ['']];
    if (salesReport?.top_vegetables && salesReport.top_vegetables.length > 0) {
      vegetablesData.push(['Vegetable', 'Quantity Sold', 'Unit Type', 'Total Earnings']);
      salesReport.top_vegetables.forEach(vegetable => {
        vegetablesData.push([
          vegetable.name,
          vegetable.total_quantity,
          vegetable.unit_type,
          `₹${vegetable.total_earnings}`
        ]);
      });
    } else {
      vegetablesData.push(['No vegetable sales data available']);
    }

    return { summaryData, vegetablesData };
  };

  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      setErrorMessage('Please select a date range first');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsExportingPDF(true);

      // Check current permission status first
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        // Check basic storage permission
        try {
          const hasReadStorage = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          if (androidVersion < 33) {
            const hasWriteStorage = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
          }
        } catch (error) {
          console.log('Error checking permissions:', error);
        }
      }

      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        setIsExportingPDF(false);
        setErrorMessage('Storage permission is required to save PDF files. Please grant permission in your device settings.\n\nGo to: Settings > Apps > VegetableMarket > Permissions > Storage');
        setShowErrorModal(true);
        return;
      }

      // Check Downloads access
      const downloadsAccessible = await checkDownloadsAccess();
      if (!downloadsAccessible) {
        console.log('Downloads not accessible, will use Documents directory');
      }

      // Generate PDF
      const pdf = new jsPDF();
      const content = generatePDFContent();

      // Create a simple PDF with text content
      pdf.setFontSize(20);
      pdf.setTextColor(1, 154, 52); // Green color
      pdf.text('Sales Report', 105, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, 20, 40);

      const totalOrders = salesReport?.total_orders || 0;
      const totalRevenue = salesReport?.total_revenue || 0;

      pdf.text(`Total Orders: ${totalOrders}`, 20, 60);
      pdf.text(`Total Revenue: ₹${totalRevenue}`, 20, 80);

      // Add top vegetables if available
      if (salesReport?.top_vegetables && salesReport.top_vegetables.length > 0) {
        pdf.text('Top Vegetables Sold:', 20, 110);
        let yPosition = 130;
        salesReport.top_vegetables.forEach((vegetable, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${index + 1}. ${vegetable.name} - ${vegetable.total_quantity} ${vegetable.unit_type} - ₹${vegetable.total_earnings}`, 20, yPosition);
          yPosition += 15;
        });
      }

      // Save PDF
      const fileName = `SalesReport_${startDate}_to_${endDate}.pdf`;
      const filePath = await getFileSavePath(fileName);

      // Ensure directory exists
      await ensureDirectoryExists(filePath);

      const pdfData = pdf.output('datauristring');
      const base64Data = pdfData.split(',')[1];

      await RNFS.writeFile(filePath, base64Data, 'base64');

      setIsExportingPDF(false);
      setLastGeneratedFile({ path: filePath, name: fileName });

      const saveLocation = filePath.includes('DownloadDirectoryPath')
        ? 'Downloads folder'
        : 'Documents folder';
      setSuccessMessage(`PDF report saved to ${saveLocation}: ${fileName}\n\nYou can find it in your ${saveLocation} or use the Share button to send it.`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('PDF export error:', error);
      setIsExportingPDF(false);

      let errorMessage = 'Failed to export PDF. ';
      if (error.message?.includes('permission')) {
        errorMessage += 'Please grant storage permission in your device settings and try again.';
      } else if (error.message?.includes('ENOENT')) {
        errorMessage += 'Unable to access storage. Please check your device storage and try again.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }

      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      setErrorMessage('Please select a date range first');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsExportingExcel(true);

      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        setIsExportingExcel(false);
        setErrorMessage('Storage permission is required to save Excel files. Please grant permission in your device settings.\n\nGo to: Settings > Apps > VegetableMarket > Permissions > Storage');
        setShowErrorModal(true);
        return;
      }

      // Check Downloads access
      const downloadsAccessible = await checkDownloadsAccess();
      if (!downloadsAccessible) {
        console.log('Downloads not accessible, will use Documents directory');
      }

      // Generate Excel data
      const { summaryData, vegetablesData } = generateExcelData();

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add summary sheet
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Add vegetables sheet
      const vegetablesSheet = XLSX.utils.aoa_to_sheet(vegetablesData);
      XLSX.utils.book_append_sheet(workbook, vegetablesSheet, 'Top Vegetables');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      // Save Excel file
      const fileName = `SalesReport_${startDate}_to_${endDate}.xlsx`;
      const filePath = await getFileSavePath(fileName);

      // Ensure directory exists
      await ensureDirectoryExists(filePath);

      await RNFS.writeFile(filePath, excelBuffer, 'base64');

      setIsExportingExcel(false);
      setLastGeneratedFile({ path: filePath, name: fileName });

      const saveLocation = filePath.includes('DownloadDirectoryPath')
        ? 'Downloads folder'
        : 'Documents folder';
      setSuccessMessage(`Excel report saved to ${saveLocation}: ${fileName}\n\nYou can find it in your ${saveLocation} or use the Share button to send it.`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Excel export error:', error);
      setIsExportingExcel(false);

      let errorMessage = 'Failed to export Excel. ';
      if (error.message?.includes('permission')) {
        errorMessage += 'Please grant storage permission in your device settings and try again.';
      } else if (error.message?.includes('ENOENT')) {
        errorMessage += 'Unable to access storage. Please check your device storage and try again.';
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }

      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  // Share generated file
  const shareFile = async (filePath, fileName) => {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);

      if (!fileExists) {
        Alert.alert('Error', 'File not found. Please try generating the report again.');
        return;
      }

      const shareOptions = {
        title: 'Sales Report',
        message: `Here's the sales report: ${fileName}`,
        url: `file://${filePath}`,
        type: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      await Share.open(shareOptions);
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share the file. Please try again.');
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
      <View style={styles.dateAndExportRow}>
        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => setShowDateModal(true)}
        >
          <Icon name="calendar" size={16} color="#019a34" />
          <Text style={styles.dateRangeText}>
            {formatDate(startDate)} to {formatDate(endDate)}
          </Text>
          <Icon name="chevron-down" size={12} color="#666" />
        </TouchableOpacity>

        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={[styles.pdfButton, isExportingPDF && styles.exportButtonDisabled]}
            onPress={handleExportPDF}
            disabled={isExportingPDF || isExportingExcel}
          >
            {isExportingPDF ? (
              <Icon name="spinner" size={16} color="#dc3545" />
            ) : (
              <Icon name="file-pdf-o" size={16} color="#dc3545" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.excelButton, isExportingExcel && styles.exportButtonDisabled]}
            onPress={handleExportExcel}
            disabled={isExportingPDF || isExportingExcel}
          >
            {isExportingExcel ? (
              <Icon name="spinner" size={16} color="#fff" />
            ) : (
              <Icon name="file-excel-o" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
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
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Icon name="rupee" size={20} color="#019a34" />
          </View>
          <Text style={styles.statValue}>₹{totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenuenpm install react-native-fs</Text>
        </View>
      </View>
    );
  };

  const renderChart = () => {
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
      color: (opacity = 1) => `rgba(1, 154, 52, ${opacity})`,
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

    // Calculate chart width based on number of data points
    const minWidth = Dimensions.get('window').width - 80;
    const dataPoints = labels.length;
    const chartWidth = Math.max(minWidth, dataPoints * 60);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sales Trend</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.chartScrollContainer}
          style={styles.chartScrollView}
        >
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withDots={true}
            withShadow={false}
            withScrollableDot={false}
          />
        </ScrollView>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#019a34' }]} />
            <Text style={styles.legendText}>Revenue (₹)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#28a745' }]} />
            <Text style={styles.legendText}>Orders</Text>
          </View>
        </View>
        {dataPoints > 5 && (
          <Text style={styles.scrollHint}>
            ← Swipe horizontally to view all dates →
          </Text>
        )}
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
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
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

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Export Complete!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
        showSecondaryButton={!!lastGeneratedFile}
        secondaryButtonText="Share"
        onSecondaryButtonPress={lastGeneratedFile ? () => {
          shareFile(lastGeneratedFile.path, lastGeneratedFile.name);
          setShowSuccessModal(false);
        } : undefined}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Export Failed"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />
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
  dateAndExportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  dateRangeButton: {
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
    gap: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
  },
  dateRangeText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: p(6),
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: p(36),
    height: p(36),
    borderRadius: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  excelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    width: p(36),
    height: p(36),
    borderRadius: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  exportButtonDisabled: {
    opacity: 0.6,
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

  chartScrollView: {
    maxHeight: p(240),
  },
  chartScrollContainer: {
    paddingRight: p(20),
  },
  scrollHint: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: p(8),
    fontStyle: 'italic',
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

});

export default SalesReportScreen;