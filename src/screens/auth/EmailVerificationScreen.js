import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ImageBackground, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { checkEmailVerified, resendVerificationEmail, clearVerificationState, clearAuth } from '../../redux/slices/authSlice';
import { p } from '../../utils/Responsive';
import SuccessModal from '../../components/SuccessModal';

const fontSizes = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24 };

const EmailVerificationScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, emailVerified, verificationLoading, resendLoading, resendMessage, verificationError } = useSelector(state => state.auth);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pollStatus = useCallback(() => {
    dispatch(checkEmailVerified());
  }, [dispatch]);

  useEffect(() => {
    // Initial check
    pollStatus();
    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  useEffect(() => {
    if (emailVerified) {
      // Show success modal instead of navigating to dashboard
      setShowSuccessModal(true);
    }
  }, [emailVerified]);

  useEffect(() => {
    return () => {
      dispatch(clearVerificationState());
    };
  }, [dispatch]);

  const handleResend = () => {
    dispatch(resendVerificationEmail());
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Clear auth state and navigate back to login
    dispatch(clearAuth());
    navigation.replace('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <ImageBackground source={require('../../assets/vegebg1.png')} style={styles.container} blurRadius={0.8}>
        <View style={styles.overlay} />
        <View style={styles.content}>        
          <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to {user?.email}. Please check your inbox and tap the link to continue.
          </Text>

          <View style={styles.statusRow}>
            {verificationLoading ? (
              <ActivityIndicator color="#019a34" />
            ) : (
              <Text style={styles.statusText}>Waiting for verification...</Text>
            )}
          </View>

          {!!verificationError && <Text style={styles.error}>{verificationError}</Text>}
          {!!resendMessage && <Text style={styles.message}>{resendMessage}</Text>}

          <TouchableOpacity style={[styles.button, resendLoading && styles.buttonDisabled]} onPress={handleResend} disabled={resendLoading} activeOpacity={0.8}>
            {resendLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Resend Email</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondary} onPress={pollStatus} activeOpacity={0.7}>
            <Text style={styles.secondaryText}>I have verified, Continue</Text>
          </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Account Verified Successfully!"
        message="Your email has been verified. You can now sign in to access the fresh vegetable marketplace."
        buttonText="Sign In"
        onButtonPress={handleSuccessModalClose}
        closeOnBackdropPress={false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#019a34' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: p(16) },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: p(24),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: p(30),
    elevation: 20,
  },
  title: { fontSize: fontSizes['2xl'], color: '#019a34', textAlign: 'center', marginBottom: p(8), fontFamily: 'Montserrat-Bold' },
  subtitle: { fontSize: fontSizes.sm, color: '#444', textAlign: 'center', marginBottom: p(16), fontFamily: 'Poppins-Regular' },
  statusRow: { alignItems: 'center', marginBottom: p(12) },
  statusText: { fontSize: fontSizes.sm, color: '#019a34', fontFamily: 'Poppins-Medium' },
  button: {
    backgroundColor: '#019a34',
    height: p(48),
    borderRadius: p(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: p(6),
  },
  buttonDisabled: { backgroundColor: '#7fb892' },
  buttonText: { color: '#fff', fontSize: fontSizes.base, fontFamily: 'Poppins-SemiBold' },
  secondary: { alignItems: 'center', marginTop: p(12) },
  secondaryText: { color: '#019a34', fontSize: fontSizes.sm, fontFamily: 'Poppins-SemiBold' },
  error: { color: '#ff4757', textAlign: 'center', marginTop: p(8), fontSize: fontSizes.xs },
  message: { color: '#2c7a7b', textAlign: 'center', marginTop: p(8), fontSize: fontSizes.xs },
});

export default EmailVerificationScreen;


