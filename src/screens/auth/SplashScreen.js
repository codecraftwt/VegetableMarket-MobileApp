import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

    // Navigation timeout
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => navigation.navigate('Login'));
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

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
});

export default SplashScreen;
