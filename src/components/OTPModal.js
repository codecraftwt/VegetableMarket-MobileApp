import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const OTPModal = ({ 
  visible, 
  onClose, 
  onVerifyOTP, 
  onResendOTP,
  loading = false,
  error = null,
  orderId = null 
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '']);
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [visible]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus the last filled input or the next empty one
      const lastFilledIndex = pastedOtp.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.blur();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    onVerifyOTP(otpString);
  };

  const handleResend = () => {
    Alert.alert(
      'Resend OTP',
      'Are you sure you want to resend the OTP?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Resend', onPress: onResendOTP }
      ]
    );
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Enter OTP</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="times" size={p(20)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Please enter the 6-digit OTP sent to the customer for order #{orderId}
            </Text>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="exclamation-triangle" size={p(16)} color="#dc3545" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    error && styles.otpInputError
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={6}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.resendButton, loading && styles.disabledButton]}
                onPress={handleResend}
                disabled={loading}
              >
                <Icon name="refresh" size={p(16)} color="#019a34" />
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (!isOtpComplete || loading) && styles.disabledButton
                ]}
                onPress={handleVerify}
                disabled={!isOtpComplete || loading}
              >
                {loading ? (
                  <Icon name="spinner" size={p(16)} color="#fff" />
                ) : (
                  <Icon name="check" size={p(16)} color="#fff" />
                )}
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: p(400),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  title: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  closeButton: {
    padding: p(4),
  },
  description: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: p(20),
    lineHeight: p(20),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: p(12),
    borderRadius: p(8),
    marginBottom: p(16),
  },
  errorText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#721c24',
    marginLeft: p(8),
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(24),
    gap: p(8),
  },
  otpInput: {
    width: p(45),
    height: p(50),
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: p(8),
    textAlign: 'center',
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#019a34',
    backgroundColor: '#f0f8f0',
  },
  otpInputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  buttonContainer: {
    gap: p(12),
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#019a34',
    backgroundColor: '#fff',
    gap: p(6),
  },
  resendButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    backgroundColor: '#019a34',
    gap: p(6),
  },
  verifyButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default OTPModal;
