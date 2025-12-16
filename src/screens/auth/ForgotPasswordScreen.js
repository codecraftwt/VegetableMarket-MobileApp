import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { forgotPassword, resendPasswordReset, clearForgotPasswordState } from '../../redux/slices/authSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {
    forgotPasswordLoading,
    forgotPasswordError,
    forgotPasswordMessage,
    resendPasswordResetLoading,
    resendPasswordResetMessage,
  } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  // Handle forgot password success
  useEffect(() => {
    if (forgotPasswordMessage) {
      setSuccessMessage(forgotPasswordMessage);
      setShowSuccessModal(true);
    }
  }, [forgotPasswordMessage]);

  // Handle resend password reset success
  useEffect(() => {
    if (resendPasswordResetMessage) {
      setSuccessMessage(resendPasswordResetMessage);
      setShowSuccessModal(true);
    }
  }, [resendPasswordResetMessage]);

  // Handle errors
  useEffect(() => {
    if (forgotPasswordError) {
      setErrorMessage(forgotPasswordError);
      setShowErrorModal(true);
    }
  }, [forgotPasswordError]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(forgotPassword(email)).unwrap();
    } catch (error) {
      // Error is handled by useEffect
      console.log('Forgot password failed:', error);
    }
  };

  const handleResend = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(resendPasswordReset(email)).unwrap();
    } catch (error) {
      // Error is handled by useEffect
      console.log('Resend password reset failed:', error);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setErrors({ ...errors, email: null });
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleEmailChange = text => {
    setEmail(text);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    // Navigate to LoginScreen after successful email send
    navigation.replace('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <ImageBackground
        source={require('../../assets/vegebg1.png')}
        style={styles.container}
        blurRadius={0.8}
      >
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              {/* <TouchableOpacity
                style={[styles.backButton, { top: (insets?.top || 0) + p(10) }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Icon name="arrow-left" size={20} color="#019a34" />
              </TouchableOpacity> */}

              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    errors.email && styles.inputError,
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!forgotPasswordLoading && !resendPasswordResetLoading}
                  returnKeyType="send"
                  onSubmitEditing={handleForgotPassword}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (forgotPasswordLoading || resendPasswordResetLoading) && styles.submitButtonDisabled,
                ]}
                onPress={handleForgotPassword}
                activeOpacity={0.8}
                disabled={forgotPasswordLoading || resendPasswordResetLoading}
              >
                {forgotPasswordLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {forgotPasswordMessage && (
                <TouchableOpacity
                  style={[
                    styles.resendButton,
                    resendPasswordResetLoading && styles.resendButtonDisabled,
                  ]}
                  onPress={handleResend}
                  activeOpacity={0.7}
                  disabled={resendPasswordResetLoading}
                >
                  {resendPasswordResetLoading ? (
                    <ActivityIndicator color="#019a34" size="small" />
                  ) : (
                    <Text style={styles.resendButtonText}>Resend Reset Link</Text>
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password?</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.loginLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Email Sent!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={handleCloseSuccessModal}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleCloseErrorModal}
        title="Error"
        message={errorMessage}
        buttonText="Try Again"
        onButtonPress={handleCloseErrorModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#019a34',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: p(16),
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: p(32),
    padding: p(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: p(30),
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  // backButton: {
  //   position: 'absolute',
  //   left: p(16),
  //   top: p(16),
  //   padding: p(8),
  //   zIndex: 10,
  //   backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //   borderRadius: p(20),
  //   width: p(40),
  //   height: p(40),
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: 'Montserrat-Bold',
    color: '#019a34',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginTop: p(40),
  },
  subtitle: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: p(16),
    lineHeight: p(20),
    paddingHorizontal: p(12),
  },
  inputContainer: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    marginBottom: p(8),
    marginLeft: p(6),
  },
  input: {
    height: p(52),
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: p(20),
    paddingHorizontal: p(18),
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  inputFocused: {
    borderColor: '#019a34',
    borderWidth: 2.5,
    backgroundColor: '#fff',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  inputError: {
    borderColor: '#ff4757',
    borderWidth: 2.5,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff4757',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    marginTop: p(6),
    marginLeft: p(6),
  },
  submitButton: {
    backgroundColor: '#019a34',
    height: p(52),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: p(10),
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#7fb892',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.6,
  },
  resendButton: {
    marginTop: p(16),
    paddingVertical: p(12),
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#019a34',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: p(16),
  },
  loginText: {
    color: '#666',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xs,
  },
});

export default ForgotPasswordScreen;

