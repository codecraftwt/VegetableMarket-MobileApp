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
    paddingHorizontal: p(20),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(25),
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: p(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: p(15),
  },
  title: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: p(10),
  },
  message: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(22),
    marginBottom: p(25),
    paddingHorizontal: p(10),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: p(15),
    width: '100%',
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(25),
    minWidth: p(100),
    alignItems: 'center',
    flex: 1,
    maxWidth: p(120),
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
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  retryButtonText: {
    color: '#F44336',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default ErrorModal;
