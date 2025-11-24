import React, { useState } from 'react';
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
  Image,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import CommonHeader from '../../../components/CommonHeader';
import { CustomModal, SuccessModal, ErrorModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { createSupportTicket, clearSupportTicketError, clearSupportTicketSuccess } from '../../../redux/slices/supportTicketSlice';
import { requestCameraPermissionAndroid, requestStoragePermissionAndroid } from '../../../utils/permissions';

const GenerateTicketScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { creating, success,  error } = useSelector((state) => state.supportTicket);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleNotificationPress = () => {
    console.log('Generate Ticket notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };


  const tryAlternativeGallery = async () => {
    try {
      const alternativeOptions = {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
        selectionLimit: 1,
        maxWidth: 600,
        maxHeight: 600,
        presentationStyle: 'pageSheet',
        includeExtra: false,
        storageOptions: { skipBackup: true, path: 'images' },
      };

      const response = await launchImageLibrary(alternativeOptions);
      if (response.didCancel) return;
      if (response.errorCode) {
        setShowErrorModal(true);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          setAttachment({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `attachment_${Date.now()}.jpg`,
          });
        }
      }
    } catch (error) {
      console.error('Alternative gallery error:', error);
      setShowErrorModal(true);
    }
  };


  const openCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasCameraPermission = await requestCameraPermissionAndroid();
        if (!hasCameraPermission) {
          Alert.alert('Permission required', 'Camera permission is required to take photos.');
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        cameraType: 'back',
        maxWidth: 1000,
        maxHeight: 1000,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      const response = await launchCamera(options);
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to capture image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri) {
          setAttachment({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `attachment_${Date.now()}.jpg`,
          });
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const openGallery = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasStoragePermission = await requestStoragePermissionAndroid({ useMediaImages: true });
        if (!hasStoragePermission) {
          Alert.alert('Permission required', 'Please grant photo access permission.');
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
        maxWidth: 1000,
        maxHeight: 1000,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      const response = await launchImageLibrary(options);
      if (response.didCancel) return;

      if (response.errorCode) {
        if (response.errorMessage?.includes('No Activity found to handle Intent')) {
          await tryAlternativeGallery();
          return;
        }
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setAttachment({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `attachment_${Date.now()}.jpg`,
        });
      } else {
        Alert.alert('Error', 'No image selected. Please try again.');
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleChooseImagePress = () => {
    setShowPhotoModal(true);
  };

  const handleModalClose = () => {
    setShowPhotoModal(false);
  };

  const handleCameraOption = async () => {
    setShowPhotoModal(false);
    await openCamera();
  };

  const handleGalleryOption = async () => {
    setShowPhotoModal(false);
    await openGallery();
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject for your ticket');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message describing your issue');
      return;
    }

    const ticketData = {
      subject: subject.trim(),
      message: message.trim(),
      attachment: attachment,
    };

    dispatch(createSupportTicket(ticketData));
  };

  // Handle success/error states
  React.useEffect(() => {
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearSupportTicketSuccess());
    }
  }, [success, message, dispatch]);

  React.useEffect(() => {
    if (error) {
      setShowErrorModal(true);
      dispatch(clearSupportTicketError());
    }
  }, [error, dispatch]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
    setSubject('');
    setMessage('');
    setAttachment(null);
    // Navigate back to help center
    navigation.navigate('HelpCenter');
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Generate New Ticket"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        {/* <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Icon name="plus-circle" size={40} color="#019a34" />
          </View>
          <Text style={styles.headerTitle}>Create Support Ticket</Text>
          <Text style={styles.headerSubtitle}>
            Describe your issue and we'll get back to you as soon as possible.
          </Text>
        </View> */}

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Subject Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of your issue"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
              multiline={false}
            />
            <Text style={styles.characterCount}>{subject.length}/100</Text>
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message *</Text>
            <TextInput
              style={[styles.textInput, styles.messageInput]}
              placeholder="Please provide detailed information about your issue..."
              value={message}
              onChangeText={setMessage}
              maxLength={1000}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{message.length}/1000</Text>
          </View>

          {/* Attachment Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Attachment (Optional)</Text>
            <Text style={styles.inputSubLabel}>
              Add a screenshot or document to help us understand your issue better
            </Text>
            
            {attachment ? (
              <View style={styles.attachmentPreview}>
                <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <TouchableOpacity onPress={removeAttachment} style={styles.removeButton}>
                    <Icon name="times-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.attachmentButton} onPress={handleChooseImagePress}>
                <Icon name="camera" size={24} color="#019a34" />
                <Text style={styles.attachmentButtonText}>Choose Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, creating && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={creating}
          >
            {creating ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.submitButtonText}>Creating Ticket...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Create Support Ticket</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <View style={styles.helpItem}>
            <Icon name="info-circle" size={16} color="#019a34" />
            <Text style={styles.helpText}>
              We typically respond to support tickets within 24 hours
            </Text>
          </View>
          <View style={styles.helpItem}>
            <Icon name="clock-o" size={16} color="#019a34" />
            <Text style={styles.helpText}>
              Business hours: Monday-Friday 9 AM - 9 PM
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Ticket Created Successfully!"
        message={message || "Your support ticket has been created and we'll get back to you soon."}
        buttonText="OK"
        onButtonPress={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        message={error || "Failed to create support ticket. Please try again."}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
      />

      {/* Choose Photo Modal */}
      <CustomModal
        visible={showPhotoModal}
        onClose={handleModalClose}
        onCameraPress={handleCameraOption}
        onGalleryPress={handleGalleryOption}
      />
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
    paddingHorizontal: p(16),
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    paddingVertical: p(24),
    backgroundColor: '#fff',
    borderRadius: p(12),
    marginVertical: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIcon: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(16),
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(20),
    paddingHorizontal: p(16),
  },

  // Form Section
  formSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginVertical: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  inputSubLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(8),
    fontFamily: 'Poppins-Regular',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(12),
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  messageInput: {
    height: p(120),
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: fontSizes.xs,
    color: '#999',
    textAlign: 'right',
    marginTop: p(4),
    fontFamily: 'Poppins-Regular',
  },

  // Attachment Section
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#019a34',
    borderStyle: 'dashed',
    borderRadius: p(8),
    paddingVertical: p(16),
    paddingHorizontal: p(20),
    backgroundColor: '#f9f9f9',
  },
  attachmentButtonText: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    marginLeft: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(12),
    backgroundColor: '#fafafa',
  },
  attachmentImage: {
    width: p(50),
    height: p(50),
    borderRadius: p(4),
    marginRight: p(12),
  },
  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  removeButton: {
    padding: p(4),
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#019a34',
    borderRadius: p(8),
    paddingVertical: p(16),
    alignItems: 'center',
    marginTop: p(8),
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: fontSizes.sm,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Help Section
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(8),
  },
  helpText: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginLeft: p(8),
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
});

export default GenerateTicketScreen;
