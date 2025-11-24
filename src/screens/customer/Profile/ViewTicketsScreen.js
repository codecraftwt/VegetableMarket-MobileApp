import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { ErrorModal, SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchSupportTickets, 
  clearSupportTicketError, 
  clearSupportTicketSuccess 
} from '../../../redux/slices/supportTicketSlice';

const ViewTicketsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tickets, ticketsLoading, error, success, message } = useSelector((state) => state.supportTicket);

  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  // Handle success/error states
  useEffect(() => {
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearSupportTicketSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearSupportTicketError());
    }
  }, [error, dispatch]);

  const loadTickets = () => {
    dispatch(fetchSupportTickets());
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = () => {
    console.log('View Tickets notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTicketPress = (ticket) => {
    navigation.navigate('TicketDetails', { ticketId: ticket.id });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#FF9800';
      case 'in_progress':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'clock-o';
      case 'in_progress':
        return 'cog';
      case 'resolved':
        return 'check-circle';
      case 'closed':
        return 'times-circle';
      default:
        return 'clock-o';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TicketCard = ({ ticket }) => (
    <TouchableOpacity style={styles.ticketCard} onPress={() => handleTicketPress(ticket)}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketSubject} numberOfLines={1}>
            {ticket.subject}
          </Text>
          <Text style={styles.ticketDate}>
            {formatDate(ticket.created_at)}
          </Text>
        </View>
        <View style={styles.ticketRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
              {ticket.status?.toUpperCase() || 'OPEN'}
            </Text>
          </View>
          {ticket.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{ticket.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.ticketMessage} numberOfLines={2}>
        {ticket.message}
      </Text>
      
      <View style={styles.ticketFooter}>
        <View style={styles.ticketMeta}>
          <Text style={styles.ticketId}>#{ticket.id}</Text>
          {ticket.attachment && (
            <View style={styles.attachmentInfo}>
              <Icon name="paperclip" size={12} color="#666" />
              <Text style={styles.attachmentText}>Attachment</Text>
            </View>
          )}
        </View>
        <Icon name="chevron-right" size={14} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon name="ticket" size={48} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Support Tickets</Text>
      <Text style={styles.emptySubtitle}>
        You haven't created any support tickets yet.{'\n'}
        Create your first ticket to get help with any issues.
      </Text>
      <TouchableOpacity 
        style={styles.createTicketButton}
        onPress={() => navigation.navigate('GenerateTicket')}
      >
        <Icon name="plus" size={16} color="#fff" />
        <Text style={styles.createTicketButtonText}>Create New Ticket</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.skeletonCard}>
          <SkeletonLoader width="100%" height={p(120)} borderRadius={p(12)} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="My Support Tickets"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {/* Fixed Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Support Tickets</Text>
          {tickets && tickets.length > 0 && (
            <View style={styles.ticketCountBadge}>
              <Text style={styles.ticketCountText}>{tickets.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          Track the status of your support requests
        </Text>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Tickets List */}
          {ticketsLoading ? (
            <LoadingSkeleton />
          ) : tickets && tickets.length > 0 ? (
            <View style={styles.ticketsList}>
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </ScrollView>

        {/* Create New Ticket Button */}
        {tickets && tickets.length > 0 && (
          <View style={styles.fabContainer}>
            <TouchableOpacity 
              style={styles.fabButton}
              onPress={() => navigation.navigate('GenerateTicket')}
            >
              <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>


      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || "Something went wrong. Please try again."}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: p(16),
  },
  scrollContentContainer: {
    paddingBottom: p(100), // Extra padding for FAB button
    minHeight: '100%',
  },

  // Header Section
  headerSection: {
    backgroundColor: '#fff',
    padding: p(20),
    paddingHorizontal: p(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  ticketCountBadge: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(12),
    paddingVertical: p(4),
    borderRadius: p(12),
    minWidth: p(24),
    alignItems: 'center',
  },
  ticketCountText: {
    fontSize: fontSizes.sm,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  // Tickets List
  ticketsList: {
    paddingTop: p(16),
    paddingBottom: p(20),
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  ticketInfo: {
    flex: 1,
    marginRight: p(16),
  },
  ticketSubject: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(6),
  },
  ticketDate: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  ticketRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: p(10),
    paddingVertical: p(6),
    borderRadius: p(12),
    marginBottom: p(6),
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  ticketMessage: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(20),
    marginBottom: p(16),
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    marginRight: p(16),
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(6),
  },
  unreadBadge: {
    backgroundColor: '#FF4444',
    borderRadius: p(8),
    minWidth: p(16),
    height: p(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(4),
  },
  unreadText: {
    fontSize: fontSizes.xs,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(60),
    paddingHorizontal: p(20),
  },
  emptyIcon: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(16),
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(8),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(20),
    marginBottom: p(24),
  },
  createTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingHorizontal: p(24),
    paddingVertical: p(12),
    borderRadius: p(8),
  },
  createTicketButtonText: {
    fontSize: fontSizes.sm,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },

  // FAB Button
  fabContainer: {
    position: 'absolute',
    bottom: p(20),
    right: p(20),
    zIndex: 1000,
  },
  fabButton: {
    width: p(48),
    height: p(48),
    borderRadius: p(24),
    backgroundColor: '#019a34',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },

  // Skeleton
  skeletonContainer: {
    paddingBottom: p(20),
  },
  skeletonCard: {
    marginBottom: p(16),
  },
});

export default ViewTicketsScreen;
