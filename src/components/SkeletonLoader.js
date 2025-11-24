import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { p } from '../utils/Responsive';

const SkeletonLoader = ({ 
  type = 'card',
  width, 
  height, 
  style,
  borderRadius = p(8),
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getSkeletonStyle = () => {
    switch (type) {
      case 'card':
        return {
          width: width || p(160),
          height: height || p(240),
          borderRadius: borderRadius,
        };
      case 'category':
        return {
          width: width || p(60),
          height: height || p(60),
          borderRadius: width ? width / 2 : p(30),
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || p(16),
          borderRadius: p(4),
        };
      case 'banner':
        return {
          width: width || '100%',
          height: height || p(120),
          borderRadius: borderRadius,
        };
      case 'cart-item':
        return {
          width: width || p(60),
          height: height || p(60),
          borderRadius: borderRadius,
        };
      case 'profile':
        return {
          width: width || p(100),
          height: height || p(100),
          borderRadius: borderRadius,
        };
      default:
        return {
          width: width || '100%',
          height: height || p(100),
          borderRadius: borderRadius,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getSkeletonStyle(),
        { opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
});

export default SkeletonLoader;
