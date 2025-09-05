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
  buttonStyle
}) => {
  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      onClose();
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
                style={[styles.button, styles.secondaryButton]} 
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
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default SuccessModal;
