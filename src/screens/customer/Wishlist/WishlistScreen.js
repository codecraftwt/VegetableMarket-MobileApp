import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal, ConfirmationModal } from '../../../components';
import ProductCard from '../../../components/ProductCard';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem } from '../../../redux/slices/wishlistSlice';
import { addToCart, addItemToCart, clearCartErrors } from '../../../redux/slices/cartSlice';
import { useFocusEffect } from '@react-navigation/native';

const WishlistScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const wishlistState = useSelector(state => state.wishlist);
  const cartState = useSelector(state => state.cart);
  const { items, loading, error, removeLoading, removeError } = wishlistState;
  const { addLoading, addError } = cartState;

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  
  // Fetch wishlist only once when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching wishlist');
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Handle remove error
  useEffect(() => {
    if (removeError) {
      setErrorMessage(removeError);
      setShowErrorModal(true);
    }
  }, [removeError]);

  // Handle cart add error
  useEffect(() => {
    if (addError) {
      setErrorMessage(addError);
      setShowErrorModal(true);
      dispatch(clearCartErrors());
    }
  }, [addError, dispatch]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRemoveItem = useCallback((item) => {
    setItemToRemove(item);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmRemove = useCallback(async () => {
    if (!itemToRemove) return;

    try {
      console.log('Starting delete for item:', itemToRemove.id);
      console.log('Items before delete:', items.length);
      
      await dispatch(removeWishlistItem(itemToRemove.id)).unwrap();
      
      console.log('Delete successful, items after delete:', items.length);
      
      setShowConfirmModal(false);
      setItemToRemove(null);
      setSuccessMessage('Item removed from wishlist!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Remove wishlist item error:', error);
      setErrorMessage(error.message || 'Failed to remove item from wishlist');
      setShowErrorModal(true);
    }
  }, [itemToRemove, dispatch, items]);

  const handleCancelRemove = useCallback(() => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  }, []);

  const handleProductPress = useCallback((item) => {
    // Navigate to product detail screen
    // navigation.navigate('ProductDetail', { productId: item.id });
     navigation.navigate('ProductDetail', { product: item });
  }, [navigation]);

  const handleAddToCart = useCallback(async (item) => {
    try {
      // Add item to cart with default quantity of 1
      const cartData = {
        vegetable_id: item.id,
        quantity: 1
      };

      // First add to local state for immediate UI update
      dispatch(addItemToCart({
        vegetable_id: item.id,
        quantity: 1,
        vegetable: item
      }));

      // Then sync with server
      await dispatch(addToCart(cartData)).unwrap();
      
      setSuccessMessage(`${item.name} added to cart!`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Add to cart error:', error);
      setErrorMessage(error.message || 'Failed to add item to cart');
      setShowErrorModal(true);
    }
  }, [dispatch]);

  const handleRemoveFromWishlist = useCallback((item) => {
    handleRemoveItem(item);
  }, [handleRemoveItem]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Icon name="heart" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding items to your wishlist by tapping the heart icon on any product.
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('App', { screen: 'HomeTab' })}
      >
        <Icon name="search" size={16} color="#fff" />
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="My Wishlist"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#019a34" />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="exclamation-triangle" size={50} color="#dc3545" />
          <Text style={styles.errorText}>Failed to load wishlist</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchWishlist())}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        EmptyState
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.productCardContainer}>
                <ProductCard
                  item={item}
                  onPress={() => handleProductPress(item)}
                  onAddToCart={handleAddToCart}
                  showAddToCart={true}
                  showWishlist={true}
                  showDeleteButton={true}
                  onDelete={handleRemoveFromWishlist}
                  isDeleteLoading={removeLoading && itemToRemove?.id === item.id}
                  isAddToCartLoading={addLoading}
                  size="medium"
                  navigation={navigation}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        buttonText="Continue"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />

      {/* Confirm Remove Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={handleCancelRemove}
        title="Remove from Wishlist"
        message={`Are you sure you want to remove "${itemToRemove?.name}" from your wishlist?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        type="warning"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  content: {
    flex: 1,
    paddingHorizontal: p(16),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: p(16),
  },
  
  // Items List
  itemsList: {
    marginTop: p(16),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardContainer: {
    position: 'relative',
    width: '48%',
    marginBottom: p(16),
  },
  removeButton: {
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
    zIndex: 10,
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: p(32),
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptySubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(20),
    marginBottom: p(24),
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#019a34',
    paddingVertical: p(12),
    paddingHorizontal: p(24),
    borderRadius: p(8),
    gap: p(8),
  },
  browseButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
  },
  loadingText: {
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6fbf7',
    padding: p(16),
  },
  errorText: {
    marginTop: p(16),
    fontSize: fontSizes.sm,
    color: '#dc3545',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: p(16),
    backgroundColor: '#019a34',
    paddingVertical: p(8),
    paddingHorizontal: p(24),
    borderRadius: p(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
});

export default WishlistScreen;
