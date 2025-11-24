import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ConfirmationModal = ({ 
  visible, 
  onClose, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonStyle = 'primary', 
  icon = 'help-circle'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  const getIconColor = () => {
    switch (confirmButtonStyle) {
      case 'destructive':
        return '#F44336';
      case 'info':
        return '#2196F3';
      default:
        return '#FF9800';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (confirmButtonStyle) {
      case 'destructive':
        return styles.destructiveButton;
      default:
        return styles.primaryButton;
    }
  };

  const getConfirmButtonTextStyle = () => {
    switch (confirmButtonStyle) {
      case 'destructive':
        return styles.destructiveButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose || (() => {})}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose || (() => {})}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={icon} size={p(50)} color={getIconColor()} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, getConfirmButtonStyle()]} 
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={getConfirmButtonTextStyle()}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(20),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(24),
    alignItems: 'center',
    width: width * 0.9,
    maxWidth: p(340),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: p(20),
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(20),
    borderWidth: 2,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  title: {
    fontSize: fontSizes.xl,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: p(12),
    letterSpacing: 0.3,
  },
  message: {
    fontSize: fontSizes.md,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(22),
    marginBottom: p(28),
    paddingHorizontal: p(4),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: p(16),
    width: '100%',
  },
  button: {
    paddingVertical: p(14),
    paddingHorizontal: p(24),
    borderRadius: p(12),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: p(48),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: p(4),
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  primaryButton: {
    backgroundColor: '#019a34',
    shadowColor: '#019a34',
    shadowOpacity: 0.3,
    shadowRadius: p(8),
    elevation: 6,
  },
  destructiveButton: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
    shadowOpacity: 0.3,
    shadowRadius: p(8),
    elevation: 6,
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: fontSizes.md,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: fontSizes.md,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
  destructiveButtonText: {
    color: '#fff',
    fontSize: fontSizes.md,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
});

export default ConfirmationModal;
