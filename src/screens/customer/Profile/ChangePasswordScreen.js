import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal } from '../../../components';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../../../redux/slices/profileSlice';

const ChangePasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { changePasswordLoading, changePasswordError } = useSelector(state => state.profile);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Monitor changePasswordError and show error modal
  useEffect(() => {
    if (changePasswordError && !changePasswordLoading) {
      setErrorMessage(changePasswordError.message || 'Failed to change password. Please try again.');
      setShowErrorModal(true);
    }
  }, [changePasswordError, changePasswordLoading]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSuccessModalClose = () => {
    // Clear form and navigate back
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    navigation.goBack();
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setErrorMessage('Please fill in all fields');
      setShowErrorModal(true);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage('New password and confirm password do not match');
      setShowErrorModal(true);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long');
      setShowErrorModal(true);
      return;
    }

    // Additional password validation
    if (passwords.newPassword === passwords.currentPassword) {
      setErrorMessage('New password must be different from current password');
      setShowErrorModal(true);
      return;
    }

    // Check if new password contains at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(passwords.newPassword);
    const hasNumber = /\d/.test(passwords.newPassword);
    
    if (!hasLetter || !hasNumber) {
      setErrorMessage('New password must contain at least one letter and one number');
      setShowErrorModal(true);
      return;
    }

    try {
      // Call API to change password
      await dispatch(changePassword(passwords)).unwrap();
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      // Handle error
      setErrorMessage(error.message || 'Failed to change password. Please try again.');
      setShowErrorModal(true);
    }
  };

  const updatePassword = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Change Password"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password *</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={passwords.currentPassword}
                  onChangeText={(text) => updatePassword('currentPassword', text)}
                  placeholder="Enter your current password"
                  secureTextEntry={!showPasswords.currentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility('currentPassword')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showPasswords.currentPassword ? 'eye-slash' : 'eye'}
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password *</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={passwords.newPassword}
                  onChangeText={(text) => updatePassword('newPassword', text)}
                  placeholder="Enter your new password"
                  secureTextEntry={!showPasswords.newPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility('newPassword')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showPasswords.newPassword ? 'eye-slash' : 'eye'}
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={passwords.confirmPassword}
                  onChangeText={(text) => updatePassword('confirmPassword', text)}
                  placeholder="Re-enter your new password"
                  secureTextEntry={!showPasswords.confirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => togglePasswordVisibility('confirmPassword')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showPasswords.confirmPassword ? 'eye-slash' : 'eye'}
                    size={18}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.changePasswordButton, changePasswordLoading && styles.changePasswordButtonDisabled]} 
              onPress={handleChangePassword}
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.changePasswordButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Password Changed!"
        message="Your password has been changed successfully."
        buttonText="Continue"
        onButtonPress={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
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
    backgroundColor: '#f6fbf7',
  },
  content: {
    flex: 1,
    paddingHorizontal: p(16),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: p(16),
  },
  
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginTop: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  title: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(24),
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  
  inputGroup: {
    marginBottom: p(20),
  },
  
  inputLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(6),
    fontFamily: 'Poppins-SemiBold',
  },
  
  passwordInputWrapper: {
    position: 'relative',
  },
  
  textInput: {
    fontSize: fontSizes.sm,
    color: '#333',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    paddingRight: p(48), // Make space for the eye icon
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontFamily: 'Poppins-Regular',
  },
  
  eyeIcon: {
    position: 'absolute',
    right: p(16),
    top: '50%',
    transform: [{ translateY: -p(9) }], // Center vertically
    padding: p(4),
    zIndex: 1,
  },
  
  changePasswordButton: {
    backgroundColor: '#FFD700', // Yellow color as shown in the image
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    alignItems: 'center',
    marginTop: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  
  changePasswordButtonText: {
    color: '#000', // Black text as shown in the image
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  
  changePasswordButtonDisabled: {
    opacity: 0.7,
  },
});

export default ChangePasswordScreen;
