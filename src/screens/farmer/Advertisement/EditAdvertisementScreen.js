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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { 
  fetchAdvertisementById,
  updateAdvertisement,
  clearAdvertisementError, 
  clearAdvertisementSuccess,
  clearCurrentAdvertisement
} from '../../../redux/slices/advertisementSlice';

const EditAdvertisementScreen = ({ navigation, route }) => {
  const { advertisement } = route.params;
  const dispatch = useDispatch();
  const { currentAdvertisement, loading, updating, error, success, message } = useSelector((state) => state.advertisement);

  const [title, setTitle] = useState(advertisement?.title || '');
  const [advertisementMessage, setAdvertisementMessage] = useState(advertisement?.message || '');
  const [fromDate, setFromDate] = useState(advertisement?.from ? new Date(advertisement.from) : new Date());
  const [toDate, setToDate] = useState(advertisement?.to ? new Date(advertisement.to) : new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // If we have advertisement data from navigation params, use it
    if (advertisement) {
      setTitle(advertisement.title || '');
      setAdvertisementMessage(advertisement.message || '');
      setFromDate(advertisement.from ? new Date(advertisement.from) : new Date());
      setToDate(advertisement.to ? new Date(advertisement.to) : new Date());
    } else {
      dispatch(fetchAdvertisementById(advertisement.id));
    }
  }, [advertisement, dispatch]);

  // Update form when currentAdvertisement changes
  useEffect(() => {
    if (currentAdvertisement) {
      setTitle(currentAdvertisement.title || '');
      setAdvertisementMessage(currentAdvertisement.message || '');
      setFromDate(currentAdvertisement.from ? new Date(currentAdvertisement.from) : new Date());
      setToDate(currentAdvertisement.to ? new Date(currentAdvertisement.to) : new Date());
    }
  }, [currentAdvertisement]);

  // Handle success/error states - Show modal for update
  useEffect(() => {
    if (success && message && message.includes('updated') && !showSuccessModal) {
      setShowSuccessModal(true);
      dispatch(clearAdvertisementSuccess());
    }
  }, [success, message, dispatch, showSuccessModal]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearAdvertisementError());
    }
  }, [error, dispatch]);

  const handleNotificationPress = () => {
    console.log('Edit Advertisement notification pressed');
  };

  const handleBackPress = () => {
    dispatch(clearCurrentAdvertisement());
    navigation.goBack();
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    // Format: YYYY-MM-DD HH:mm (API expects space instead of T)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError('Please enter a title for your advertisement.');
      setShowConfirmationModal(true);
      return false;
    }

    if (!advertisementMessage.trim()) {
      setValidationError('Please enter a message for your advertisement.');
      setShowConfirmationModal(true);
      return false;
    }

    if (!fromDate) {
      setValidationError('Please select a start date for your advertisement.');
      setShowConfirmationModal(true);
      return false;
    }

    if (!toDate) {
      setValidationError('Please select an end date for your advertisement.');
      setShowConfirmationModal(true);
      return false;
    }

    if (fromDate >= toDate) {
      setValidationError('End date must be after start date.');
      setShowConfirmationModal(true);
      return false;
    }

    return true;
  };

  const handleUpdateAdvertisement = () => {
    if (validateForm()) {
      const advertisementData = {
        title: title.trim(),
        message: advertisementMessage.trim(),
        from: formatDateForAPI(fromDate),
        to: formatDateForAPI(toDate),
      };
      dispatch(updateAdvertisement({ 
        advertisementId: advertisement.id, 
        advertisementData 
      }));
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        
        <CommonHeader
          screenName="Edit Advertisement"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />

        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading advertisement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader
        screenName="Edit Advertisement"
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
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Edit Advertisement</Text>

            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter advertisement title"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.characterCount}>{title.length}/100</Text>
            </View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter advertisement message"
                value={advertisementMessage}
                onChangeText={setAdvertisementMessage}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{advertisementMessage.length}/500</Text>
            </View>

            {/* Date Inputs */}
            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Start Date *</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromDatePicker(true)}>
                  <Text style={styles.dateInputText}>
                    {formatDateForDisplay(fromDate)}
                  </Text>
                  <Icon name="calendar" size={20} color="#019a34" />
                </TouchableOpacity>
                <Text style={styles.dateHint}>Tap to select start date</Text>
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>End Date *</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowToDatePicker(true)}>
                  <Text style={styles.dateInputText}>
                    {formatDateForDisplay(toDate)}
                  </Text>
                  <Icon name="calendar" size={20} color="#019a34" />
                </TouchableOpacity>
                <Text style={styles.dateHint}>Tap to select end date</Text>
              </View>
            </View>

            {/* Update Button */}
            <TouchableOpacity 
              style={[styles.updateButton, updating && styles.updateButtonDisabled]}
              onPress={handleUpdateAdvertisement}
              disabled={updating}
            >
              {updating ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.updateButtonText}>Updating...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="save" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Update Advertisement</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleFromDateChange}
          minimumDate={new Date()}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleToDateChange}
          minimumDate={fromDate}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearCurrentAdvertisement());
          navigation.navigate('AdvertisementManagement');
        }}
        title="Success!"
        message={message || "Advertisement updated successfully"}
        buttonText="OK"
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

      {/* Validation Error Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title="Validation Error"
        message={validationError}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowConfirmationModal(false)}
        confirmButtonStyle="primary"
        icon="alert-circle"
      />
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
  },
  scrollContentContainer: {
    padding: p(16),
    paddingBottom: p(100),
  },

  // Form Container
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(20),
  },

  // Input Styles
  inputContainer: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(8),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(12),
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: p(100),
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    marginTop: p(4),
  },

  // Date Inputs
  dateRow: {
    flexDirection: 'row',
    gap: p(12),
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(12),
    backgroundColor: '#fafafa',
  },
  dateInputText: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  dateHint: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginTop: p(4),
  },

  // Update Button
  updateButton: {
    backgroundColor: '#019a34',
    borderRadius: p(8),
    paddingVertical: p(16),
    marginTop: p(20),
  },
  updateButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    fontSize: fontSizes.base,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: p(8),
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default EditAdvertisementScreen;
