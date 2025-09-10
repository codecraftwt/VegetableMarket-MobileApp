import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ErrorModal = ({ 
  visible, 
  onClose, 
  title = 'Error!', 
  message = 'Something went wrong. Please try again.',
  buttonText = 'OK',
  onButtonPress,
  showRetry = false,
  onRetry 
}) => {
  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Icon name="alert-circle" size={p(50)} color="#F44336" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            {showRetry && (
              <TouchableOpacity 
                style={[styles.button, styles.retryButton]} 
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleButtonPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(16),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: p(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    marginBottom: p(12),
  },
  title: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: p(8),
  },
  message: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(18),
    marginBottom: p(20),
    paddingHorizontal: p(8),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: p(12),
    width: '100%',
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: p(10),
    paddingHorizontal: p(16),
    borderRadius: p(8),
    minWidth: p(80),
    alignItems: 'center',
    flex: 1,
    maxWidth: p(100),
  },
  primaryButton: {
    backgroundColor: '#F44336',
  },
  retryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  retryButtonText: {
    color: '#F44336',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default ErrorModal;
