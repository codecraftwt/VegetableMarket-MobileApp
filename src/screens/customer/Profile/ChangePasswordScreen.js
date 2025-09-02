import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
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
              <TextInput
                style={styles.textInput}
                value={passwords.currentPassword}
                onChangeText={(text) => updatePassword('currentPassword', text)}
                placeholder="Enter your current password"
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password *</Text>
              <TextInput
                style={styles.textInput}
                value={passwords.newPassword}
                onChangeText={(text) => updatePassword('newPassword', text)}
                placeholder="Enter your new password"
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <TextInput
                style={styles.textInput}
                value={passwords.confirmPassword}
                onChangeText={(text) => updatePassword('confirmPassword', text)}
                placeholder="Re-enter your new password"
                secureTextEntry={true}
                autoCapitalize="none"
              />
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
    paddingHorizontal: p(20),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: p(20),
  },
  
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(25),
    marginTop: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  title: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(30),
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  
  inputGroup: {
    marginBottom: p(25),
  },
  
  inputLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(8),
    fontFamily: 'Poppins-SemiBold',
  },
  
  textInput: {
    fontSize: fontSizes.base,
    color: '#333',
    paddingVertical: p(15),
    paddingHorizontal: p(20),
    backgroundColor: '#f8f9fa',
    borderRadius: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontFamily: 'Poppins-Regular',
  },
  
  changePasswordButton: {
    backgroundColor: '#FFD700', // Yellow color as shown in the image
    paddingVertical: p(15),
    paddingHorizontal: p(30),
    borderRadius: p(25),
    alignItems: 'center',
    marginTop: p(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  changePasswordButtonText: {
    color: '#000', // Black text as shown in the image
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  
  changePasswordButtonDisabled: {
    opacity: 0.7,
  },
});

export default ChangePasswordScreen;
