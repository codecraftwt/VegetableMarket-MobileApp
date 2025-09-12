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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { fetchTodaysTasks, fetchTodaysTaskSummary, updateTaskStatus, updateOrderStatus, updateAssignmentStatus, updatePaymentStatus } from '../../../redux/slices/todaysTaskSlice';

const TodaysTaskScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tasks, summary, loading, summaryLoading, error, loading: updatePaymentStatusLoading } = useSelector(state => state.todaysTask);
  
  useFocusEffect(
    React.useCallback(() => {
      loadTodaysTasks();
    }, [])
  );

  const loadTodaysTasks = async () => {
    try {
      // Fetch both tasks and summary data
      await Promise.all([
        dispatch(fetchTodaysTasks()),
        dispatch(fetchTodaysTaskSummary())
      ]);
    } catch (error) {
      console.log('Error loading today\'s tasks:', error);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleTaskPress = (task) => {
    // Navigate to task details screen
    navigation.navigate('TodaysTaskDetails', { taskData: task });
  };

  const handleStatusChange = (taskId, newStatus) => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to mark this delivery as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Map status to API format
            let apiStatus = newStatus;
            if (newStatus === 'in_progress') {
              apiStatus = 'out_for_delivery';
            }
            
            dispatch(updateOrderStatus({ orderId: taskId, status: apiStatus }));
            
            if (newStatus === 'delivered') {
              setCompletedTasks(prev => prev + 1);
            } else if (newStatus === 'ready_for_delivery') {
              setCompletedTasks(prev => Math.max(0, prev - 1));
            }
          },
        },
      ]
    );
  };

  const handlePaymentStatusChange = (orderId, paymentStatus) => {
    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to mark payment as ${paymentStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(updatePaymentStatus({ orderId, paymentStatus }));
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_delivery':
        return '#ffc107';
      case 'in_progress':
        return '#019a34';
      case 'delivered':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready_for_delivery':
        return 'Ready for Delivery';
      case 'in_progress':
        return 'In Progress';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const renderTaskCard = (task) => {
    const address = task.delivery_address ? 
      `${task.delivery_address.address_line}, ${task.delivery_address.city}` : 
      'Address not available';
    
    const items = task.order_items ? 
      task.order_items.map(item => `${item.vegetable.name} (${item.quantity_kg}kg)`).join(', ') : 
      'Items not available';

    return (
      <TouchableOpacity
        key={task.id}
        style={styles.taskCard}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.taskInfo}>
            <View style={styles.orderIdContainer}>
              <Icon name="hashtag" size={p(12)} color="#2563eb" />
              <Text style={styles.orderId}>{task.id}</Text>
            </View>
            <Text style={styles.customerName}>
              {task.uniqueFarmers && task.uniqueFarmers.length > 0 ? 
                task.uniqueFarmers[0].name : 'Customer'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.delivery_status) }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{getStatusText(task.delivery_status)}</Text>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.taskDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="map-marker" size={p(14)} color="#6b7280" />
              </View>
              <Text style={styles.detailText}>{address}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="credit-card" size={p(14)} color="#6b7280" />
              </View>
              <Text style={styles.detailText}>
                {task.payment_method} • {task.payment_status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="calendar" size={p(14)} color="#6b7280" />
              </View>
              <Text style={styles.detailText}>
                Ordered: {new Date(task.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.amountSection}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{task.total_amount}</Text>
            </View>
            <View style={styles.deliveryIconContainer}>
              <Icon name="truck" size={p(20)} color="#2563eb" />
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.itemsSection}>
            <Text style={styles.itemsLabel}>Items:</Text>
            <Text style={styles.itemsText}>{items}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {task.delivery_status === 'ready_for_delivery' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusChange(task.id, 'in_progress')}
            >
              <Icon name="play" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          </View>
        )}

        {task.delivery_status === 'in_progress' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleStatusChange(task.id, 'delivered')}
            >
              <Icon name="check" size={p(16)} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {task.delivery_status === 'delivered' && (
          <View style={styles.completedIndicator}>
            <Icon name="check-circle" size={p(20)} color="#059669" />
            <Text style={styles.completedText}>Delivery Completed</Text>
          </View>
        )}

        {task.payment_status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton, updatePaymentStatusLoading && styles.disabledButton]}
              onPress={() => handlePaymentStatusChange(task.id, 'paid')}
              disabled={updatePaymentStatusLoading}
            >
              {updatePaymentStatusLoading ? (
                <Icon name="spinner" size={p(16)} color="#fff" />
              ) : (
                <Icon name="credit-card" size={p(16)} color="#fff" />
              )}
              <Text style={styles.actionButtonText}>
                {updatePaymentStatusLoading ? 'Updating...' : 'Mark Payment Paid'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Footer */}
        <View style={styles.cardFooter} />
      </TouchableOpacity>
    );
  };

  // Use API data for progress calculation
  const totalTasks = summary.total || 0;
  const completedTasksFromAPI = summary.completed || 0;
  const pendingTasks = summary.pending || 0;
  const completionPercentage = summary.progress || 0;

  const renderSkeletonLoader = () => (
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Today's Tasks"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading || summaryLoading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Progress Overview */}
          <View style={styles.progressSection}>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Today's Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(completionPercentage)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` },
                  ]}
                />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{completedTasksFromAPI}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{pendingTasks}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalTasks}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Today's Deliveries</Text>
            {tasks && tasks.length > 0 ? (
              tasks.map(renderTaskCard)
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="check-circle" size={p(48)} color="#059669" />
                </View>
                <Text style={styles.emptyText}>No tasks for today!</Text>
                <Text style={styles.emptySubtext}>All deliveries are completed</Text>
              </View>
            )}
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
    padding: p(12),
  },
  progressSection: {
    marginBottom: p(12),
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  progressTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: p(18),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  progressBar: {
    height: p(6),
    backgroundColor: '#e9ecef',
    borderRadius: p(3),
    marginBottom: p(12),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#019a34',
    borderRadius: p(3),
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: p(16),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
    marginBottom: p(2),
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  tasksSection: {
    marginBottom: p(12),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(12),
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    marginBottom: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(10),
    paddingTop: p(10),
    paddingBottom: p(6),
    backgroundColor: '#fafafa',
  },
  taskInfo: {
    flex: 1,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(2),
  },
  orderId: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    marginLeft: p(3),
  },
  customerName: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(6),
    paddingVertical: p(3),
    borderRadius: p(10),
  },
  statusDot: {
    width: p(3),
    height: p(3),
    borderRadius: p(1.5),
    backgroundColor: '#fff',
    marginRight: p(3),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  cardContent: {
    paddingHorizontal: p(10),
    paddingBottom: p(6),
  },
  taskDetails: {
    marginBottom: p(6),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(3),
  },
  detailIconContainer: {
    width: p(14),
    height: p(14),
    borderRadius: p(7),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p(5),
  },
  detailText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#4a4a4a',
    flex: 1,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(6),
    paddingHorizontal: p(6),
    backgroundColor: '#f8fafc',
    borderRadius: p(4),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: p(6),
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: p(1),
  },
  totalAmount: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    color: '#059669',
  },
  deliveryIconContainer: {
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsSection: {
    marginBottom: p(6),
  },
  itemsLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(1),
  },
  itemsText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: p(10),
    paddingBottom: p(6),
    paddingTop: p(4),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    borderRadius: p(4),
    gap: p(3),
    flex: 1,
  },
  startButton: {
    backgroundColor: '#019a34',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  paymentButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(6),
    backgroundColor: '#d1fae5',
    borderRadius: p(6),
    gap: p(6),
    marginHorizontal: p(10),
    marginBottom: p(6),
  },
  completedText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#059669',
  },
  cardFooter: {
    height: p(1),
    backgroundColor: '#019a34',
    opacity: 0.1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(40),
  },
  emptyIconContainer: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(12),
  },
  emptyText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(6),
  },
  emptySubtext: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: p(12),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(8),
    gap: p(6),
  },
});

export default TodaysTaskScreen;
