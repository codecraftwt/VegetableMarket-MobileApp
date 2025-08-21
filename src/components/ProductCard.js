import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/Feather';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const ProductCard = ({
  item,
  onPress,
  onAddToCart,
  showAddToCart = true,
  size = 'medium', // 'small', 'medium', 'large'
  navigation, // Add navigation prop for cart navigation
}) => {
  const dispatch = useDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Individual loading state

  // Helper function to get product image
  const getProductImage = () => {
    if (item?.images && item.images.length > 0) {
      // Use the first image from the API
      return {
        uri: `https://vegetables.walstarmedia.com/storage/${item.images[0].image_path}`,
      };
    }
    // Fallback to local image
    return require('../assets/vegebg.png');
  };

  // Helper function to get product price
  const getPriceDisplay = () => {
    if (item.price_per_kg) {
      return `₹${parseFloat(item.price_per_kg).toFixed(2)}`;
    }
    return item?.price || '₹0.00';
  };

  // Helper function to get product unit
  const getProductUnit = () => {
    return item?.unit_type || item?.unit || 'kg';
  };

  const handleAddToCart = async e => {
    e.stopPropagation();
    if (onAddToCart) {
      // Use the provided onAddToCart function with individual loading
      try {
        setIsAddingToCart(true); // Start individual loading
        await onAddToCart(item);
      } catch (error) {
        // Handle error if onAddToCart throws
        setErrorMessage(
          error.message || 'Failed to add item to cart. Please try again.',
        );
        setShowErrorModal(true);
      } finally {
        setIsAddingToCart(false); // Stop individual loading
      }
    } else {
      // Default add to cart behavior
      try {
        setIsAddingToCart(true); // Start individual loading
        await dispatch(
          addToCart({
            vegetable_id: item.id,
            quantity: 1,
          }),
        ).unwrap();

        // Show success modal
        setSuccessMessage(`${item.name} added to cart successfully!`);
        setShowSuccessModal(true);
      } catch (error) {
        // Show error modal
        setErrorMessage(
          error.message || 'Failed to add item to cart. Please try again.',
        );
        setShowErrorModal(true);
      } finally {
        setIsAddingToCart(false); // Stop individual loading
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleViewCart = () => {
    console.log('ProductCard: handleViewCart called');
    console.log('ProductCard: navigation prop:', navigation);
    setShowSuccessModal(false);
    if (navigation) {
      console.log('ProductCard: Navigating to Cart screen');
      navigation.navigate('Cart');
    } else {
      console.log('ProductCard: No navigation prop available');
    }
  };

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
    <>
      <TouchableOpacity
        style={[styles.productCard, cardStyles]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={getProductImage()}
            style={styles.productImage}
            defaultSource={require('../assets/vegebg.png')}
          />
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item?.name || 'Unknown Product'}
          </Text>
          <StarRating rating={item?.rating || 0} />
          <Text style={styles.productPrice}>
            {getPriceDisplay()}/{getProductUnit()}
          </Text>
        </View>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <Icon1 name="plus" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Added to Cart!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={handleSuccessModalClose}
        showSecondaryButton={true}
        secondaryButtonText="View Cart"
        onSecondaryButtonPress={handleViewCart}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Add to Cart Failed"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
        showRetry={true}
        onRetry={handleAddToCart}
      />
    </>
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
