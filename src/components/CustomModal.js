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
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
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
    borderRadius: p(8),
    padding: p(16),
    width: width * 0.8,
    maxWidth: p(300),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    alignItems: 'center',
    marginBottom: p(16),
  },
  title: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(16),
  },
  optionsContainer: {
    marginBottom: p(16),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    paddingHorizontal: p(10),
    borderRadius: p(8),
    backgroundColor: '#f8f9fa',
    marginBottom: p(10),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionIcon: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(10),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(2),
  },
  optionSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  cancelButton: {
    paddingVertical: p(10),
    borderRadius: p(8),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default CustomModal;
