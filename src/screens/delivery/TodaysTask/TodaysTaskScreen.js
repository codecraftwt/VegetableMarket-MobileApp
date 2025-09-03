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
import { fetchTodaysTasks, updateTaskStatus } from '../../../redux/slices/todaysTaskSlice';

const TodaysTaskScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.todaysTask);
  
  const [completedTasks, setCompletedTasks] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadTodaysTasks();
    }, [])
  );

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const completed = tasks.filter(task => task.delivery_status === 'delivered').length;
      setCompletedTasks(completed);
    }
  }, [tasks]);

  const loadTodaysTasks = async () => {
    try {
      await dispatch(fetchTodaysTasks());
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
            dispatch(updateTaskStatus({ taskId, status: newStatus }));
            
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
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.orderId}>Order #{task.id}</Text>
            <Text style={styles.customerName}>
              {task.uniqueFarmers && task.uniqueFarmers.length > 0 ? 
                task.uniqueFarmers[0].name : 'Customer'}
            </Text>
          </View>
          <View style={styles.taskBadges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.delivery_status) }]}>
              <Text style={styles.statusText}>{getStatusText(task.delivery_status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={p(14)} color="#666" />
            <Text style={styles.detailText}>{address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="credit-card" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Payment: {task.payment_method} ({task.payment_status})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={p(14)} color="#666" />
            <Text style={styles.detailText}>
              Ordered: {new Date(task.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsLabel}>Items:</Text>
            <Text style={styles.itemsText}>{items}</Text>
          </View>
          <Text style={styles.totalAmount}>₹{task.total_amount}</Text>
        </View>

        {task.delivery_status === 'ready_for_delivery' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStatusChange(task.id, 'in_progress')}
            >
              <Icon name="play" size={p(14)} color="#fff" />
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
              <Icon name="check" size={p(14)} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}

        {task.delivery_status === 'delivered' && (
          <View style={styles.completedIndicator}>
            <Icon name="check-circle" size={p(20)} color="#28a745" />
            <Text style={styles.completedText}>Delivery Completed</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const totalTasks = tasks ? tasks.length : 0;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Today's Tasks"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
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
                  <Text style={styles.statValue}>{completedTasks}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalTasks - completedTasks}</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
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
                <Icon name="check-circle" size={p(60)} color="#28a745" />
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
    padding: p(16),
  },
  progressSection: {
    marginBottom: p(20),
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  progressTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: p(24),
    fontFamily: 'Poppins-Bold',
    color: '#019a34',
  },
  progressBar: {
    height: p(8),
    backgroundColor: '#e9ecef',
    borderRadius: p(4),
    marginBottom: p(16),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#019a34',
    borderRadius: p(4),
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  tasksSection: {
    marginBottom: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(16),
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  taskInfo: {
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
  taskBadges: {
    flexDirection: 'row',
    gap: p(8),
  },
  priorityBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  priorityText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
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
  taskDetails: {
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
  taskFooter: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: p(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingVertical: p(10),
    borderRadius: p(8),
    gap: p(6),
  },
  startButton: {
    backgroundColor: '#019a34',
  },
  completeButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(8),
    backgroundColor: '#d4edda',
    borderRadius: p(8),
    gap: p(8),
  },
  completedText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#28a745',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-SemiBold',
    color: '#28a745',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: p(16),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(12),
    gap: p(8),
  },
});

export default TodaysTaskScreen;
