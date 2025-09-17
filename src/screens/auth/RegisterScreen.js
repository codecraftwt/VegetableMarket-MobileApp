import React, { useState, useEffect, useRef } from 'react';
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
import { registerUser, clearError, ROLES } from '../../redux/slices/authSlice';
import { getFontFamily, fontSizes } from '../../utils/fonts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error, isLoggedIn, token } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    phone: false,
    role: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasNavigated = useRef(false);

  // Get roles from the auth slice
  const roles = Object.values(ROLES).map(role => role.name);

  // After registration, navigate to email verification screen
  useEffect(() => {
    // In updated flow, register no longer sets isLoggedIn true; rely on token presence
    if (token && !hasNavigated.current) {
      hasNavigated.current = true;
      // Directly navigate to EmailVerification screen
      setTimeout(() => {
        navigation.replace('EmailVerification');
      }, 200);
    }
  }, [token, navigation]);

  // Handle registration errors
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 50) {
      newErrors.password = 'Password must be less than 50 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    // Reset navigation flag for new registration attempt
    hasNavigated.current = false;
    
    // Dispatch the register action
    dispatch(registerUser(formData));
  };

  const handleFocus = field => {
    setIsFocused({ ...isFocused, [field]: true });
    setErrors({ ...errors, [field]: null });
  };

  const handleBlur = field => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Field-specific input processing
    if (field === 'phone') {
      // Only allow numbers and limit to 10 digits
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (field === 'name') {
      // Only allow letters and spaces, limit length
      processedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    } else if (field === 'email') {
      // Allow email characters, limit length
      processedValue = value.slice(0, 100);
    } else if (field === 'password' || field === 'confirmPassword') {
      // Limit password length
      processedValue = value.slice(0, 50);
    }
    
    setFormData({ ...formData, [field]: processedValue });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setShowRoleDropdown(false);
    setErrors({ ...errors, role: null });
  };

  const handleSuccessModalClose = () => {};

  const handleErrorModalClose = () => {
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
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>
                Create your account to access the fresh vegetable marketplace
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.name && styles.inputFocused,
                    errors.name && styles.inputError,
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                  maxLength={50}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

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
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                  maxLength={100}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={[
                    styles.input,
                    isFocused.phone && styles.inputFocused,
                    errors.phone && styles.inputError,
                  ]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#888"
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  keyboardType="phone-pad"
                  editable={!loading}
                  returnKeyType="next"
                  maxLength={10}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Register As</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.roleInput,
                    isFocused.role && styles.inputFocused,
                    errors.role && styles.inputError,
                  ]}
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.roleText,
                    !formData.role && styles.placeholderText
                  ]}>
                    {formData.role || '-- Select Role --'}
                  </Text>
                  <Icon
                    name={showRoleDropdown ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#666"
                  />
                </TouchableOpacity>
                {showRoleDropdown && (
                  <View style={styles.dropdown}>
                    {roles.map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={styles.dropdownItem}
                        onPress={() => handleRoleSelect(role)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.role && (
                  <Text style={styles.errorText}>{errors.role}</Text>
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
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    editable={!loading}
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

              {formData.password.length >= 5 && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        isFocused.confirmPassword && styles.inputFocused,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#888"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                      maxLength={50}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={showConfirmPassword ? 'eye-slash' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  loading && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Login')}
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
        onClose={handleSuccessModalClose}
        title="Account Created Successfully!"
        message="Your account has been created successfully. You can now sign in to access the fresh vegetable marketplace."
        buttonText="Got it"
        closeOnBackdropPress={false}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Registration Failed"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
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
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: p(24),
    padding: p(20),
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
    lineHeight: p(18),
    paddingHorizontal: p(8),
  },
  inputContainer: {
    marginBottom: p(14),
  },
  inputLabel: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    marginBottom: p(5),
    marginLeft: p(4),
  },
  input: {
    height: p(48),
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: p(14),
    paddingHorizontal: p(16),
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
    shadowRadius: p(12),
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
    marginTop: p(4),
    marginLeft: p(4),
  },
  roleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#888',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: p(10),
    marginTop: p(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: p(8),
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: p(8),
    paddingHorizontal: p(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: p(48),
  },
  eyeIcon: {
    position: 'absolute',
    right: p(16),
    top: '50%',
    transform: [{ translateY: -p(10) }],
    padding: p(6),
    zIndex: 1,
  },
  registerButton: {
    backgroundColor: '#019a34',
    height: p(48),
    borderRadius: p(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: p(6),
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: p(16),
    elevation: 12,
  },
  registerButtonDisabled: {
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
});

export default RegisterScreen;