import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/Feather';
import SkeletonLoader from './SkeletonLoader';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';

// Constants
const IMAGE_BASE_URL = 'https://kisancart.in/storage/';
const DEFAULT_IMAGE = require('../assets/vegebg.png');
const MODAL_TITLES = {
  WISHLIST_UPDATED: 'Wishlist Updated!',
  ADDED_TO_CART: 'Added to Cart!',
  ADD_TO_CART_FAILED: 'Add to Cart Failed',
};
const ALERT_TITLES = {
  PRODUCT_UNAVAILABLE: 'Out of Stock',
  ADD_TO_CART_FAILED: 'Add to Cart Failed',
};
const CARD_SIZES = {
  small: { width: 120, height: 180, imageHeight: 80 },
  medium: { width: 162, height: 214, imageHeight: 120 },
  large: { width: 200, height: 280, imageHeight: 160 },
};

const ProductCard = ({
  item,
  onPress,
  onAddToCart,
  showAddToCart = true,
  showWishlist = true,
  showDeleteButton = false,
  onDelete,
  isDeleteLoading = false,
  size = 'medium',
  navigation,
  isHighlighted = false,
}) => {
  const dispatch = useDispatch();
  const { items: wishlistItems, itemStatus } = useSelector(state => state.wishlist);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Memoized helper functions
  const productImage = useMemo(() => {
    if (item?.images?.length > 0) {
      return { uri: `${IMAGE_BASE_URL}${item.images[0].image_path}` };
    }
    return DEFAULT_IMAGE;
  }, [item?.images]);

  const priceDisplay = useMemo(() => {
    if (item?.price_per_kg) {
      return `₹${parseFloat(item.price_per_kg).toFixed(2)}`;
    }
    return item?.price || '₹0.00';
  }, [item?.price_per_kg, item?.price]);

  const productUnit = useMemo(() => {
    return item?.unit_type || item?.unit || 'kg';
  }, [item?.unit_type, item?.unit]);

  const isOutOfStock = useMemo(() => {
    const quantityAvailable = item?.quantity_available;
    return (
      quantityAvailable === 0 ||
      quantityAvailable === null ||
      quantityAvailable === undefined ||
      String(quantityAvailable) === '0'
    );
  }, [item?.quantity_available]);

  // Check if item is in wishlist
  const isInWishlist = useMemo(() => {
    if (itemStatus?.hasOwnProperty(item?.id)) {
      return itemStatus[item.id];
    }
    return wishlistItems.some(wishlistItem => wishlistItem.id === item?.id);
  }, [item?.id, itemStatus, wishlistItems]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(async (e) => {
    e.stopPropagation();
    try {
      setIsTogglingWishlist(true);
      const result = await dispatch(toggleWishlistItem({
        vegetableId: item.id,
        vegetable: item
      })).unwrap();

      setSuccessTitle(MODAL_TITLES.WISHLIST_UPDATED);
      setSuccessMessage(
        result.wishlisted
          ? `${item.name} added to wishlist!`
          : `${item.name} removed from wishlist!`
      );
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error));
      setShowErrorModal(true);
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [dispatch, item, extractErrorMessage]);

  // Helper function to extract error message from various error structures
  const extractErrorMessage = useCallback((error) => {
    if (!error) {
      return 'Failed to add item to cart. Please try again.';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object') {
      if (error?.message && typeof error.message === 'string') {
        return error.message;
      }
      if (error?.error && typeof error.error === 'string') {
        return error.error;
      }
      if (error?.data?.message && typeof error.data.message === 'string') {
        return error.data.message;
      }
    }

    return 'This product is temporarily out of stock. Please check back later.';
  }, []);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();

    if (isOutOfStock) {
      Alert.alert(
        ALERT_TITLES.PRODUCT_UNAVAILABLE,
        'This product is currently out of stock. Please check back later.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (onAddToCart) {
      try {
        setIsAddingToCart(true);
        await onAddToCart(item);
      } catch (error) {
        console.error('ProductCard: Add to cart error:', error);
      } finally {
        setIsAddingToCart(false);
      }
    } else {
      try {
        setIsAddingToCart(true);
        await dispatch(
          addToCart({
            vegetable_id: item.id,
            quantity: 1,
          })
        ).unwrap();

        setSuccessTitle(MODAL_TITLES.ADDED_TO_CART);
        setSuccessMessage(`${item.name} added to cart successfully!`);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('ProductCard: Add to cart error:', error);
        Alert.alert(
          ALERT_TITLES.ADD_TO_CART_FAILED,
          extractErrorMessage(error),
          [{ text: 'OK', style: 'default' }]
        );
      } finally {
        setIsAddingToCart(false);
      }
    }
  }, [isOutOfStock, onAddToCart, item, dispatch, extractErrorMessage]);

  // Modal handlers
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleErrorModalClose = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  const handleViewWishlist = useCallback(() => {
    setShowSuccessModal(false);
    navigation?.navigate('Wishlist');
  }, [navigation]);

  const handleViewCart = useCallback(() => {
    setShowSuccessModal(false);
    navigation?.navigate('App', { screen: 'CartTab' });
  }, [navigation]);

  // Memoized card dimensions
  const cardDimensions = useMemo(() => {
    const sizeConfig = CARD_SIZES[size] || CARD_SIZES.medium;
    return {
      width: p(sizeConfig.width),
      height: p(sizeConfig.height),
      imageHeight: p(sizeConfig.imageHeight),
    };
  }, [size]);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.productCard,
          { width: cardDimensions.width, height: cardDimensions.height },
          isHighlighted && styles.highlightedCard
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Product Image */}
        <View style={[styles.imageContainer, { height: cardDimensions.imageHeight }]}>
          <Image
            source={productImage}
            style={styles.productImage}
            defaultSource={DEFAULT_IMAGE}
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
                  name={isInWishlist ? "heart" : "heart-o"}
                  size={16}
                  color={isInWishlist ? "#dc3545" : "#666"}
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
          <Text style={styles.productPrice}>
            {priceDisplay}/{productUnit}
          </Text>

          {isOutOfStock && (
            <Text style={styles.stockText}>Out of stock</Text>
          )}

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
        secondaryButtonText={successTitle === MODAL_TITLES.WISHLIST_UPDATED ? 'View Wishlist' : 'View Cart'}
        onSecondaryButtonPress={successTitle === MODAL_TITLES.WISHLIST_UPDATED ? handleViewWishlist : handleViewCart}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title={MODAL_TITLES.ADD_TO_CART_FAILED}
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
    marginBottom: p(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
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
  stockText: {
    fontSize: fontSizes.xm,
    fontWeight: '600',
    color: 'red',
    marginVertical: p(2)
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
