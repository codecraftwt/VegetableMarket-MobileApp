import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const SuccessModal = ({ 
  visible, 
  onClose, 
  title = 'Success!', 
  message = 'Operation completed successfully',
  buttonText = 'OK',
  onButtonPress,
  showSecondaryButton = false,
  secondaryButtonText = 'Cancel',
  onSecondaryButtonPress,
  buttonStyle,
  closeOnBackdropPress = true
}) => {
  const handleButtonPress = () => {
    // Always call onClose first to ensure modal closes
    onClose();
    // Then call onButtonPress if provided
    if (onButtonPress) {
      onButtonPress();
    }
  };

  const handleSecondaryButtonPress = () => {
    if (onSecondaryButtonPress) {
      onSecondaryButtonPress();
    }
    // Don't automatically close modal - let parent handle it
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeOnBackdropPress ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={closeOnBackdropPress ? onClose : undefined}
        />
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={p(50)} color="#4CAF50" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            {showSecondaryButton && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { paddingVertical: p(9.8), paddingHorizontal: p(15),}]} 
                onPress={handleSecondaryButtonPress}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, buttonStyle]} 
              onPress={handleButtonPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText} numberOfLines={1}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: p(12),
    width: '100%',
  },
  button: {
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
});

export default SuccessModal;
