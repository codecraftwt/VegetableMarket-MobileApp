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
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchWalletDetails,
  selectWalletData,
  selectWalletLoading,
} from '../../redux/slices/walletSlice';
import SkeletonLoader from '../../components/SkeletonLoader';

const WithdrawalRequestScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const walletData = useSelector(selectWalletData);
  const loading = useSelector(selectWalletLoading);

  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchWalletDetails());
  };

  const handleRequestWithdrawal = () => {
    navigation.navigate('WithdrawalForm');
  };

  const renderWalletSummary = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <SkeletonLoader width="100%" height={p(200)} borderRadius={p(8)} />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Wallet Summary</Text>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestWithdrawal}
          >
            <Icon name="plus" size={p(12)} color="#fff" />
            <Text style={styles.requestButtonText}>Request Withdrawal</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="money" size={p(20)} color="#019a34" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryValue}>₹{walletData.totalEarnings || 0}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="question-circle" size={p(20)} color="#2196F3" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Available Balance</Text>
              <Text style={styles.summaryValue}>₹{walletData.availableBalance || 0}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="arrow-up" size={p(20)} color="#FF6B6B" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Withdrawal</Text>
              <Text style={styles.summaryValue}>₹{walletData.totalWithdraw || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderWithdrawalHistory = () => {
    if (loading) {
      return (
        <View style={styles.section}>
          <SkeletonLoader width="100%" height={p(200)} borderRadius={p(8)} />
        </View>
      );
    }

    if (!walletData.withdrawals || walletData.withdrawals.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal History</Text>
          <View style={styles.emptyState}>
            <Icon name="history" size={p(40)} color="#ccc" />
            <Text style={styles.emptyText}>No withdrawal history found</Text>
            <Text style={styles.emptySubtext}>Your withdrawal requests will appear here</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Withdrawal History</Text>
        <View style={styles.historyList}>
          {walletData.withdrawals.map((withdrawal, index) => (
            <View key={withdrawal.id || index} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <Icon name="money" size={p(16)} color="#019a34" />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyAmount}>₹{withdrawal.amount}</Text>
                  <Text style={styles.historyDate}>{withdrawal.created_at}</Text>
                  <Text style={styles.historyType}>
                    {withdrawal.account_type === 'vpa' ? 'VPA' : 'Bank Account'}
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(withdrawal.status) }
                ]}>
                  <Text style={styles.statusText}>{withdrawal.status}</Text>
                </View>
                {withdrawal.total_amount && (
                  <Text style={styles.finalAmount}>Final: ₹{withdrawal.total_amount}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'approved':
      case 'completed':
        return '#019a34';
      case 'rejected':
      case 'failed':
        return '#FF6B6B';
      default:
        return '#ccc';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <CommonHeader
        screenName="Wallet Summary"
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderWalletSummary()}
          {renderWithdrawalHistory()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: p(16),
    paddingBottom: p(100),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(16),
    fontFamily: 'Poppins-Bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingHorizontal: p(5),
    paddingVertical: p(5),
    borderRadius: p(6),
    gap: p(6),
  },
  requestButtonText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: p(8),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: p(12),
    borderRadius: p(6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(4),
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(40),
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginTop: p(12),
    fontFamily: 'Poppins-Regular',
  },
  emptySubtext: {
    fontSize: fontSizes.xs,
    color: '#999',
    marginTop: p(4),
    fontFamily: 'Poppins-Regular',
  },
  historyList: {
    gap: p(12),
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: p(12),
    backgroundColor: '#f8f9fa',
    borderRadius: p(6),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  historyDetails: {
    flex: 1,
  },
  historyAmount: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: p(2),
    fontFamily: 'Poppins-Bold',
  },
  historyDate: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(2),
    fontFamily: 'Poppins-Regular',
  },
  historyType: {
    fontSize: fontSizes.xs,
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(4),
    marginBottom: p(4),
  },
  statusText: {
    fontSize: fontSizes.xs,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  finalAmount: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default WithdrawalRequestScreen;