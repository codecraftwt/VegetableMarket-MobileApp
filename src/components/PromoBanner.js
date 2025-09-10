import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const { width: screenWidth } = Dimensions.get('window');

const PromoBanner = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const slideInterval = useRef(null);

  const banners = [
    {
      id: 1,
      header: 'Farm Fresh Vegetables',
      description: 'Delivered straight from our local farms to your doorstep, ensuring the highest quality and freshness.',
      image: require('../assets/banner1.png'),
    },
    {
      id: 2,
      header: 'Sustainable Farming',
      description: 'Supporting local farmers while protecting the environment for future generations.',
      image: require('../assets/banner2.png'),
    },
    {
      id: 3,
      header: 'Organic & Healthy',
      description: 'Grown without harmful chemicals, our produce supports a natural and healthy lifestyle.',
      image: require('../assets/banner3.png'),
    },
  ];

  const slideWidth = screenWidth - p(40);

  useEffect(() => {
    // Start automatic sliding
    startAutoSlide();
    
    // Cleanup on unmount
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const startAutoSlide = () => {
    // Clear any existing interval first
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
    
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % banners.length;
        
        // Scroll to next slide with smoother animation
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextSlide * slideWidth,
            animated: true,
            duration: 800, // Add duration for smoother animation
          });
        }
        
        return nextSlide;
      });
    }, 3000); // 3 seconds
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(contentOffsetX / slideWidth);
    
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const handleScrollBegin = () => {
    // Pause auto-sliding when user starts scrolling
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const handleScrollEnd = () => {
    // Resume auto-sliding after user stops scrolling
    setTimeout(() => {
      startAutoSlide();
    }, 1000); // Wait 1 second before resuming
  };

  const handleDotPress = (index) => {
    setCurrentSlide(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * slideWidth,
        animated: true,
        duration: 600, // Add duration for smoother manual navigation
      });
    }
    
    // Restart auto-sliding after manual navigation
    setTimeout(() => {
      startAutoSlide();
    }, 1000);
  };

  const handleShopNowPress = () => {
    // Navigate to bucket screen
    if (navigation) {
      navigation.navigate('Bucket');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={8} // Reduced from 16 for smoother scrolling
          decelerationRate="normal" // Changed from "fast" to "normal" for smoother deceleration
          snapToInterval={slideWidth}
          snapToAlignment="center" // Changed from "start" to "center" for better centering
          style={styles.scrollView}
          bounces={false} // Disable bouncing for cleaner sliding
          alwaysBounceHorizontal={false} // Ensure no horizontal bounce
        >
          {banners.map((banner, index) => (
            <View key={banner.id} style={[styles.slide, { width: slideWidth }]}>
              <View style={styles.bannerContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.bannerHeader}>{banner.header}</Text>
                  <Text style={styles.bannerDescription}>{banner.description}</Text>
                  <TouchableOpacity 
                    style={styles.shopNowButton}
                    onPress={handleShopNowPress}
                  >
                    <Text style={styles.shopNowText}>Shop Now</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.imageContainer}>
                  <Image
                    source={banner.image}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Carousel Dots */}
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: p(8),
  },
  bannerContainer: {
    height: p(180),
    borderRadius: p(8),
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    height: '100%',
  },
  bannerContent: {
    flex: 1,
    backgroundColor: '#019a34',
    borderRadius: p(8),
    padding: p(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: p(12),
  },
  bannerHeader: {
    color: '#fff',
    fontSize: fontSizes.sm,
    lineHeight: p(18),
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
    numberOfLines: 1,
  },
  bannerDescription: {
    color: '#fff',
    fontSize: fontSizes.xs,
    lineHeight: p(16),
    marginBottom: p(12),
    fontFamily: 'Poppins-Regular',
    opacity: 0.9,
  },
  shopNowButton: {
    backgroundColor: '#fff',
    paddingHorizontal: p(12),
    paddingVertical: p(6),
    borderRadius: p(8),
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#019a34',
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Bold',
  },
  imageContainer: {
    width: p(100),
    height: p(60),
    borderRadius: p(8),
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: p(12),
    gap: p(6),
  },
  dot: {
    width: p(6),
    height: p(6),
    borderRadius: p(3),
    backgroundColor: 'rgba(1, 154, 52, 0.3)',
  },
  activeDot: {
    backgroundColor: '#019a34',
  },
});

export default PromoBanner;
