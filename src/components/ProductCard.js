import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/Feather';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addItemToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const ProductCard = ({
  item,
  onPress,
  onAddToCart,
  showAddToCart = true,
  showWishlist = true, // Add wishlist prop
  showDeleteButton = false, // Add delete button prop
  onDelete, // Add delete handler prop
  isDeleteLoading = false, // Add delete loading state prop
  size = 'medium', // 'small', 'medium', 'large'
  navigation, // Add navigation prop for cart navigation
  isHighlighted = false, // Add highlighting prop
}) => {
  const dispatch = useDispatch();
  const wishlistState = useSelector(state => state.wishlist);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Individual loading state
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); // Individual wishlist loading state

  // Debug logging for modal state
  console.log('ProductCard: Modal state:', { 
    showSuccessModal, 
    showErrorModal, 
    successTitle, 
    successMessage 
  });

  // Helper function to get product image
  const getProductImage = () => {
    if (item?.images && item.images.length > 0) {
      // Use the first image from the API
      return {
        uri: `https://kisancart.in/storage/${item.images[0].image_path}`,
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

  // Check if item is in wishlist
  const isInWishlist = () => {
    // First check the itemStatus tracking (for real-time updates)
    if (wishlistState.itemStatus && wishlistState.itemStatus.hasOwnProperty(item.id)) {
      console.log('ProductCard: Item status from itemStatus:', item.id, wishlistState.itemStatus[item.id]);
      return wishlistState.itemStatus[item.id];
    }
    // Fallback to checking the items array
    const inItems = wishlistState.items.some(wishlistItem => wishlistItem.id === item.id);
    console.log('ProductCard: Item status from items array:', item.id, inItems);
    return inItems;
  };

  // Get wishlist loading state for this specific item
  const isWishlistLoading = () => {
    return isTogglingWishlist;
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    try {
      console.log('ProductCard: Toggling wishlist for item:', item.name);
      setIsTogglingWishlist(true);
      const result = await dispatch(toggleWishlistItem(item.id)).unwrap();
      
      console.log('ProductCard: Wishlist toggle result:', result);
      if (result.wishlisted) {
        console.log('ProductCard: Item added to wishlist, showing success modal');
        setSuccessTitle('Wishlist Updated!');
        setSuccessMessage(`${item.name} added to wishlist!`);
        setShowSuccessModal(true);
      } else {
        console.log('ProductCard: Item removed from wishlist, showing success modal');
        setSuccessTitle('Wishlist Updated!');
        setSuccessMessage(`${item.name} removed from wishlist!`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.log('ProductCard: Wishlist toggle error:', error.message);
      setErrorMessage(
        error.message || 'Failed to update wishlist. Please try again.'
      );
      setShowErrorModal(true);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async e => {
    e.stopPropagation();
    if (onAddToCart) {
      // Use the provided onAddToCart function with individual loading
      try {
        setIsAddingToCart(true); // Start individual loading
        await onAddToCart(item);
        // The parent component will handle the success modal
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
        setSuccessTitle('Added to Cart!');
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
    console.log('ProductCard: Closing success modal');
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    console.log('ProductCard: Closing error modal');
    setShowErrorModal(false);
  };

  const handleViewWishlist = () => {
    console.log('ProductCard: handleViewWishlist called');
    console.log('ProductCard: navigation prop:', navigation);
    setShowSuccessModal(false);
    if (navigation) {
      console.log('ProductCard: Navigating to Wishlist screen');
      navigation.navigate('Wishlist');
    } else {
      console.log('ProductCard: No navigation prop available');
    }
  };

  const handleViewCart = () => {
    console.log('ProductCard: handleViewCart called');
    console.log('ProductCard: navigation prop:', navigation);
    setShowSuccessModal(false);
    if (navigation) {
      console.log('ProductCard: Navigating to Cart screen');
      navigation.navigate('App', { screen: 'CartTab' });
    } else {
      console.log('ProductCard: No navigation prop available');
    }
  };

  // const StarRating = ({ rating }) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;

  //   // Add full stars
  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <Icon key={`full-${i}`} name="star" size={12} color="#FF9800" />,
  //     );
  //   }

  //   // Add half star if needed
  //   if (hasHalfStar) {
  //     stars.push(
  //       <Icon key={`half`} name="star-half-o" size={12} color="#FF9800" />,
  //     );
  //   }

  //   // Add empty stars to complete 5 stars
  //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(
  //       <Icon key={`empty-${i}`} name="star-o" size={12} color="#FF9800" />,
  //     );
  //   }

  //   return <View style={styles.starRating}>{stars}</View>;
  // };

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
          height: p(210),
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
        style={[
          styles.productCard, 
          cardStyles,
          isHighlighted && styles.highlightedCard
        ]}
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
          
          {/* Wishlist Heart Icon */}
          {showWishlist && (
            <TouchableOpacity
              style={[styles.wishlistButton, isTogglingWishlist && styles.wishlistButtonDisabled]}
              onPress={handleWishlistToggle}
              disabled={isTogglingWishlist}
            >
              {isTogglingWishlist ? (
                <SkeletonLoader type="category" width={16} height={16} borderRadius={8} />
              ) : (
                <Icon 
                  name={isInWishlist() ? "heart" : "heart-o"} 
                  size={16} 
                  color={isInWishlist() ? "#dc3545" : "#666"} 
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productNameContainer}>
            <Text style={styles.productName} numberOfLines={2}>
              {item?.name || 'Unknown Product'}
            </Text>
            {showDeleteButton && (
              <TouchableOpacity
                style={[styles.deleteButton, isDeleteLoading && styles.deleteButtonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(item);
                }}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? (
                  <ActivityIndicator size={14} color="#dc3545" />
                ) : (
                  <Icon name="trash" size={14} color="#dc3545" />
                )}
              </TouchableOpacity>
            )}
          </View>
          {/* <StarRating rating={item?.rating || 0} /> */}
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
              <SkeletonLoader type="category" width={16} height={16} borderRadius={8} />
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
        title={successTitle}
        message={successMessage}
        buttonText="OK"
        onButtonPress={handleSuccessModalClose}
        showSecondaryButton={true}
        secondaryButtonText={successTitle === 'Wishlist Updated!' ? 'View Wishlist' : 'View Cart'}
        onSecondaryButtonPress={successTitle === 'Wishlist Updated!' ? handleViewWishlist : handleViewCart}
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
    borderRadius: p(8),
    padding: p(8),
    marginRight: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
    marginBottom: p(4),
  },
  highlightedCard: {
    borderColor: '#019a34',
    borderWidth: 2,
    shadowColor: '#019a34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#f0fff0',
  },
  imageContainer: {
    width: '100%',
    borderRadius: p(8),
    marginBottom: p(12),
    overflow: 'hidden',
    backgroundColor: '#f0f8f0',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: p(8),
  },
  productInfo: {
    marginBottom: p(8),
  },
  productNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: p(2),
  },
  deleteButton: {
    marginLeft: p(8),
    padding: p(4),
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  productName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    textAlign: 'left',
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  // starRating: {
  //   flexDirection: 'row',
  //   marginBottom: p(4),
  //   gap: p(2),
  // },
  productPrice: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    textAlign: 'left',
    fontFamily: 'Poppins-Bold',
    marginTop: p(4),
  },
  addToCartButton: {
    position: 'absolute',
    bottom: p(0.2),
    right: p(0.2),
    backgroundColor: '#019a34',
    width: p(32),
    height: p(32),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderTopLeftRadius: p(8),
    borderBottomRightRadius: p(8),
  },
  wishlistButton: {
    position: 'absolute',
    top: p(8),
    right: p(8),
    backgroundColor: '#fff',
    borderRadius: p(16),
    width: p(32),
    height: p(32),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  wishlistButtonDisabled: {
    opacity: 0.6,
  },
});

export default ProductCard;
