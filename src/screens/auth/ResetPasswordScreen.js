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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { resetPassword, clearForgotPasswordState } from '../../redux/slices/authSlice';
import { syncGuestCartToServer } from '../../redux/slices/cartSlice';
import { syncGuestWishlistToServer } from '../../redux/slices/wishlistSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { resetPasswordLoading, resetPasswordError, resetPasswordMessage, isLoggedIn, user } = useSelector(
    state => state.auth
  );

  // Get token and email from route params (passed from deep link or navigation)
  // React Navigation automatically parses query parameters from deep links
  // URL format: https://kisancart.in/reset-password?token=xxx&email=xxx
  const { token, email: routeEmail } = route.params || {};

  // Log route params for debugging (can be removed in production)
  useEffect(() => {
    if (route.params) {
      console.log('ResetPasswordScreen route params:', route.params);
    }
  }, [route.params]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
    passwordConfirmation: false,
  });
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailVerified, setShowEmailVerified] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  // Check for token on mount and show email verified message first
  useEffect(() => {
    // Decode email if it exists and set it
    if (routeEmail) {
      try {
        const decoded = decodeURIComponent(routeEmail);
        setEmail(decoded);
      } catch (e) {
        // If decoding fails, use the original value
        setEmail(routeEmail);
      }
    }
    
    if (!token) {
      setErrors({ token: 'Reset token is missing. Please use the link from your email.' });
      setErrorMessage('Reset token is missing. Please use the link from your email.');
      setShowErrorModal(true);
    } else {
      // Show "Email verified successfully" message first (Instagram-like flow)
      setShowEmailVerified(true);
      // After 2 seconds, show the password form
      const timer = setTimeout(() => {
        setShowEmailVerified(false);
        setShowPasswordForm(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, routeEmail]);

  // Handle reset password success and navigate to LoginScreen
  useEffect(() => {
    if (resetPasswordMessage) {
      // Show success modal first
      setShowSuccessModal(true);
    }
  }, [resetPasswordMessage]);

  // Handle errors
  useEffect(() => {
    if (resetPasswordError) {
      setErrorMessage(resetPasswordError);
      setShowErrorModal(true);
    }
  }, [resetPasswordError]);

  const validateForm = () => {
    const newErrors = {};

    // Email validation - email should be provided from route params
    if (!email || !email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation - match registration requirements
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    } else if (password.length > 50) {
      newErrors.password = 'Password must be less than 50 characters';
    }

    if (!passwordConfirmation.trim()) {
      newErrors.passwordConfirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }

    if (!token) {
      newErrors.token = 'Reset token is missing. Please use the link from your email.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      const validationErrors = Object.values(errors).filter(Boolean);
      if (validationErrors.length > 0) {
        setErrorMessage(validationErrors.join('\n'));
        setShowErrorModal(true);
      }
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        })
      ).unwrap();
    } catch (error) {
      // Error is handled by useEffect
      console.log('Reset password failed:', error);
    }
  };

  const handleFocus = field => {
    setIsFocused({ ...isFocused, [field]: true });
    setErrors({ ...errors, [field]: null });
  };

  const handleBlur = field => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleEmailChange = text => {
    setEmail(text);
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handlePasswordChange = text => {
    // Limit password length
    const processedValue = text.slice(0, 50);
    setPassword(processedValue);
    if (errors.password) {
      setErrors({ ...errors, password: null });
    }
  };

  const handlePasswordConfirmationChange = text => {
    // Limit password confirmation length
    const processedValue = text.slice(0, 50);
    setPasswordConfirmation(processedValue);
    if (errors.passwordConfirmation) {
      setErrors({ ...errors, passwordConfirmation: null });
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Always navigate to LoginScreen after successful password reset
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
              {!showEmailVerified && (
                <TouchableOpacity
                  style={[styles.backButton, { top: (insets?.top || 0) + p(10) }]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-left" size={20} color="#019a34" />
                </TouchableOpacity>
              )}

              {showEmailVerified ? (
                // Show "Email verified successfully" message first
                <View style={styles.verifiedContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="check-circle" size={p(80)} color="#4CAF50" />
                  </View>
                  <Text style={styles.verifiedTitle}>Email Verified Successfully!</Text>
                  <Text style={styles.verifiedSubtitle}>
                    Your email has been verified. Please set a new password for your account.
                  </Text>
                  <ActivityIndicator size="large" color="#019a34" style={styles.loadingIndicator} />
                </View>
              ) : showPasswordForm ? (
                // Show password reset form
                <>
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Enter your new password below
                  </Text>

                  {/* Email field - hidden but email is stored for API call */}
                  {email && (
                    <View style={styles.hiddenEmailContainer}>
                      <Text style={styles.hiddenEmailText}>Email: {email}</Text>
                    </View>
                  )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isFocused.password && styles.inputFocused,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Enter your new password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    editable={!resetPasswordLoading}
                    returnKeyType="next"
                    maxLength={50}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isFocused.passwordConfirmation && styles.inputFocused,
                      errors.passwordConfirmation && styles.inputError,
                    ]}
                    placeholder="Confirm your new password"
                    placeholderTextColor="#888"
                    value={passwordConfirmation}
                    onChangeText={handlePasswordConfirmationChange}
                    onFocus={() => handleFocus('passwordConfirmation')}
                    onBlur={() => handleBlur('passwordConfirmation')}
                    secureTextEntry={!showPasswordConfirmation}
                    editable={!resetPasswordLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                    maxLength={50}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showPasswordConfirmation ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.passwordConfirmation && (
                  <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>
                )}
              </View>

              {errors.token && (
                <View style={styles.tokenErrorContainer}>
                  <Text style={styles.tokenErrorText}>{errors.token}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  resetPasswordLoading && styles.resetButtonDisabled,
                ]}
                onPress={handleResetPassword}
                activeOpacity={0.8}
                disabled={resetPasswordLoading}
              >
                {resetPasswordLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Remember your password?</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('Login')}
                    >
                      <Text style={styles.loginLink}> Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Password Reset Successful!"
        message={resetPasswordMessage || 'Your password has been reset successfully. You can now sign in with your new password.'}
        buttonText="Go to Login"
        onButtonPress={handleCloseSuccessModal}
      />

      {/* Error Modal */}

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleCloseErrorModal}
        title="Reset Failed"
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
  backButton: {
    position: 'absolute',
    left: p(16),
    top: p(16),
    padding: p(8),
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: p(20),
    width: p(40),
    height: p(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  inputReadOnly: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  errorText: {
    color: '#ff4757',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    marginTop: p(6),
    marginLeft: p(6),
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: p(50),
  },
  eyeIcon: {
    position: 'absolute',
    right: p(18),
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: p(6),
    zIndex: 1,
    paddingTop: p(0),
  },
  tokenErrorContainer: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff4757',
    borderRadius: p(12),
    padding: p(12),
    marginBottom: p(16),
  },
  tokenErrorText: {
    color: '#ff4757',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  resetButton: {
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
  resetButtonDisabled: {
    backgroundColor: '#7fb892',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.6,
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
  verifiedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(40),
    minHeight: p(300),
  },
  iconContainer: {
    marginBottom: p(24),
  },
  verifiedTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: 'Montserrat-Bold',
    color: '#019a34',
    marginBottom: p(12),
    textAlign: 'center',
  },
  verifiedSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: p(24),
    lineHeight: p(22),
    marginBottom: p(24),
  },
  loadingIndicator: {
    marginTop: p(20),
  },
  hiddenEmailContainer: {
    display: 'none',
  },
  hiddenEmailText: {
    display: 'none',
  },
});

export default ResetPasswordScreen;

