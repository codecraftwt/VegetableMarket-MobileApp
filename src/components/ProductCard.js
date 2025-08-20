import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/Feather';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const ProductCard = ({
  item,
  onPress,
  onAddToCart,
  showAddToCart = true,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={12} color="#FF9800" />,
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Icon key={`half`} name="star-half-o" size={12} color="#FF9800" />,
      );
    }

    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-o" size={12} color="#FF9800" />,
      );
    }

    return <View style={styles.starRating}>{stars}</View>;
  };

  const getCardStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: p(120),
          height: p(180),
        };
      case 'large':
        return {
          width: p(200),
          height: p(280),
        };
      default: // medium
        return {
          width: p(160),
          height: p(240),
        };
    }
  };

  const getImageHeight = () => {
    switch (size) {
      case 'small':
        return p(80);
      case 'large':
        return p(160);
      default: // medium
        return p(120);
    }
  };

  const cardStyles = getCardStyles();
  const imageHeight = getImageHeight();

  return (
    <TouchableOpacity
      style={[styles.productCard, cardStyles]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image source={item.image} style={styles.productImage} />
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <StarRating rating={item.rating} />
        <Text style={styles.productPrice}>
          {item.price}/{item.unit}
        </Text>
      </View>

      {/* Add to Cart Button */}
      {showAddToCart && (
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={e => {
            e.stopPropagation();
            onAddToCart && onAddToCart(item);
          }}
        >
          <Icon1 name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(10),
    marginRight: p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    marginBottom: p(5),
  },
  imageContainer: {
    width: '100%',
    borderRadius: p(10),
    marginBottom: p(15),
    overflow: 'hidden',
    backgroundColor: '#f0f8f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: p(10),
  },
  productInfo: {
    marginBottom: p(10),
  },
  productName: {
    fontSize: fontSizes.base,
    color: '#333',
    marginBottom: p(3),
    textAlign: 'left',
    fontFamily: 'Poppins-Bold',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: p(5),
    gap: p(2),
  },
  productPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    textAlign: 'left',
    fontFamily: 'Rubik-Bold',
    marginTop: p(5),
  },
  addToCartButton: {
    position: 'absolute',
    bottom: p(0.2),
    right: p(0.2),
    backgroundColor: '#019a34',
    width: p(36),
    height: p(36),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderTopLeftRadius: p(15),
    borderBottomRightRadius: p(15),
  },
});

export default ProductCard;
