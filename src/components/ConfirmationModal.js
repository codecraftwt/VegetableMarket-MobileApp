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
  confirmButtonStyle = 'primary', // 'primary', 'destructive'
  icon = 'help-circle'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getIconColor = () => {
    switch (confirmButtonStyle) {
      case 'destructive':
        return '#F44336';
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
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#666',
  },
  primaryButton: {
    backgroundColor: '#019a34',
  },
  destructiveButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  destructiveButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default ConfirmationModal;
