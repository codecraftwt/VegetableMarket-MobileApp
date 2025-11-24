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
  Image,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchSupportTicketById, 
  sendSupportTicketReply,
  updateSupportTicketStatus,
  clearSupportTicketError, 
  clearSupportTicketSuccess 
} from '../../../redux/slices/supportTicketSlice';

const TicketDetailsScreen = ({ navigation, route }) => {
  const { ticketId } = route.params;
  const dispatch = useDispatch();
  const { currentTicket, loading, error, success, message, sendingReply, updating } = useSelector((state) => state.supportTicket);

  const [replyMessage, setReplyMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [localTicketStatus, setLocalTicketStatus] = useState(null);
  const scrollViewRef = React.useRef(null);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchSupportTicketById(ticketId));
    }
  }, [ticketId, dispatch]);

  // Update local status when currentTicket changes
  useEffect(() => {
    if (currentTicket?.ticket?.status) {
      setLocalTicketStatus(currentTicket.ticket.status);
    }
  }, [currentTicket?.ticket?.status]);

  // Handle success/error states
  useEffect(() => {
    if (success && message) {
      // Don't show success modal when sending replies or updating status
      if (!isSendingReply && !isUpdatingStatus) {
        setShowSuccessModal(true);
      }
      dispatch(clearSupportTicketSuccess());
    }
  }, [success, message, isSendingReply, isUpdatingStatus, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearSupportTicketError());
    }
  }, [error, dispatch]);

  // Reset sending reply flag when reply is sent
  useEffect(() => {
    if (success && isSendingReply) {
      setIsSendingReply(false);
    }
  }, [success, isSendingReply]);

  // Reset updating status flag when status is updated
  useEffect(() => {
    if (success && isUpdatingStatus) {
      setIsUpdatingStatus(false);
    }
  }, [success, isUpdatingStatus]);

  const handleNotificationPress = () => {
    console.log('Ticket Details notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDownloadAttachment = () => {
    if (currentTicket?.ticket?.attachment) {
      const attachmentUrl = `https://kisancart.in/storage/${currentTicket.ticket.attachment}`;
      Linking.openURL(attachmentUrl);
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    setIsSendingReply(true);
    dispatch(sendSupportTicketReply({ 
      ticketId: ticket.id, 
      message: replyMessage.trim() 
    }));
    setReplyMessage('');
  };

  const handleStatusChange = (newStatus) => {
    setIsUpdatingStatus(true);
    setLocalTicketStatus(newStatus);
    dispatch(updateSupportTicketStatus({ 
      ticketId: ticket.id, 
      status: newStatus 
    }));
    setShowStatusModal(false);
  };

  const handleStatusBadgePress = () => {
    setShowStatusModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#FF9800';
      case 'in_progress':
        return '#2196F3';
      case 'close':
      case 'closed':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  };

  const MessageBubble = ({ message, isUser }) => (
    <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.supportMessageContainer]}>
      <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.supportMessage]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.supportMessageText]}>
          {message.message}
        </Text>
        <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.supportMessageTime]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {/* Header Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonBadge} />
        </View>
        <View style={styles.skeletonMessage} />
        <View style={styles.skeletonMeta} />
      </View>
      
      {/* Chat Skeleton */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonChatHeader} />
        <View style={styles.skeletonChatMessages}>
          <View style={styles.skeletonMessageBubble} />
          <View style={[styles.skeletonMessageBubble, styles.skeletonMessageBubbleRight]} />
          <View style={styles.skeletonMessageBubble} />
        </View>
        <View style={styles.skeletonChatInput} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Ticket Details"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (!currentTicket?.ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Ticket Details"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ticket = currentTicket.ticket;
  const replies = currentTicket.replies || [];
  const displayStatus = localTicketStatus || ticket.status;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Ticket Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
        {/* Ticket Header Card */}
        <View style={styles.ticketHeaderCard}>
          <View style={styles.ticketHeaderTop}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketSubject}>{ticket.subject}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.statusBadge, { backgroundColor: getStatusColor(displayStatus) + '15' }]}
              onPress={handleStatusBadgePress}
              disabled={updating || isUpdatingStatus}
            >
              {updating || isUpdatingStatus ? (
                <View style={styles.statusLoading}>
                  <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
                    UPDATING...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
                  {displayStatus?.toUpperCase() || 'OPEN'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.ticketMessage}>{ticket.message}</Text>
          </View>
          <View style={styles.ticketMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={14} color="#666" />
              <Text style={styles.metaText}>{formatDate(ticket.created_at)}</Text>
            </View>
          </View>

          {ticket.attachment && (
            <Image
              source={{ uri: `https://kisancart.in/storage/${ticket.attachment}` }}
              style={styles.attachmentRightImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Chat Interface */}
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Conversation</Text>
          </View>
          
          <ScrollView 
            style={styles.chatMessages} 
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Replies only - original ticket message is already shown in header */}
            {replies.map((reply) => (
              <MessageBubble 
                key={reply.id} 
                message={reply} 
                isUser={reply.is_admin === 0} 
              />
            ))}
            
            {sendingReply && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Sending...</Text>
              </View>
            )}
            
            {replies.length === 0 && !sendingReply && (
              <View style={styles.noRepliesContainer}>
                <Icon name="comments" size={32} color="#ccc" />
                <Text style={styles.noRepliesText}>No replies yet</Text>
                <Text style={styles.noRepliesSubtext}>Support team will respond soon</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Chat Input */}
          <View style={styles.chatInputContainer}>
            <View style={styles.chatInputWrapper}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                value={replyMessage}
                onChangeText={setReplyMessage}
                multiline={true}
                textAlignVertical="center"
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !replyMessage.trim() && styles.sendButtonDisabled]}
                onPress={handleSendReply}
                disabled={!replyMessage.trim() || sendingReply}
              >
                <Icon name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={message || "Operation completed successfully"}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={error || "Something went wrong. Please try again."}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />

      {/* Status Change Modal */}
      {showStatusModal && (
        <View style={styles.statusModalOverlay}>
          <View style={styles.statusModalContainer}>
            <View style={styles.statusModalHeader}>
              <Text style={styles.statusModalTitle}>Change Status</Text>
              <TouchableOpacity 
                style={styles.statusModalCloseButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.statusModalSubtitle}>
              Select the new status for this ticket
            </Text>
            
            <View style={styles.statusOptions}>
              <TouchableOpacity 
                style={[styles.statusOption, displayStatus === 'open' && styles.statusOptionActive]}
                onPress={() => handleStatusChange('open')}
              >
                <View style={[styles.statusOptionBadge, { backgroundColor: '#FF9800' + '15' }]}>
                  <Text style={[styles.statusOptionText, { color: '#FF9800' }]}>OPEN</Text>
                </View>
                {/* <Text style={styles.statusOptionLabel}>Open</Text> */}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusOption, displayStatus === 'in_progress' && styles.statusOptionActive]}
                onPress={() => handleStatusChange('in_progress')}
              >
                <View style={[styles.statusOptionBadge, { backgroundColor: '#2196F3' + '15' }]}>
                  <Text style={[styles.statusOptionText, { color: '#2196F3' }]}>IN PROGRESS</Text>
                </View>
 
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusOption, (displayStatus === 'close' || displayStatus === 'closed') && styles.statusOptionActive]}
                onPress={() => handleStatusChange('closed')}
              >
                <View style={[styles.statusOptionBadge, { backgroundColor: '#9E9E9E' + '15' }]}>
                  <Text style={[styles.statusOptionText, { color: '#9E9E9E' }]}>CLOSE</Text>
                </View>
                {/* <Text style={styles.statusOptionLabel}>Close</Text> */}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: p(16),
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: p(20),
  },

  // Ticket Header Card
  ticketHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: p(160),
    position: 'relative',
    overflow: 'hidden',
  },
  ticketHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  ticketInfo: {
    flex: 1,
    marginRight: p(12),
  },
  ticketSubject: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  ticketId: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(20),
    // remove shadows for a clean badge
    shadowOpacity: 0,
    elevation: 0,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: p(16),
    gap: p(8),
    justifyContent: 'space-between',
  },
  smallAttachmentImage: {
    display: 'none',
  },
  ticketMessage: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    lineHeight: p(22),
    flex: 1,
    paddingRight: p(100),
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: p(20),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(6),
  },
  metaText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  attachmentRightImage: {
    position: 'absolute',
    right: p(16),
    top: p(60),
    bottom: p(24),
    width: p(80),
    borderRadius: p(12),
    zIndex: 1,
  },


  // Card Title
  cardTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(16),
  },

  // Chat Interface
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flex: 1,
    minHeight: p(400),
    maxHeight: p(500),
    overflow: 'hidden',
  },
  chatHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: p(12),
    paddingVertical: p(8),
  },
  messageContainer: {
    marginBottom: p(8),
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  supportMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderRadius: p(18),
  },
  userMessage: {
    backgroundColor: '#019a34',
    borderBottomRightRadius: p(4),
  },
  supportMessage: {
    backgroundColor: '#f1f3f4',
    borderBottomLeftRadius: p(4),
  },
  messageText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    lineHeight: p(18),
    marginBottom: p(4),
  },
  userMessageText: {
    color: '#fff',
  },
  supportMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
  },
  userMessageTime: {
    color: '#e8f5e8',
  },
  supportMessageTime: {
    color: '#666',
  },
  typingIndicator: {
    alignItems: 'center',
    paddingVertical: p(8),
  },
  typingText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },

  // Chat Input
  chatInputContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    minHeight: p(60),
  },
  chatInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: p(20),
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: p(40),
  },
  chatInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    maxHeight: p(80),
    minHeight: p(24),
    paddingVertical: p(4),
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#019a34',
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: p(8),
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  loadingText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  errorText: {
    fontSize: fontSizes.base,
    color: '#dc3545',
    fontFamily: 'Poppins-Regular',
  },

  // Status Change Modal
  statusModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  statusModalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(24),
    margin: p(20),
    maxWidth: p(320),
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  statusModalTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  statusModalCloseButton: {
    padding: p(4),
  },
  statusModalSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(20),
  },
  statusOptions: {
    gap: p(12),
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: p(12),
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  statusOptionActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#019a34',
  },
  statusOptionBadge: {
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(12),
    marginRight: p(12),
  },
  statusOptionText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  statusOptionLabel: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },

  // Status Loading
  statusLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Skeleton Loader Styles
  skeletonContainer: {
    flex: 1,
    padding: p(16),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: p(12),
  },
  skeletonTitle: {
    height: p(20),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '70%',
  },
  skeletonBadge: {
    height: p(24),
    backgroundColor: '#e0e0e0',
    borderRadius: p(12),
    width: p(80),
  },
  skeletonMessage: {
    height: p(16),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '100%',
    marginBottom: p(8),
  },
  skeletonMeta: {
    height: p(14),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '40%',
  },
  skeletonChatHeader: {
    height: p(16),
    backgroundColor: '#e0e0e0',
    borderRadius: p(4),
    width: '30%',
    marginBottom: p(12),
  },
  skeletonChatMessages: {
    marginBottom: p(16),
  },
  skeletonMessageBubble: {
    height: p(40),
    backgroundColor: '#e0e0e0',
    borderRadius: p(18),
    width: '60%',
    marginBottom: p(8),
  },
  skeletonMessageBubbleRight: {
    alignSelf: 'flex-end',
    width: '50%',
  },
  skeletonChatInput: {
    height: p(40),
    backgroundColor: '#e0e0e0',
    borderRadius: p(20),
    width: '100%',
  },
});

export default TicketDetailsScreen;
