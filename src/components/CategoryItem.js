import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/FontAwesome5';


import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import SkeletonLoader from './SkeletonLoader';

const CategoryItem = ({
  category,
  isSelected = false,
  onPress,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  // Helper function to get icon and color based on category name
  const getCategoryConfig = (categoryName) => {
    const name = categoryName?.toLowerCase();
    switch (name) {
      case 'veggies':
      case 'vegetables':
        return { icon: 'leaf', color: '#4CAF50' };
      case 'fruits':
        return { icon: 'apple', color: '#FF9800' };
      case 'meat':
        return { icon: 'cutlery', color: '#F44336' };
      case 'dairy':
        return { icon: 'cheese', color: '#2196F3', useIcon1: true };
      case 'all':
        return { icon: 'th-large', color: '#019a34' };
      default:
        return { icon: 'leaf', color: '#019a34' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: p(40),
          iconFontSize: 18,
          textFontSize: fontSizes.xs,
          marginRight: p(15),
        };
      case 'large':
        return {
          iconSize: p(80),
          iconFontSize: 32,
          textFontSize: fontSizes.base,
          marginRight: p(25),
         
        };
      default: // medium
        return {
          iconSize: p(55),
          iconFontSize: 24,
          textFontSize: fontSizes.sm,
          marginRight: p(25),
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const categoryConfig = getCategoryConfig(category?.name);

  return (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { marginRight: sizeStyles.marginRight },
        isSelected && styles.selectedCategory,
      ]}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.categoryIcon,
          {
            width: sizeStyles.iconSize,
            height: sizeStyles.iconSize,
            borderRadius: sizeStyles.iconSize / 2,
            backgroundColor: categoryConfig.color,
          },
        ]}
      >
        {categoryConfig.useIcon1 ? (
          <Icon1
            name={categoryConfig.icon}
            size={sizeStyles.iconFontSize}
            color="#fff"
          />
        ) : (
          <Icon
            name={categoryConfig.icon}
            size={sizeStyles.iconFontSize}
            color="#fff"
          />
        )}
      </View>
      <Text
        style={[
          styles.categoryName,
          { fontSize: sizeStyles.textFontSize },
          isSelected && styles.selectedCategoryName,
        ]}
      >
        {category?.name || 'Unknown'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    paddingVertical: p(5),
  },
  selectedCategory: {
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryName: {
    color: '#1a1a1a',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedCategoryName: {
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
});

export default CategoryItem;
