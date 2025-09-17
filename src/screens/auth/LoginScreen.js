import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import ErrorModal from '../../components/ErrorModal';

// Font sizes constant
const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error, isLoggedIn, user, emailVerified } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Redux error and show error modal
  React.useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
      dispatch(clearError());
    }
  }, [dispatch, error]);

  // Handle successful login navigation
  React.useEffect(() => {
    if (isLoggedIn && user) {
      // Check user role and navigate accordingly
      if (user.role_id === 2) {
        // Farmer role
        navigation.replace('FarmerApp');
      } else if (user.role_id === 4) {
        // Delivery agent role
        navigation.replace('DeliveryApp');
      } else {
        // Customer or other roles (role_id === 3)
        navigation.replace('App');
      }
    }
  }, [isLoggedIn, user, navigation]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      // Show validation errors in error modal
      const validationErrors = Object.values(errors).filter(Boolean);
      if (validationErrors.length > 0) {
        setErrorMessage(validationErrors.join('\n'));
        setShowErrorModal(true);
      }
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      if (result.success) {
        // Login successful, navigation will be handled by the auth state change
        console.log('Login successful:', result.message);
      }
    } catch (error) {
      // Error is already handled by the Redux slice and useEffect
      console.log('Login failed:', error);
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
    setPassword(text);
    if (errors.password) {
      setErrors({ ...errors, password: null });
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented here.',
      [{ text: 'OK' }],
    );
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
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
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in to access your fresh vegetable marketplace
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.email && styles.inputFocused,
                    errors.email && styles.inputError,
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isFocused.password && styles.inputFocused,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    onSubmitEditing={handleLogin}
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

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signupLink}> Sign Up</Text>
                </TouchableOpacity>
                             </View>
             </View>
           </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleCloseErrorModal}
        title="Login Failed"
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
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: 'Montserrat-Bold',
    color: '#019a34',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.4,
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
    position: 'relative',
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
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: p(50), // Make space for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: p(18),
    top: '50%',
    transform: [{ translateY: -10 }], // Center vertically
    padding: p(6),
    zIndex: 1,
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: '#7fb892',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.6,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: p(16),
  },
  linkText: {
    color: '#019a34',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.xs,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
  },
  signupLink: {
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSizes.xs,
  },
});

export default LoginScreen;
