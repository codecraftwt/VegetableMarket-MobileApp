import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFarmerProfile, clearFarmerProfile } from '../../../redux/slices/vegetablesSlice';
import SkeletonLoader from '../../../components/SkeletonLoader';

const FarmerProfileScreen = ({ navigation, route }) => {
  const { farmerId, farmerName } = route.params;
  const dispatch = useDispatch();
  const { farmerProfile, farmerProfileLoading, farmerProfileError } = useSelector(state => state.vegetables);

  useEffect(() => {
    if (farmerId) {
      dispatch(fetchFarmerProfile(farmerId));
    }

    return () => {
      dispatch(clearFarmerProfile());
    };
  }, [dispatch, farmerId]);

  useEffect(() => {
    if (farmerProfileError) {
      Alert.alert('Error', farmerProfileError.message || 'Failed to fetch farmer profile');
    }
  }, [farmerProfileError]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    console.log('Farmer profile notification pressed');
  };

  const handlePhonePress = () => {
    if (farmerProfile.phone) {
      const phoneNumber = `tel:${farmerProfile.phone}`;
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(phoneNumber);
          } else {
            Alert.alert('Error', 'Phone dialer not available on this device');
          }
        })
        .catch((err) => {
          console.error('Error opening phone dialer:', err);
          Alert.alert('Error', 'Failed to open phone dialer');
        });
    }
  };

  const StarRating = ({ stars }) => {
    const getStarIcon = (starType) => {
      switch (starType) {
        case 'full':
          return <Icon name="star" size={16} color="#FF9800" />;
        case 'half':
          return <Icon name="star-half-o" size={16} color="#FF9800" />;
        case 'empty':
        default:
          return <Icon name="star-o" size={16} color="#FF9800" />;
      }
    };

    return (
      <View style={styles.starRating}>
        {stars.map((star, index) => (
          <View key={index} style={styles.starContainer}>
            {getStarIcon(star)}
          </View>
        ))}
      </View>
    );
  };

  const FarmCard = ({ farm }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Get all available images for this farm
    const getAllImages = () => {
      const images = [];
      if (farm.main_image) {
        images.push(farm.main_image);
      }
      if (farm.other_images && farm.other_images.length > 0) {
        images.push(...farm.other_images);
      }
      return images.length > 0 ? images : [require('../../../assets/vegebg.png')];
    };
    
    const images = getAllImages();
    const hasMultipleImages = images.length > 1;
    
    const goToNextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
    
    const goToPreviousImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    
    const getCurrentImage = () => {
      if (images[currentImageIndex] === require('../../../assets/vegebg.png')) {
        return require('../../../assets/vegebg.png');
      }
      return { uri: images[currentImageIndex] };
    };

    return (
      <View style={styles.farmCard}>
        <View style={styles.farmImageContainer}>
          <Image source={getCurrentImage()} style={styles.farmImage} />
          
                     {/* Navigation Arrows */}
           {hasMultipleImages && (
             <>
               <TouchableOpacity 
                 style={[styles.navArrow, styles.leftArrow]} 
                 onPress={goToPreviousImage}
               >
                 <Icon name="chevron-left" size={20} color="rgba(255, 255, 255, 0.7)" />
               </TouchableOpacity>
               
               <TouchableOpacity 
                 style={[styles.navArrow, styles.rightArrow]} 
                 onPress={goToNextImage}
               >
                 <Icon name="chevron-right" size={20} color="rgba(255, 255, 255, 0.7)" />
               </TouchableOpacity>
             </>
           )}
        </View>
        
        <View style={styles.farmContent}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <Text style={styles.farmDescription} numberOfLines={3}>
            {farm.description}
          </Text>
          {/* {hasMultipleImages && (
            <View style={styles.farmImageCount}>
              <Icon name="image" size={14} color="#666" />
              <Text style={styles.farmImageCountText}>
                {images.length} images available
              </Text>
            </View>
          )} */}
        </View>
      </View>
    );
  };

  if (farmerProfileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader 
          screenName="Farmer Profile"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Skeleton Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <SkeletonLoader type="category" width={p(80)} height={p(80)} borderRadius={p(40)} />
            </View>
            <View style={styles.profileInfo}>
              <SkeletonLoader type="text" width="60%" height={p(20)} style={styles.skeletonLine} />
              <SkeletonLoader type="text" width="50%" height={p(16)} style={styles.skeletonLine} />
              <SkeletonLoader type="text" width="40%" height={p(16)} style={styles.skeletonLine} />
              <SkeletonLoader type="text" width="35%" height={p(16)} style={styles.skeletonLine} />
              <View style={styles.ratingContainer}>
                <View style={{ flexDirection: 'row', marginBottom: p(5) }}>
                  {[1,2,3,4,5].map(i => (
                    <SkeletonLoader key={i} type="category" width={p(16)} height={p(16)} borderRadius={p(8)} style={{ marginRight: p(2) }} />
                  ))}
                </View>
                <SkeletonLoader type="text" width="45%" height={p(14)} />
              </View>
            </View>
          </View>

          {/* Skeleton Bio Section */}
          <View style={styles.bioSection}>
            <SkeletonLoader type="text" width="40%" height={p(20)} style={styles.skeletonTitle} />
            <SkeletonLoader type="text" width="100%" height={p(14)} style={styles.skeletonParagraph} />
            <SkeletonLoader type="text" width="95%" height={p(14)} style={styles.skeletonParagraph} />
            <SkeletonLoader type="text" width="85%" height={p(14)} />
          </View>

          {/* Skeleton Address Section */}
          <View style={styles.addressSection}>
            <SkeletonLoader type="text" width="50%" height={p(20)} style={styles.skeletonTitle} />
            <View style={styles.addressInfo}>
              <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} style={{ marginRight: p(15), marginTop: p(2) }} />
              <View style={styles.addressDetails}>
                <SkeletonLoader type="text" width="40%" height={p(16)} style={styles.skeletonLine} />
                <SkeletonLoader type="text" width="80%" height={p(14)} style={styles.skeletonLine} />
                <SkeletonLoader type="text" width="70%" height={p(14)} style={styles.skeletonLine} />
                <SkeletonLoader type="text" width="75%" height={p(14)} />
              </View>
            </View>
          </View>

          {/* Skeleton Farms Section */}
          <View style={styles.farmsSection}>
            <SkeletonLoader type="text" width="30%" height={p(20)} style={styles.skeletonTitle} />
            {[1,2].map(i => (
              <View key={i} style={styles.farmCard}>
                <View style={styles.farmImageContainer}>
                  <SkeletonLoader type="banner" width={'100%'} height={p(150)} />
                </View>
                <View style={styles.farmContent}>
                  <SkeletonLoader type="text" width="60%" height={p(18)} style={styles.skeletonLine} />
                  <SkeletonLoader type="text" width="100%" height={p(14)} style={styles.skeletonParagraph} />
                  <SkeletonLoader type="text" width="90%" height={p(14)} />
                </View>
              </View>
            ))}
          </View>

          {/* Skeleton Reviews Section */}
          <View style={styles.reviewsSection}>
            <SkeletonLoader type="text" width="40%" height={p(20)} style={styles.skeletonTitle} />
            {[1,2,3].map(i => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <SkeletonLoader type="text" width="40%" height={p(16)} />
                  <View style={{ flexDirection: 'row' }}>
                    {[1,2,3,4,5].map(s => (
                      <SkeletonLoader key={s} type="category" width={p(16)} height={p(16)} borderRadius={p(8)} style={{ marginLeft: p(2) }} />
                    ))}
                  </View>
                </View>
                <SkeletonLoader type="text" width="100%" height={p(14)} style={styles.skeletonParagraph} />
                <SkeletonLoader type="text" width="90%" height={p(14)} style={styles.skeletonParagraph} />
                <SkeletonLoader type="text" width="30%" height={p(12)} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!farmerProfileLoading && !farmerProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <CommonHeader 
          screenName="Farmer Profile"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.errorContainer}>
          <Icon name="user-times" size={80} color="#ccc" />
          <Text style={styles.errorTitle}>Farmer Not Found</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load farmer profile. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Farmer Profile"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {farmerProfile.profile_picture ? (
              <Image 
                source={{ uri: farmerProfile.profile_picture }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="user" size={40} color="#ccc" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.farmerName}>{farmerProfile.name}</Text>
            <Text style={styles.farmerEmail}>{farmerProfile.email}</Text>
            <TouchableOpacity onPress={handlePhonePress}>
              <Text style={styles.farmerPhone}>{farmerProfile.phone}</Text>
            </TouchableOpacity>
            
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <StarRating stars={farmerProfile.stars || []} />
              <Text style={styles.ratingText}>
                {farmerProfile.rating || 0} ({farmerProfile.total_reviews || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        {farmerProfile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>About Farmer</Text>
            <Text style={styles.bioText}>{farmerProfile.bio}</Text>
          </View>
        )}

        {/* Address Section */}
        {farmerProfile.address && (
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Farm Location</Text>
            <View style={styles.addressInfo}>
              <Icon name="map-marker" size={16} color="#019a34" style={styles.addressIcon} />
              <View style={styles.addressDetails}>
                <Text style={styles.addressLabel}>{farmerProfile.address.address_label}</Text>
                <Text style={styles.addressText}>
                  {farmerProfile.address.address_line}, {farmerProfile.address.city}
                </Text>
                <Text style={styles.addressText}>
                  {farmerProfile.address.taluka}, {farmerProfile.address.district}
                </Text>
                <Text style={styles.addressText}>
                  {farmerProfile.address.state}, {farmerProfile.address.country} - {farmerProfile.address.pincode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Farms Section */}
        {farmerProfile.farms && farmerProfile.farms.length > 0 && (
          <View style={styles.farmsSection}>
            <Text style={styles.sectionTitle}>Farms</Text>
            {farmerProfile.farms.map((farm, index) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </View>
        )}

        {/* Reviews Section */}
        {farmerProfile.reviews && farmerProfile.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {farmerProfile.reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.customer_name || 'Anonymous'}</Text>
                  <StarRating stars={review.stars || []} />
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{review.created_at}</Text>
              </View>
            ))}
          </View>
        )}

        {/* No Reviews Message */}
        {(!farmerProfile.reviews || farmerProfile.reviews.length === 0) && (
          <View style={styles.noReviewsSection}>
            <Icon name="comment-o" size={40} color="#ccc" />
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSubtext}>
              Be the first to review this farmer's products!
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: p(16),
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginTop: p(16),
    marginBottom: p(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  profileImageContainer: {
    marginRight: p(16),
  },
  profileImage: {
    width: p(64),
    height: p(64),
    borderRadius: p(32),
  },
  profileImagePlaceholder: {
    width: p(64),
    height: p(64),
    borderRadius: p(32),
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  farmerEmail: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(2),
  },
  farmerPhone: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(8),
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: p(4),
  },
  starContainer: {
    marginRight: p(2),
  },
  ratingText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Section Styles
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(12),
  },

  // Bio Section
  bioSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bioText: {
    fontSize: fontSizes.sm,
    color: '#666',
    lineHeight: p(18),
    fontFamily: 'Poppins-Regular',
  },

  // Address Section
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(16),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: p(12),
    marginTop: p(2),
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  addressText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(2),
  },

  // Farms Section
  farmsSection: {
    marginBottom: p(16),
  },
  farmCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    marginBottom: p(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  farmImageContainer: {
    position: 'relative',
  },
  farmImage: {
    width: '100%',
    height: p(150),
    resizeMode: 'cover',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftArrow: {
    left: p(8),
  },
  rightArrow: {
    right: p(8),
  },
  imageCounter: {
    position: 'absolute',
    bottom: p(8),
    right: p(8),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: p(6),
    paddingVertical: p(3),
    borderRadius: p(8),
  },
  imageCounterText: {
    color: '#fff',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  farmContent: {
    padding: p(12),
  },
  farmName: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(6),
  },
  farmDescription: {
    fontSize: fontSizes.sm,
    color: '#666',
    lineHeight: p(16),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(8),
  },
  farmImageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmImageCountText: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(4),
  },

  // Reviews Section
  reviewsSection: {
    marginBottom: p(16),
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(8),
  },
  reviewerName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  reviewText: {
    fontSize: fontSizes.sm,
    color: '#666',
    lineHeight: p(16),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(6),
  },
  reviewDate: {
    fontSize: fontSizes.xs,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },

  // No Reviews Section
  noReviewsSection: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(24),
    alignItems: 'center',
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  noReviewsText: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(12),
    marginBottom: p(6),
  },
  noReviewsSubtext: {
    fontSize: fontSizes.sm,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(40),
  },
  loadingText: {
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(40),
  },
  errorTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginTop: p(16),
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
  },
  errorSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(18),
    fontFamily: 'Poppins-Regular',
  },

  // Skeleton styles
  skeletonLine: {
    marginBottom: p(4),
  },
  skeletonTitle: {
    marginBottom: p(8),
  },
  skeletonParagraph: {
    marginBottom: p(4),
  },
});

export default FarmerProfileScreen;
