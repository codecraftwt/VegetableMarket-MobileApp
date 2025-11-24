import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

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

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
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
      const dotAnimationsSequence = dotAnimations.map((dot, index) =>
        Animated.sequence([
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
        ])
      );

      Animated.loop(Animated.parallel(dotAnimationsSequence)).start();
    };

    animateDots();
  }, []);

  // Navigate to Onboarding after splash
  useEffect(() => {
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
        navigation.replace('Onboarding'); // Always navigate to onboarding
      });
    }, 2000); // Splash duration

    return () => clearTimeout(timer);
  }, [fadeAnim, logoOpacity, navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.contentContainer}>
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
            source={require('../../assets/logo_color.png')}
            style={styles.logo1}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('../../assets/name_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textFadeAnim }]}>
          <Text style={styles.tagline}>Fresh Produce, Delivered Fresh</Text>
        </Animated.View>

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
  container: { flex: 1, backgroundColor: '#019a34' },
  contentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 40, zIndex: 10 },
  logo: { width: 280, height: 90, tintColor: '#ffffff' },
  logo1: { width: 100, height: 100, borderRadius: 50 },
  textContainer: { alignItems: 'center', marginBottom: 50, zIndex: 10, marginTop: -24 },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 20, zIndex: 10 },
  dotsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
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
