import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from '../../redux/slices/authSlice';


const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Get authentication state
  const { isLoggedIn, user } = useSelector(state => state.auth);
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

  // Animation initialization - runs once on mount
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      // Main container fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      // Logo scale and fade
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          delay: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]),
      // Text fade in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    // Loading dots animation
    const animateDots = () => {
      const dotAnimationsSequence = dotAnimations.map((dot, index) => {
        return Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]);
      });

      Animated.loop(Animated.parallel(dotAnimationsSequence)).start();
    };
    animateDots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Navigation logic - waits for auth check to complete
  useEffect(() => {
    if (!authChecked) return;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        // Navigate based on authentication status
        if (isLoggedIn && user) {
          // Check user role and navigate accordingly
          if (user.role_id === 2) {
            // Farmer role
            navigation.replace('FarmerApp');
          } else if (user.role_id === 4) {
            // Delivery agent role
            navigation.replace('DeliveryApp');
          } else {
            // Customer or other roles (role_id === 3)
            navigation.replace('App');
          }
        } else {
          navigation.replace('Login'); // User is not logged in, go to login
        }
      });
    }, 3000); // 2.5 seconds

    return () => clearTimeout(timer);
  }, [isLoggedIn, user, authChecked, navigation, fadeAnim, logoOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Logo container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Image
            source={require('../../assets/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name and tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.appName}>Vegetable Market</Text>
          <Text style={styles.tagline}>Fresh Produce, Delivered Fresh</Text>
        </Animated.View>

        {/* Loading indicator with animated dots */}
        <Animated.View style={[styles.loadingContainer, { opacity: textFadeAnim }]}>
          <View style={styles.dotsContainer}>
            {dotAnimations.map((dotAnim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.loadingDot,
                  {
                    opacity: dotAnim,
                    transform: [
                      {
                        scale: dotAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#019a34',
  },
  // Content container
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  // Logo container
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  logo: {
    width: 300,
    height: 100,
    tintColor: '#ffffff',
  },
  // Text container
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
    zIndex: 10,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Loading container
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginHorizontal: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default SplashScreen;
