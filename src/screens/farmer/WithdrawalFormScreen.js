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
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchWalletDetails, 
  submitWithdrawalRequest, 
  clearSubmitError, 
  clearSubmitSuccess,
  selectWalletData,
  selectWalletLoading,
  selectSubmitLoading,
  selectSubmitError,
  selectSubmitSuccess
} from '../../redux/slices/walletSlice';
import SkeletonLoader from '../../components/SkeletonLoader';

const WithdrawalFormScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const walletData = useSelector(selectWalletData);
  const loading = useSelector(selectWalletLoading);
  const submitLoading = useSelector(selectSubmitLoading);
  const submitError = useSelector(selectSubmitError);
  const submitSuccess = useSelector(selectSubmitSuccess);

  // Form states
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [accountType, setAccountType] = useState('bank_account');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [vpa, setVpa] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [useNewAccount, setUseNewAccount] = useState(true);

  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dispatch(fetchWalletDetails());
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      setSuccessMessage('Withdrawal request submitted successfully!');
      setShowSuccessModal(true);
      dispatch(clearSubmitSuccess());
      // Reset form
      setWithdrawalAmount('');
      setAccountHolderName('');
      setVpa('');
      setAccountNumber('');
      setIfsc('');
      setSelectedAccountId('');
      setUseNewAccount(true);
    }
  }, [submitSuccess, dispatch]);

  useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError);
      setShowErrorModal(true);
      dispatch(clearSubmitError());
    }
  }, [submitError, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchWalletDetails());
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setSelectedAccountId('');
    setUseNewAccount(true);
  };

  const handleExistingAccountSelect = (account) => {
    setSelectedAccountId(account.id);
    setUseNewAccount(false);
    setAccountHolderName(account.name || '');
    setVpa(account.vpa || '');
    setAccountNumber(account.account_number || '');
    setIfsc(account.ifsc || '');
  };

  const handleNewAccountToggle = () => {
    setUseNewAccount(!useNewAccount);
    setSelectedAccountId('');
    if (!useNewAccount) {
      setAccountHolderName('');
      setVpa('');
      setAccountNumber('');
      setIfsc('');
    }
  };

  const calculateConvenienceFee = (amount) => {
    return Math.round(amount * 0.05); // 5% convenience fee
  };

  const calculateFinalAmount = (amount) => {
    const fee = calculateConvenienceFee(amount);
    return amount - fee;
  };

  const validateForm = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid withdrawal amount');
      return false;
    }

    if (parseFloat(withdrawalAmount) > walletData.availableBalance) {
      Alert.alert('Error', 'Withdrawal amount cannot exceed available balance');
      return false;
    }

    if (useNewAccount) {
      if (!accountHolderName.trim()) {
        Alert.alert('Error', 'Please enter account holder name');
        return false;
      }

      if (accountType === 'vpa') {
        if (!vpa.trim()) {
          Alert.alert('Error', 'Please enter VPA address');
          return false;
        }
      } else {
        if (!accountNumber.trim()) {
          Alert.alert('Error', 'Please enter account number');
          return false;
        }
        if (!ifsc.trim()) {
          Alert.alert('Error', 'Please enter IFSC code');
          return false;
        }
      }
    } else {
      // For existing account, we need to have selected an account
      if (!selectedAccountId) {
        Alert.alert('Error', 'Please select an existing account');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const amount = parseFloat(withdrawalAmount);
    const convenienceFee = calculateConvenienceFee(amount);
    const finalAmount = calculateFinalAmount(amount);

    setSuccessMessage(
      `Withdrawal Details:\n` +
      `Amount: ₹${amount}\n` +
      `Convenience Fee: ₹${convenienceFee}\n` +
      `Final Amount: ₹${finalAmount}\n\n` +
      `Account Type: ${accountType === 'vpa' ? 'VPA' : 'Bank Account'}\n` +
      `Account: ${useNewAccount ? 'New Account' : 'Existing Account'}`
    );
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmationModal(false);

    const requestData = {
      withdrawal_amount: parseFloat(withdrawalAmount),
      account_type: accountType,
    };

    if (useNewAccount) {
      // For new account, include name and account details
      requestData.name = accountHolderName;
      if (accountType === 'vpa') {
        requestData.vpa = vpa;
      } else {
        requestData.account_number = accountNumber;
        requestData.ifsc = ifsc;
      }
    } else {
      // For existing account, only include the existing_fund_account_id
      requestData.existing_fund_account_id = selectedAccountId;
    }

    console.log('Submitting withdrawal request with data:', requestData);

    try {
      await dispatch(submitWithdrawalRequest(requestData)).unwrap();
    } catch (error) {
      console.error('Withdrawal submission error:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
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
          {/* <TouchableOpacity
            style={styles.requestButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="plus" size={p(12)} color="#fff" />
            <Text style={styles.requestButtonText}>Request Withdrawal</Text>
          </TouchableOpacity> */}
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

  const renderWithdrawalForm = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Withdrawal Details</Text>

        {/* Withdrawal Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Withdrawal Amount *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter amount"
            value={withdrawalAmount}
            onChangeText={setWithdrawalAmount}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>

        {/* Account Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Type *</Text>
          <View style={styles.accountTypeContainer}>
            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                accountType === 'vpa' && styles.accountTypeButtonSelected
              ]}
              onPress={() => handleAccountTypeChange('vpa')}
            >
              <Icon name="mobile" size={p(16)} color={accountType === 'vpa' ? '#fff' : '#666'} />
              <Text style={[
                styles.accountTypeText,
                accountType === 'vpa' && styles.accountTypeTextSelected
              ]}>VPA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                accountType === 'bank_account' && styles.accountTypeButtonSelected
              ]}
              onPress={() => handleAccountTypeChange('bank_account')}
            >
              <Icon name="bank" size={p(16)} color={accountType === 'bank_account' ? '#fff' : '#666'} />
              <Text style={[
                styles.accountTypeText,
                accountType === 'bank_account' && styles.accountTypeTextSelected
              ]}>Bank Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Existing Account */}
        {walletData.previousFundAccounts && walletData.previousFundAccounts.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Existing Account</Text>
            
            <TouchableOpacity
              style={[
                styles.newAccountButton,
                useNewAccount && styles.newAccountButtonSelected
              ]}
              onPress={handleNewAccountToggle}
            >
              <Text style={[
                styles.newAccountText,
                useNewAccount && styles.newAccountTextSelected
              ]}>Use New Account Details</Text>
            </TouchableOpacity>

            {!useNewAccount && (
              <View style={styles.existingAccountsContainer}>
                {walletData.previousFundAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.existingAccountCard,
                      selectedAccountId === account.id && styles.existingAccountCardSelected
                    ]}
                    onPress={() => handleExistingAccountSelect(account)}
                  >
                    <Icon
                      name={account.account_type === 'vpa' ? 'mobile' : 'bank'}
                      size={p(16)}
                      color={selectedAccountId === account.id ? '#019a34' : '#666'}
                    />
                    <View style={styles.existingAccountDetails}>
                      <Text style={[
                        styles.existingAccountType,
                        selectedAccountId === account.id && styles.existingAccountTypeSelected
                      ]}>
                        {account.account_type === 'vpa' ? 'VPA' : 'Bank Account'}
                      </Text>
                      <Text style={[
                        styles.existingAccountInfo,
                        selectedAccountId === account.id && styles.existingAccountInfoSelected
                      ]}>
                        {account.account_type === 'vpa' 
                          ? account.vpa 
                          : `${account.account_number} (${account.ifsc})`
                        }
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Account Details */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Holder Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter account holder name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            placeholderTextColor="#999"
          />
        </View>

        {accountType === 'vpa' ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VPA Address *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter VPA address"
              value={vpa}
              onChangeText={setVpa}
              placeholderTextColor="#999"
            />
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IFSC Code *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter IFSC code"
                value={ifsc}
                onChangeText={setIfsc}
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </View>
          </>
        )}

        {/* Fee Information */}
        {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
          <View style={styles.feeContainer}>
            <Text style={styles.feeTitle}>Fee Breakdown</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Withdrawal Amount:</Text>
              <Text style={styles.feeValue}>₹{withdrawalAmount}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Convenience Fee (5%):</Text>
              <Text style={styles.feeValue}>₹{calculateConvenienceFee(parseFloat(withdrawalAmount))}</Text>
            </View>
            <View style={[styles.feeRow, styles.feeTotalRow]}>
              <Text style={styles.feeTotalLabel}>Final Amount:</Text>
              <Text style={styles.feeTotalValue}>₹{calculateFinalAmount(parseFloat(withdrawalAmount))}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitLoading}
        >
          <Text style={styles.submitButtonText}>
            {submitLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <CommonHeader
        screenName="Withdrawal Request"
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
          {renderWithdrawalForm()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Withdrawal"
        message={successMessage}
        confirmText="Submit"
        cancelText="Cancel"
        loading={submitLoading}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Success!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={handleSuccessModalClose}
      />

      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
      />
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
    paddingBottom: p(100), // Extra padding for keyboard
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
    paddingHorizontal: p(10),
    paddingVertical: p(2),
    borderRadius: p(6),
    gap: p(6),
  },
  requestButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
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
  inputGroup: {
    marginBottom: p(16),
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(12),
    fontSize: fontSizes.sm,
    backgroundColor: '#f9f9f9',
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: p(12),
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: p(12),
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: p(8),
  },
  accountTypeButtonSelected: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  accountTypeText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
  },
  accountTypeTextSelected: {
    color: '#fff',
  },
  newAccountButton: {
    padding: p(12),
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginBottom: p(12),
  },
  newAccountButtonSelected: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  newAccountText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
  },
  newAccountTextSelected: {
    color: '#fff',
  },
  existingAccountsContainer: {
    gap: p(8),
  },
  existingAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: p(12),
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: p(12),
  },
  existingAccountCardSelected: {
    backgroundColor: '#f0f9f0',
    borderColor: '#019a34',
  },
  existingAccountDetails: {
    flex: 1,
  },
  existingAccountType: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(2),
    fontFamily: 'Poppins-SemiBold',
  },
  existingAccountTypeSelected: {
    color: '#019a34',
  },
  existingAccountInfo: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  existingAccountInfoSelected: {
    color: '#019a34',
  },
  feeContainer: {
    backgroundColor: '#f8f9fa',
    padding: p(16),
    borderRadius: p(8),
    marginBottom: p(20),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  feeTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(12),
    fontFamily: 'Poppins-Bold',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(8),
  },
  feeTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: p(8),
    marginTop: p(8),
  },
  feeLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  feeValue: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  feeTotalLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  feeTotalValue: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  submitButton: {
    backgroundColor: '#019a34',
    padding: p(16),
    borderRadius: p(8),
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default WithdrawalFormScreen;
