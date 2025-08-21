import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const { width } = Dimensions.get('window');

const CustomModal = ({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
  title = 'Choose Photo',
  subtitle = 'Select an option to update your profile picture',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={onCameraPress}
                activeOpacity={0.8}
              >
                <View style={styles.optionIcon}>
                  <Icon name="camera" size={20} color="#019a34" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Camera</Text>
                  <Text style={styles.optionSubtitle}>Take a new photo</Text>
                </View>
                <Icon name="chevron-right" size={14} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={onGalleryPress}
                activeOpacity={0.8}
              >
                <View style={styles.optionIcon}>
                  <Icon name="image" size={20} color="#019a34" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Gallery</Text>
                  <Text style={styles.optionSubtitle}>Choose from photos</Text>
                </View>
                <Icon name="chevron-right" size={14} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    width: width * 0.8,
    maxWidth: p(300),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: p(20),
  },
  title: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(6),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(18),
  },
  optionsContainer: {
    marginBottom: p(20),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(14),
    paddingHorizontal: p(12),
    borderRadius: p(12),
    backgroundColor: '#f8f9fa',
    marginBottom: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(2),
  },
  optionSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  cancelButton: {
    paddingVertical: p(12),
    borderRadius: p(20),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default CustomModal;
