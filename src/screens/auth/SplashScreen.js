import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../../redux/slices/authSlice';

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Get authentication state
  const { isLoggedIn } = useSelector(state => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        // Handle error silently
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation logic - wait for auth check to complete
    const timer = setTimeout(() => {
      // Only navigate after auth check is complete
      if (authChecked) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          // Navigate based on authentication status
          if (isLoggedIn) {
            navigation.replace('App'); // User is logged in, go to main app
          } else {
            navigation.replace('Login'); // User is not logged in, go to login
          }
        });
      }
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [isLoggedIn, authChecked, navigation, fadeAnim, scaleAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Fixed background image without tint */}
      <ImageBackground
        source={require('../../assets/vegebg1.png')}
        style={styles.bgContainer}
        resizeMode="cover"
        blurRadius={0.8} // Ensure no blur
      >
        {/* Overlay for better contrast */}
        <View style={styles.overlay} />

        <View style={styles.logoContainer}>
          <Animated.Image
            source={require('../../assets/logo.png')}
            style={[
              styles.logo,
              {
                transform: [{ scale: scaleAnim }],
                tintColor: '#ffffff',
              },
            ]}
            resizeMode="contain"
          />
          
          {/* Loading indicator */}
          {/* {!authChecked && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Checking authentication...</Text>
            </View>
          )} */}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#019a34',
  },
  bgContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#019a34', // Semi-transparent green overlay
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 350, // Increased size
    height: 300, // Increased size
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
});

export default SplashScreen;
