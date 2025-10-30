import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import { CustomModal } from '../../../components';
import { addVegetable, clearFarmerVegetablesError, clearFarmerVegetablesSuccess } from '../../../redux/slices/farmerVegetablesSlice';
import { fetchVegetableCategories } from '../../../redux/slices/vegetablesSlice';

const AddVegetableScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading, error, success, message } = useSelector(state => state.farmerVegetables);
  const { categories, categoriesLoading, categoriesError } = useSelector(state => state.vegetables);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    unit_type: 'kg',
    stock: '',
    availablestock: '',
    is_organic: '0',
    harvest_date: '',
    grade: '',
  });

  // Categories are now fetched from API via Redux

  const unitTypes = ['kg', 'qty'];
  const grades = ['A', 'B', 'C'];

  useEffect(() => {
    // Clear any lingering success state when component mounts
    dispatch(clearFarmerVegetablesSuccess());
    // Fetch categories from API when component mounts
    dispatch(fetchVegetableCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      setShowSuccessModal(true);
      // Clear the success state immediately to prevent re-triggering
      dispatch(clearFarmerVegetablesSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Requesting storage permission...');
        
        // For Android 13+ (API level 33+), we need READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE
        const androidVersion = Platform.Version;
        let permission;
        
        if (androidVersion >= 33) {
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }
        
        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your photos to select images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        console.log('Storage permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Storage permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = () => {
    setShowPhotoModal(true);
  };

  const handleModalClose = () => {
    setShowPhotoModal(false);
  };

  const handleCameraOption = () => {
    setShowPhotoModal(false);
    openCamera();
  };

  const handleGalleryOption = () => {
    setShowPhotoModal(false);
    openImageLibrary();
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required to take photos');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImages(prev => [...prev, response.assets[0]]);
      }
    });
  };

  const openImageLibrary = async () => {
    console.log('Opening gallery...');

    try {
      // Check permissions first
      if (Platform.OS === 'android') {
        const hasStoragePermission = await requestStoragePermission();
        if (!hasStoragePermission) {
          Alert.alert('Permission Denied', 'Photo access permission is required to select images from your gallery.');
          return;
        }
      }

      // Try with basic options first
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 5 - selectedImages.length, // Allow up to 5 images total
        maxWidth: 1000,
        maxHeight: 1000,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      console.log('Launching gallery with options:', options);
      const response = await launchImageLibrary(options);
      console.log('Gallery response:', response);

      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (response.errorCode) {
        console.log('Gallery error:', response.errorMessage);
        
        // If it's the intent error, try with different options
        if (response.errorMessage?.includes('No Activity found to handle Intent')) {
          console.log('Trying alternative gallery options...');
          await tryAlternativeGallery();
          return;
        }
        
        let errorMsg = 'Failed to access gallery. ';
        
        if (response.errorMessage?.includes('permission')) {
          errorMsg += 'Please grant photo access permission in your device settings.';
        } else {
          errorMsg += response.errorMessage || 'Please try again.';
        }
        
        Alert.alert('Gallery Error', errorMsg);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setSelectedImages(prev => [...prev, ...response.assets]);
      } else {
        console.error('No assets in gallery response');
        Alert.alert('Error', 'No image selected. Please try again.');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      
      // If it's the intent error, try alternative method
      if (error.message?.includes('No Activity found to handle Intent')) {
        console.log('Trying alternative gallery method...');
        await tryAlternativeGallery();
        return;
      }
      
      let errorMsg = 'Failed to access gallery. ';
      
      if (error.message?.includes('permission')) {
        errorMsg += 'Please grant photo access permission in your device settings.';
      } else {
        errorMsg += error.message || 'Please try again.';
      }
      
      Alert.alert('Gallery Error', errorMsg);
    }
  };

  const tryAlternativeGallery = async () => {
    try {
      console.log('Trying alternative gallery method...');
      
      const alternativeOptions = {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
        selectionLimit: 5 - selectedImages.length,
        maxWidth: 600,
        maxHeight: 600,
        presentationStyle: 'pageSheet',
        includeExtra: false,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      const response = await launchImageLibrary(alternativeOptions);
      console.log('Alternative gallery response:', response);

      if (response.didCancel) {
        console.log('User cancelled alternative gallery');
        return;
      }

      if (response.errorCode) {
        console.log('Alternative gallery error:', response.errorMessage);
        Alert.alert('Gallery Error', 'No gallery app found on your device. Please install a gallery app or use the camera instead.');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setSelectedImages(prev => [...prev, ...response.assets]);
      } else {
        console.error('No assets in alternative gallery response');
        Alert.alert('Error', 'No image selected. Please try again.');
      }
    } catch (error) {
      console.error('Alternative gallery error:', error);
      Alert.alert('Gallery Error', 'No gallery app found on your device. Please install a gallery app or use the camera instead.');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleInputChange('harvest_date', dateString);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select harvest date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter vegetable name');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter description');
      return false;
    }
    if (!formData.category_id) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert('Validation Error', 'Please enter price');
      return false;
    }
    if (!formData.stock.trim()) {
      Alert.alert('Validation Error', 'Please enter stock quantity');
      return false;
    }
    if (!formData.availablestock.trim()) {
      Alert.alert('Validation Error', 'Please enter available stock');
      return false;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    
    // Add form fields
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('category_id', formData.category_id);
    submitData.append('price', formData.price.trim());
    submitData.append('unit_type', formData.unit_type);
    submitData.append('stock', formData.stock.trim());
    submitData.append('availablestock', formData.availablestock.trim());
    submitData.append('is_organic', formData.is_organic);
    
    if (formData.harvest_date) {
      submitData.append('harvest_date', formData.harvest_date);
    }
    if (formData.grade) {
      submitData.append('grade', formData.grade);
    }

    // Add images - use lowercase 'images[]' like other screens
    selectedImages.forEach((image, index) => {
      submitData.append('images[]', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || `vegetable_image_${index}.jpg`,
      });
    });
    
    // Debug: Log FormData structure
    console.log('FormData _parts after adding images:', submitData._parts);
    console.log('Number of images added:', selectedImages.length);

    dispatch(addVegetable(submitData));
  };

  const renderImagePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Icon name="camera" size={16} color="#019a34" /> Vegetable Images
      </Text>
      <Text style={styles.sectionDescription}>Add up to 5 images of your vegetable</Text>
      
      <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
        <View style={styles.imagePickerIcon}>
          <Icon name="camera" size={p(32)} color="#019a34" />
        </View>
        <Text style={styles.imagePickerText}>Add Images</Text>
        <Text style={styles.imagePickerSubtext}>Tap to select from camera or gallery</Text>
      </TouchableOpacity>
      
      {selectedImages.length > 0 && (
        <View style={styles.selectedImagesContainer}>
          <Text style={styles.selectedImagesTitle}>Selected Images ({selectedImages.length}/5)</Text>
          <View style={styles.imagesGrid}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="times" size={12} color="#fff" />
                </TouchableOpacity>
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageNumber}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderFormField = (label, field, placeholder, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={field === 'description'}
        numberOfLines={field === 'description' ? 4 : 1}
      />
    </View>
  );

  const renderPickerField = (label, field, options, valueKey = 'id', labelKey = 'name') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option[valueKey]}
            style={[
              styles.pickerOption,
              formData[field] === option[valueKey] && styles.pickerOptionSelected
            ]}
            onPress={() => handleInputChange(field, option[valueKey])}
          >
            <Text style={[
              styles.pickerOptionText,
              formData[field] === option[valueKey] && styles.pickerOptionTextSelected
            ]}>
              {option[labelKey]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Add Vegetable"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="info-circle" size={16} color="#019a34" /> Basic Information
              </Text>
              {renderFormField('Vegetable Name *', 'name', 'Enter vegetable name')}
              {renderFormField('Description *', 'description', 'Enter description')}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                {categoriesLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : categoriesError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load categories</Text>
                  </View>
                ) : (
                  <View style={styles.pickerContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.pickerOption,
                          formData.category_id === category.id.toString() && styles.pickerOptionSelected
                        ]}
                        onPress={() => handleInputChange('category_id', category.id.toString())}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.category_id === category.id.toString() && styles.pickerOptionTextSelected
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="dollar" size={16} color="#019a34" /> Pricing & Stock
              </Text>
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  {renderFormField('Price *', 'price', '₹0.00', 'numeric')}
                </View>
                <View style={styles.halfWidth}>
                  {renderPickerField('Unit Type', 'unit_type', unitTypes.map(type => ({ id: type, name: type })))}
                </View>
              </View>
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  {renderFormField('Total Stock *', 'stock', '0', 'numeric')}
                </View>
                <View style={styles.halfWidth}>
                  {renderFormField('Available Stock *', 'availablestock', '0', 'numeric')}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Icon name="star" size={16} color="#019a34" /> Quality & Details
              </Text>
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  {renderPickerField('Organic', 'is_organic', [
                    { id: '0', name: 'No' },
                    { id: '1', name: 'Yes' }
                  ])}
                </View>
                <View style={styles.halfWidth}>
                  {renderPickerField('Grade', 'grade', grades.map(grade => ({ id: grade, name: grade })))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Harvest Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar" size={16} color="#019a34" />
                  <Text style={styles.datePickerText}>
                    {formatDate(formData.harvest_date)}
                  </Text>
                  <Icon name="chevron-down" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {renderImagePicker()}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <View style={styles.submitButtonContent}>
                {loading ? (
                  <>
                    <Icon name="spinner" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Adding Vegetable...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Add Vegetable</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Vegetable Added Successfully!"
        message={message || 'Your vegetable has been added to your inventory.'}
        buttonText="Continue"
        onClose={() => {
          setShowSuccessModal(false);
        }}
        onButtonPress={() => {
          navigation.goBack();
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmerVegetablesError());
        }}
      />

      {/* Photo Selection Modal */}
      <CustomModal
        visible={showPhotoModal}
        onClose={handleModalClose}
        onCameraPress={handleCameraOption}
        onGalleryPress={handleGalleryOption}
      />

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.harvest_date ? new Date(formData.harvest_date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: p(16),
    paddingBottom: p(100), 
  },
  content: {
    flex: 1,
    padding: p(16),
  },
  form: {
    gap: p(20),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: p(16),
    padding: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(8),
  },
  sectionDescription: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(16),
    lineHeight: p(18),
  },
  inputGroup: {
    marginBottom: p(16),
  },
  inputLabel: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(8),
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: p(12),
    padding: p(16),
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#fff',
    minHeight: p(48),
  },
  rowContainer: {
    flexDirection: 'row',
    gap: p(12),
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(8),
  },
  pickerOption: {
    paddingHorizontal: p(16),
    paddingVertical: p(10),
    borderRadius: p(25),
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#fff',
    minWidth: p(60),
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerOptionText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: p(24),
    borderWidth: 2,
    borderColor: '#019a34',
    borderStyle: 'dashed',
    borderRadius: p(16),
    backgroundColor: '#f8fff8',
    marginTop: p(8),
  },
  imagePickerIcon: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: p(12),
  },
  imagePickerText: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    marginBottom: p(4),
  },
  imagePickerSubtext: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  selectedImagesContainer: {
    marginTop: p(20),
  },
  selectedImagesTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(12),
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(12),
  },
  imageItem: {
    position: 'relative',
  },
  selectedImage: {
    width: p(80),
    height: p(80),
    borderRadius: p(12),
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -p(6),
    right: -p(6),
    backgroundColor: '#dc3545',
    width: p(20),
    height: p(20),
    borderRadius: p(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: p(4),
    left: p(4),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: p(8),
    paddingHorizontal: p(6),
    paddingVertical: p(2),
  },
  imageNumber: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    backgroundColor: '#019a34',
    borderRadius: p(16),
    marginTop: p(20),
    marginBottom: p(20),
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(16),
    gap: p(8),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
  },
  // Category loading and error styles
  loadingContainer: {
    padding: p(20),
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    fontSize: fontSizes.medium,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: p(20),
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: p(8),
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  errorText: {
    fontSize: fontSizes.medium,
    color: '#e53e3e',
    textAlign: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: p(12),
    padding: p(16),
    backgroundColor: '#fff',
    gap: p(12),
  },
  datePickerText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    flex: 1,
  },
});

export default AddVegetableScreen;
