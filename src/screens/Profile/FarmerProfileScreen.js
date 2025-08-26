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
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFarmerProfile, clearFarmerProfile } from '../../redux/slices/vegetablesSlice';
import SkeletonLoader from '../../components/SkeletonLoader';

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
      return images.length > 0 ? images : [require('../../assets/vegebg.png')];
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
      if (images[currentImageIndex] === require('../../assets/vegebg.png')) {
        return require('../../assets/vegebg.png');
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
        <StatusBar barStyle="light-content" backgroundColor="#019a34" />
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
                  <Text style={styles.reviewerName}>{review.reviewer_name || 'Anonymous'}</Text>
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
    paddingHorizontal: p(20),
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginTop: p(20),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    marginRight: p(20),
  },
  profileImage: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
  },
  profileImagePlaceholder: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(5),
  },
  farmerEmail: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  farmerPhone: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(10),
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: p(5),
  },
  starContainer: {
    marginRight: p(2),
  },
  ratingText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Section Styles
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(15),
  },

  // Bio Section
  bioSection: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bioText: {
    fontSize: fontSizes.base,
    color: '#666',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
  },

  // Address Section
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: p(15),
    marginTop: p(2),
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(5),
  },
  addressText: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(2),
  },

  // Farms Section
  farmsSection: {
    marginBottom: p(20),
  },
  farmCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    marginBottom: p(15),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftArrow: {
    left: p(10),
  },
  rightArrow: {
    right: p(10),
  },
  imageCounter: {
    position: 'absolute',
    bottom: p(10),
    right: p(10),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    borderRadius: p(12),
  },
  imageCounterText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  farmContent: {
    padding: p(15),
  },
  farmName: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginBottom: p(8),
  },
  farmDescription: {
    fontSize: fontSizes.base,
    color: '#666',
    lineHeight: p(20),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(10),
  },
  farmImageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmImageCountText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: p(5),
  },

  // Reviews Section
  reviewsSection: {
    marginBottom: p(20),
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(10),
  },
  reviewerName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  reviewText: {
    fontSize: fontSizes.base,
    color: '#666',
    lineHeight: p(20),
    fontFamily: 'Poppins-Regular',
    marginBottom: p(8),
  },
  reviewDate: {
    fontSize: fontSizes.sm,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },

  // No Reviews Section
  noReviewsSection: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(30),
    alignItems: 'center',
    marginBottom: p(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noReviewsText: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginTop: p(15),
    marginBottom: p(8),
  },
  noReviewsSubtext: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(50),
  },
  loadingText: {
    marginTop: p(20),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: p(50),
  },
  errorTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginTop: p(20),
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  errorSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
  },

  // Skeleton styles
  skeletonLine: {
    marginBottom: p(6),
  },
  skeletonTitle: {
    marginBottom: p(12),
  },
  skeletonParagraph: {
    marginBottom: p(6),
  },
});

export default FarmerProfileScreen;
