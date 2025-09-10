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
  Platform,
  Modal,
} from 'react-native';
import { CommonHeader } from '../../../components';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { 
  fetchFarmById, 
  updateFarm, 
  deleteFarmImage,
  addImageCaption,
  setMainImage,
  clearFarmsError, 
  clearFarmsSuccess,
  clearSelectedFarm 
} from '../../../redux/slices/farmsSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';

const EditFarmScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { selectedFarm, loading, error, success, message } = useSelector(state => state.farms);
  
  const { farmId } = route.params;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [imageForCaption, setImageForCaption] = useState(null);
  const [captionText, setCaptionText] = useState('');

  useEffect(() => {
    // Fetch farm details when component mounts
    if (farmId) {
      dispatch(fetchFarmById(farmId));
    }
  }, [dispatch, farmId]);

  // Populate form when farm data is loaded
  useEffect(() => {
    if (selectedFarm) {
      setFormData({
        name: selectedFarm.name || '',
        description: selectedFarm.description || '',
      });
      setExistingImages(selectedFarm.images || []);
    }
  }, [selectedFarm]);

  useEffect(() => {
    // Handle success and error states
    if (success && message) {
      setShowSuccessModal(true);
      dispatch(clearFarmsSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Clear selected farm when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedFarm());
    };
  }, [dispatch]);

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to camera to take photos',
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
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to select images',
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

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
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
        const newImage = {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName || `farm_image_${Date.now()}.jpg`,
        };
        setImages(prev => [...prev, newImage]);
      }
    });
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to select images');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      selectionLimit: 5 - images.length, // Allow up to 5 images total
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `farm_image_${Date.now()}.jpg`,
        }));
        setImages(prev => [...prev, ...newImages]);
      }
    });
  };

  const handleRemoveNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId) => {
    const image = existingImages.find(img => img.id === imageId);
    setImageToDelete(image);
    setShowDeleteImageModal(true);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete) {
      dispatch(deleteFarmImage(imageToDelete.id));
    }
    setShowDeleteImageModal(false);
    setImageToDelete(null);
  };

  const handleAddCaption = (image) => {
    setImageForCaption(image);
    setCaptionText(image.caption || '');
    setShowCaptionModal(true);
  };

  const handleSetMainImage = (imageId) => {
    dispatch(setMainImage(imageId));
  };

  const confirmAddCaption = () => {
    if (imageForCaption && captionText.trim()) {
      dispatch(addImageCaption({ 
        imageId: imageForCaption.id, 
        caption: captionText.trim() 
      }));
    }
    setShowCaptionModal(false);
    setImageForCaption(null);
    setCaptionText('');
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter farm name');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter farm description');
      return;
    }

    if (images.length === 0 && existingImages.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one image');
      return;
    }

    // Create FormData for API
    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('description', formData.description.trim());
    
    images.forEach((image, index) => {
      submitData.append('images[]', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.name,
      });
    });

    dispatch(updateFarm({ farmId, farmData: submitData }));
  };

  const renderImagePicker = () => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.sectionTitle}>Farm Images</Text>
      <Text style={styles.sectionSubtitle}>
        Add new images or keep existing ones (Total: {existingImages.length + images.length})
      </Text>
      
      <View style={styles.imagePickerButtons}>
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleTakePhoto}>
          <Icon name="camera" size={20} color="#019a34" />
          <Text style={styles.imagePickerButtonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.imagePickerButton} onPress={handleSelectFromGallery}>
          <Icon name="photo" size={20} color="#019a34" />
          <Text style={styles.imagePickerButtonText}>From Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <View style={styles.existingImagesContainer}>
          <Text style={styles.existingImagesTitle}>Existing Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((image) => (
              <View key={image.id} style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: `https://vegetables.walstarmedia.com/storage/${image.image_path}` }} 
                  style={styles.imagePreview} 
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveExistingImage(image.id)}
                >
                  <Icon name="times" size={12} color="#fff" />
                </TouchableOpacity>
                {image.is_main === 1 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageBadgeText}>Main</Text>
                  </View>
                )}
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.imageActionButton}
                    onPress={() => handleAddCaption(image)}
                  >
                    <Icon name="edit" size={12} color="#019a34" />
                  </TouchableOpacity>
                  {image.is_main !== 1 && (
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => handleSetMainImage(image.id)}
                    >
                      <Icon name="star" size={12} color="#ffc107" />
                    </TouchableOpacity>
                  )}
                </View>
                {image.caption && (
                  <View style={styles.captionContainer}>
                    <Text style={styles.captionText} numberOfLines={2}>
                      {image.caption}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* New Images */}
      {images.length > 0 && (
        <View style={styles.newImagesContainer}>
          <Text style={styles.newImagesTitle}>New Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((image, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveNewImage(index)}
                >
                  <Icon name="times" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Farm Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter farm name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe your farm..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {renderImagePicker()}
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="30%" borderRadius={p(4)} />
        <SkeletonLoader height={p(50)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="40%" borderRadius={p(4)} />
        <SkeletonLoader height={p(100)} width="100%" borderRadius={p(8)} />
      </View>
      <View style={styles.skeletonSection}>
        <SkeletonLoader height={p(20)} width="35%" borderRadius={p(4)} />
        <SkeletonLoader height={p(60)} width="100%" borderRadius={p(8)} />
      </View>
    </View>
  );

  if (loading && !selectedFarm) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Edit Farm"
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

  if (!selectedFarm) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader
          screenName="Edit Farm"
          showBackButton={true}
          showNotification={true}
          onBackPress={() => navigation.goBack()}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={p(60)} color="#dc3545" />
          <Text style={styles.errorTitle}>Farm Not Found</Text>
          <Text style={styles.errorMessage}>
            The farm you're trying to edit could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Edit Farm"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Farm</Text>
          <Text style={styles.headerSubtitle}>
            Update your farm information and images
          </Text>
        </View>

        {renderForm()}

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <SkeletonLoader height={p(20)} width="60%" borderRadius={p(4)} />
            ) : (
              <>
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Update Farm</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmsSuccess());
          // Navigate back to farm details after successful update (not for image deletion)
          if (message && !message.includes('Image deleted')) {
            navigation.goBack();
          }
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={error}
        onClose={() => {
          setShowErrorModal(false);
          dispatch(clearFarmsError());
        }}
      />

      {/* Delete Image Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteImageModal}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteImage}
        onCancel={() => {
          setShowDeleteImageModal(false);
          setImageToDelete(null);
        }}
        confirmButtonStyle="destructive"
        icon="delete-alert"
      />

      {/* Caption Modal */}
      <Modal
        visible={showCaptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCaptionModal(false);
          setImageForCaption(null);
          setCaptionText('');
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => {
            setShowCaptionModal(false);
            setImageForCaption(null);
            setCaptionText('');
          }}
        >
          <TouchableOpacity 
            style={styles.captionModalContainer} 
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.captionModalHeader}>
              <Icon name="edit" size={p(30)} color="#019a34" />
              <Text style={styles.captionModalTitle}>Add Caption</Text>
            </View>
            
            <Text style={styles.captionModalMessage}>
              Enter a caption for this image:
            </Text>
            
            <TextInput
              style={styles.captionInput}
              value={captionText}
              onChangeText={setCaptionText}
              placeholder="Enter image caption..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <View style={styles.captionModalButtons}>
              <TouchableOpacity 
                style={styles.captionCancelButton} 
                onPress={() => {
                  setShowCaptionModal(false);
                  setImageForCaption(null);
                  setCaptionText('');
                }}
              >
                <Text style={styles.captionCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captionSaveButton} 
                onPress={confirmAddCaption}
              >
                <Text style={styles.captionSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  content: {
    flex: 1,
    padding: p(12),
  },
  header: {
    marginBottom: p(16),
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(6),
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: p(18),
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: p(16),
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(6),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(10),
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: p(80),
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    marginTop: p(8),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(6),
  },
  sectionSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(12),
  },
  imagePickerButtons: {
    flexDirection: 'row',
    gap: p(8),
    marginBottom: p(16),
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#019a34',
    borderRadius: p(8),
    paddingVertical: p(10),
    gap: p(6),
  },
  imagePickerButtonText: {
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  existingImagesContainer: {
    marginBottom: p(12),
  },
  newImagesContainer: {
    marginBottom: p(12),
  },
  existingImagesTitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(10),
  },
  newImagesTitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
    marginBottom: p(10),
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: p(10),
  },
  imagePreview: {
    width: p(70),
    height: p(70),
    borderRadius: p(6),
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: p(-4),
    right: p(-4),
    backgroundColor: '#dc3545',
    borderRadius: p(8),
    width: p(18),
    height: p(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: p(-4),
    left: p(-4),
    backgroundColor: '#019a34',
    paddingHorizontal: p(3),
    paddingVertical: p(1),
    borderRadius: p(6),
  },
  mainImageBadgeText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  submitContainer: {
    marginBottom: p(16),
  },
  submitButton: {
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    borderRadius: p(8),
    gap: p(6),
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(40),
  },
  errorTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: p(20),
    marginBottom: p(8),
  },
  errorMessage: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
  },
  skeletonContainer: {
    padding: p(12),
    gap: p(16),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    gap: p(10),
  },
  imageActions: {
    position: 'absolute',
    bottom: p(5),
    left: p(5),
    flexDirection: 'row',
    gap: p(4),
  },
  imageActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: p(12),
    width: p(24),
    height: p(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: p(5),
    right: p(5),
    left: p(5),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: p(4),
    padding: p(4),
  },
  captionText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(20),
  },
  captionModalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(20),
    padding: p(25),
    alignItems: 'center',
    width: '100%',
    maxWidth: p(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  captionModalHeader: {
    alignItems: 'center',
    marginBottom: p(15),
  },
  captionModalTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginTop: p(10),
  },
  captionModalMessage: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: p(20),
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#fff',
    width: '100%',
    height: p(80),
    textAlignVertical: 'top',
    marginBottom: p(25),
  },
  captionModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: p(15),
    width: '100%',
  },
  captionCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(25),
    minWidth: p(100),
    alignItems: 'center',
    flex: 1,
    maxWidth: p(120),
  },
  captionSaveButton: {
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(20),
    borderRadius: p(25),
    minWidth: p(100),
    alignItems: 'center',
    flex: 1,
    maxWidth: p(120),
  },
  captionCancelButtonText: {
    color: '#666',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
  captionSaveButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default EditFarmScreen;
