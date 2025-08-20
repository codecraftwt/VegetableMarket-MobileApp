import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const CategoryItem = ({
  category,
  isSelected = false,
  onPress,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
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
          iconSize: p(60),
          iconFontSize: 24,
          textFontSize: fontSizes.sm,
          marginRight: p(20),
        };
    }
  };

  const sizeStyles = getSizeStyles();

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
            backgroundColor: category.color || '#019a34',
          },
        ]}
      >
        <Icon
          name={category.icon || 'leaf'}
          size={sizeStyles.iconFontSize}
          color="#fff"
        />
      </View>
      <Text
        style={[
          styles.categoryName,
          { fontSize: sizeStyles.textFontSize },
          isSelected && styles.selectedCategoryName,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    paddingVertical: p(10),
  },
  selectedCategory: {
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedCategoryName: {
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
});

export default CategoryItem;
