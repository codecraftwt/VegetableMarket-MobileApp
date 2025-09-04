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
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SkeletonLoader } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import { addFarm, clearFarmsError, clearFarmsSuccess } from '../../../redux/slices/farmsSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid } from 'react-native';

const AddFarmScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading, error, success, message } = useSelector(state => state.farms);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    if (images.length === 0) {
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

    dispatch(addFarm(submitData));
  };

  const renderImagePicker = () => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.sectionTitle}>Farm Images</Text>
      <Text style={styles.sectionSubtitle}>
        Add up to 5 images of your farm ({images.length}/5)
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

      {images.length > 0 && (
        <View style={styles.selectedImagesContainer}>
          <Text style={styles.selectedImagesTitle}>Selected Images:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((image, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <CommonHeader
        screenName="Add Farm"
        showBackButton={true}
        showNotification={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      {loading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Farm</Text>
            <Text style={styles.headerSubtitle}>
              Create a new farm location to manage your agricultural operations
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
                  <Icon name="plus" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Add Farm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={() => {
          setShowSuccessModal(false);
          dispatch(clearFarmsSuccess());
          // Navigate back to farms list after successful creation
          navigation.goBack();
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
    padding: p(16),
  },
  header: {
    marginBottom: p(24),
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(8),
  },
  headerSubtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: p(22),
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: p(20),
  },
  inputLabel: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(8),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: p(100),
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    marginTop: p(10),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: p(8),
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: p(16),
  },
  imagePickerButtons: {
    flexDirection: 'row',
    gap: p(12),
    marginBottom: p(20),
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
    paddingVertical: p(12),
    gap: p(8),
  },
  imagePickerButtonText: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#019a34',
  },
  selectedImagesContainer: {
    marginTop: p(10),
  },
  selectedImagesTitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: p(12),
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: p(12),
  },
  imagePreview: {
    width: p(80),
    height: p(80),
    borderRadius: p(8),
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: p(-5),
    right: p(-5),
    backgroundColor: '#dc3545',
    borderRadius: p(10),
    width: p(20),
    height: p(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    marginBottom: p(20),
  },
  submitButton: {
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(16),
    borderRadius: p(8),
    gap: p(8),
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-SemiBold',
  },
  skeletonContainer: {
    padding: p(16),
    gap: p(20),
  },
  skeletonSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(20),
    gap: p(12),
  },
});

export default AddFarmScreen;
