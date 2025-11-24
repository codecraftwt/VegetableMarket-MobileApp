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
import { CustomModal, SkeletonLoader } from '../../../components';
import { 
  updateVegetable, 
  fetchVegetableById,
  clearFarmerVegetablesError, 
  clearFarmerVegetablesSuccess,
  clearSelectedVegetable
} from '../../../redux/slices/farmerVegetablesSlice';
import { fetchVegetableCategories } from '../../../redux/slices/vegetablesSlice';

const EditVegetableScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading, error, success, message, selectedVegetable } = useSelector(state => state.farmerVegetables);
  const { categories, categoriesLoading, categoriesError } = useSelector(state => state.vegetables);
  
  const { vegetableId } = route.params;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    grade: 'A',
  });

  // Categories are now fetched from API via Redux

  const unitTypes = ['kg', 'qty', 'bunch', 'packet'];
  const grades = ['A', 'B', 'C'];

  useEffect(() => {
    // Clear any lingering success state when component mounts
    dispatch(clearFarmerVegetablesSuccess());
    
    // Fetch categories from API
    dispatch(fetchVegetableCategories());
    
    // Fetch vegetable details when component mounts
    if (vegetableId) {
      dispatch(fetchVegetableById(vegetableId));
    }
  }, [dispatch, vegetableId]);

  useEffect(() => {
    if (selectedVegetable) {
      setFormData({
        name: selectedVegetable.name || '',
        description: selectedVegetable.description || '',
        category_id: selectedVegetable.category_id?.toString() || '',
        price: selectedVegetable.price_per_kg || '',
        unit_type: selectedVegetable.unit_type || 'kg',
        stock: selectedVegetable.stock_kg?.toString() || '',
        // availablestock: selectedVegetable.quantity_available || '',
        availablestock: selectedVegetable.quantity_available?.toString() || '',
        is_organic: selectedVegetable.is_organic?.toString() || '0',
        harvest_date: selectedVegetable.harvest_date || '',
        grade: selectedVegetable.grade || 'A',
      });
      
      if (selectedVegetable.images) {
        setExistingImages(selectedVegetable.images);
      }
    }
  }, [selectedVegetable]);

  useEffect(() => {
    if (success && message && isSubmitting) {
      setShowSuccessModal(true);
      setIsSubmitting(false);
      // Clear the success state immediately to prevent re-triggering
      dispatch(clearFarmerVegetablesSuccess());
    }
  }, [success, message, isSubmitting, dispatch]);

  useEffect(() => {
    if (error && isSubmitting) {
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  }, [error, isSubmitting]);

  // Don't clear selected vegetable when component unmounts to preserve state for VegetableDetailsScreen

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = () => {
    setShowPhotoModal(true);
  };

  const handleModalClose = () => {
    setShowPhotoModal(false);
  };

  const handleCameraOption = () => {
    setShowPhotoModal(false);
    setTimeout(() => {
      openCamera();
    }, Platform.OS === 'ios' ? 300 : 100);
  };

  const handleGalleryOption = () => {
    setShowPhotoModal(false);
    setTimeout(() => {
      openImageLibrary();
    }, Platform.OS === 'ios' ? 300 : 100);
  };

  const openCamera = () => {
    const options = Platform.OS === 'ios' ? {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      presentationStyle: 'pageSheet',
    } : {
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
        const newImage = {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName || 'image.jpg',
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    });
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API level 33+), no permission needed for photo picker
        const androidVersion = Platform.Version;

        if (androidVersion >= 33) {
          return true; // No permission needed for Android 13+
        }

        // For older Android versions, use READ_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your photos to select images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Storage permission error:', err);
        return false;
      }
    }
    return true;
  };

  const openImageLibrary = async () => {
    try {
      // Check permissions first - only for Android versions below 13
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;

        if (androidVersion < 33) {
          const hasStoragePermission = await requestStoragePermission();
          if (!hasStoragePermission) {
            Alert.alert('Permission Denied', 'Photo access permission is required to select images from your gallery.');
            return;
          }
        }
      }

      const options = Platform.OS === 'ios' ? {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 5 - existingImages.length - selectedImages.length,
        maxWidth: 1000,
        maxHeight: 1000,
        presentationStyle: 'pageSheet',
      } : {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 5 - existingImages.length - selectedImages.length,
        maxWidth: 1000,
        maxHeight: 1000,
        presentationStyle: 'fullScreen',
        includeExtra: false,
      };

      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        
        // If it's the intent error, try with different options
        if (response.errorMessage?.includes('No Activity found to handle Intent')) {
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
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || 'image.jpg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      } else {
        console.error('No assets in gallery response');
        Alert.alert('Error', 'No image selected. Please try again.');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      
      // If it's the intent error, try alternative method
      if (error.message?.includes('No Activity found to handle Intent')) {
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
      const alternativeOptions = {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
        selectionLimit: 5 - existingImages.length - selectedImages.length,
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
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Gallery Error', 'No gallery app found on your device. Please install a gallery app or use the camera instead.');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || 'image.jpg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      } else {
        console.error('No assets in alternative gallery response');
        Alert.alert('Error', 'No image selected. Please try again.');
      }
    } catch (error) {
      console.error('Alternative gallery error:', error);
      Alert.alert('Gallery Error', 'No gallery app found on your device. Please install a gallery app or use the camera instead.');
    }
  };

  const removeSelectedImage = (index) => {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter vegetable name');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return false;
    }
    if (!formData.category_id) {
      Alert.alert('Error', 'Please select category');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter valid price');
      return false;
    }
    if (!formData.stock || parseFloat(formData.stock) <= 0) {
      Alert.alert('Error', 'Please enter valid stock');
      return false;
    }
    if (!formData.availablestock || parseFloat(formData.availablestock) <= 0) {
      Alert.alert('Error', 'Please enter valid available stock');
      return false;
    }
    if (!formData.harvest_date) {
      Alert.alert('Error', 'Please select harvest date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('category_id', formData.category_id);
    submitData.append('price', formData.price);
    submitData.append('unit_type', formData.unit_type);
    submitData.append('stock', formData.stock);
    submitData.append('availablestock', formData.availablestock);
    submitData.append('is_organic', formData.is_organic);
    submitData.append('harvest_date', formData.harvest_date);
    submitData.append('grade', formData.grade);

    // Add new images - use lowercase 'images[]' like AddVegetableScreen
    selectedImages.forEach((image, index) => {
      submitData.append('images[]', {
        uri: image.uri,
        type: image.type,
        name: image.name,
      });
    });
    dispatch(updateVegetable({ vegetableId, vegetableData: submitData }));
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(50)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="25%" borderRadius={p(4)} />
        <SkeletonLoader height={p(100)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="35%" borderRadius={p(4)} />
        <View style={styles.skeletonRow}>
          <SkeletonLoader height={p(50)} width="48%" borderRadius={p(8)} />
          <SkeletonLoader height={p(50)} width="48%" borderRadius={p(8)} />
        </View>
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <View style={styles.skeletonRow}>
          <SkeletonLoader height={p(50)} width="48%" borderRadius={p(8)} />
          <SkeletonLoader height={p(50)} width="48%" borderRadius={p(8)} />
        </View>
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(100)} width="100%" borderRadius={p(8)} />
      </View>
    </View>
  );

  const renderImagePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Images</Text>
      
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <View style={styles.existingImagesContainer}>
          <Text style={styles.existingImagesTitle}>Current Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((image, index) => (
              <View key={index} style={styles.existingImageContainer}>
                <Image source={{ uri: `https://kisancart.in/storage/${image.image_path}` }} style={styles.existingImage} />
                <Text style={styles.existingImageText}>Current</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* New Images */}
      {selectedImages.length > 0 && (
        <View style={styles.selectedImagesContainer}>
          <Text style={styles.selectedImagesTitle}>New Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.selectedImageContainer}>
                <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeSelectedImage(index)}
                >
                  <Icon name="times" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePicker}>
        <Icon name="camera" size={20} color="#019a34" />
        <Text style={styles.imagePickerText}>
          {selectedImages.length > 0 ? 'Add More Images' : 'Add Images'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.imagePickerHint}>
        You can add up to {5 - existingImages.length} more images
      </Text>
    </View>
  );

  if (loading && !selectedVegetable) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Edit Vegetable"
          showBackButton={true}
          showNotification={true}
          onBackPress={() => navigation.goBack()}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        {renderSkeletonLoader()}
      </SafeAreaView>
    );
  }

  if (!selectedVegetable && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Edit Vegetable"
          showBackButton={true}
          showNotification={true}
          onBackPress={() => navigation.goBack()}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vegetable not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Edit Vegetable"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Vegetable Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter vegetable name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Enter description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
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

          {/* Pricing & Stock */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Stock</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Price per {formData.unit_type} *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => handleInputChange('price', text)}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Unit Type *</Text>
                <View style={styles.pickerContainer}>
                  {unitTypes.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.pickerOption,
                        formData.unit_type === unit && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleInputChange('unit_type', unit)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.unit_type === unit && styles.pickerOptionTextSelected
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Total Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => handleInputChange('stock', text)}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Available Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.availablestock}
                  onChangeText={(text) => handleInputChange('availablestock', text)}
                  placeholder="0"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Quality & Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality & Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Is Organic?</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    formData.is_organic === '1' && styles.pickerOptionSelected
                  ]}
                  onPress={() => handleInputChange('is_organic', '1')}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.is_organic === '1' && styles.pickerOptionTextSelected
                  ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    formData.is_organic === '0' && styles.pickerOptionSelected
                  ]}
                  onPress={() => handleInputChange('is_organic', '0')}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.is_organic === '0' && styles.pickerOptionTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Harvest Date *</Text>
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

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Grade *</Text>
                <View style={styles.pickerContainer}>
                  {grades.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.pickerOption,
                        formData.grade === grade && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleInputChange('grade', grade)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.grade === grade && styles.pickerOptionTextSelected
                      ]}>
                        Grade {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {renderImagePicker()}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Updating...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Update Vegetable</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Vegetable Updated Successfully!"
        message={message || 'Your vegetable has been updated successfully.'}
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: p(20),
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: p(20),
    marginBottom: p(20),
  },
  section: {
    marginBottom: p(25),
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: '#333',
    marginBottom: p(15),
    borderBottomWidth: 2,
    borderBottomColor: '#019a34',
    paddingBottom: p(8),
  },
  inputContainer: {
    marginBottom: p(15),
  },
  label: {
    fontSize: fontSizes.medium,
    fontWeight: '500',
    color: '#333',
    marginBottom: p(8),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: p(12),
    fontSize: fontSizes.medium,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: p(100),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(8),
  },
  pickerOption: {
    paddingHorizontal: p(16),
    paddingVertical: p(8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  pickerOptionSelected: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  pickerOptionText: {
    fontSize: fontSizes.small,
    color: '#666',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#019a34',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: p(20),
    backgroundColor: '#f8fff8',
  },
  imagePickerText: {
    fontSize: fontSizes.medium,
    color: '#019a34',
    marginLeft: p(8),
    fontWeight: '500',
  },
  imagePickerHint: {
    fontSize: fontSizes.small,
    color: '#666',
    textAlign: 'center',
    marginTop: p(8),
  },
  existingImagesContainer: {
    marginBottom: p(15),
  },
  existingImagesTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '500',
    color: '#333',
    marginBottom: p(8),
  },
  existingImageContainer: {
    marginRight: p(10),
    alignItems: 'center',
  },
  existingImage: {
    width: p(80),
    height: p(80),
    borderRadius: 8,
    marginBottom: p(4),
  },
  existingImageText: {
    fontSize: fontSizes.small,
    color: '#666',
  },
  selectedImagesContainer: {
    marginBottom: p(15),
  },
  selectedImagesTitle: {
    fontSize: fontSizes.medium,
    fontWeight: '500',
    color: '#333',
    marginBottom: p(8),
  },
  selectedImageContainer: {
    marginRight: p(10),
    position: 'relative',
  },
  selectedImage: {
    width: p(80),
    height: p(80),
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#019a34',
    borderRadius: 8,
    padding: p(15),
    alignItems: 'center',
    marginTop: p(20),
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.large,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  loadingText: {
    fontSize: fontSizes.large,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  errorText: {
    fontSize: fontSizes.large,
    color: '#dc3545',
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: p(20),
    gap: p(20),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    gap: p(15),
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: p(10),
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: p(12),
    backgroundColor: '#f8f9fa',
    gap: p(8),
  },
  datePickerText: {
    fontSize: fontSizes.medium,
    color: '#333',
    flex: 1,
  },
});

export default EditVegetableScreen;
