import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
} from 'react-native';
import SkeletonLoader from '../../components/SkeletonLoader';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCart, updateCartQuantity, clearCartErrors, removeFromCart } from '../../redux/slices/cartSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    cartItems: reduxCartItems, 
    totalAmount: reduxTotalAmount, 
    loading, 
    error, 
    updateLoading, 
    updateError,
    removeLoading,
    removeError
  } = useSelector(state => state.cart);

  // Local state for immediate updates
  // This prevents unnecessary API calls and provides instant UI feedback
  const [localCartItems, setLocalCartItems] = useState([]);
  const [localTotalAmount, setLocalTotalAmount] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial data is loaded

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Track which items are being updated
  const [removingItems, setRemovingItems] = useState(new Set()); // Track which items are being removed

  // Fetch cart when component mounts and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('CartScreen: Screen focused, fetching cart...');
      dispatch(fetchCart());
      dispatch(clearCartErrors());
      
      // Reset local state to ensure fresh data
      setLocalCartItems([]);
      setLocalTotalAmount(0);
      setUpdatingItems(new Set());
      setRemovingItems(new Set()); // Reset removing items state
      setForceUpdate(0);
      setIsInitialized(false); // Reset initialization flag
    }, [dispatch])
  );
  // Manual refresh function for when we need to sync with server
  const refreshCart = () => {
    console.log('CartScreen: Manually refreshing cart...');
    dispatch(fetchCart());
  };

  // Additional focus effect for immediate cart refresh when returning from other screens
  useFocusEffect(
    React.useCallback(() => {
      // This will run every time the screen comes into focus
      // Useful for refreshing cart after adding items from other screens
      const refreshCartOnFocus = () => {
        console.log('CartScreen: Refreshing cart on focus...');
        refreshCart();
      };
      
      // Small delay to ensure smooth navigation
      const timer = setTimeout(refreshCartOnFocus, 100);
      
      return () => clearTimeout(timer);
    }, [dispatch])
  );

  // Handle cleanup when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Cleanup function when screen loses focus
        console.log('CartScreen: Screen losing focus, cleaning up...');
        dispatch(clearCartErrors());
      };
    }, [dispatch])
  );

  // Update local state when Redux state changes
  useEffect(() => {
    if (reduxCartItems.length > 0 || reduxTotalAmount > 0) {
      console.log('CartScreen: Updating local state from Redux - Items:', reduxCartItems.length, 'Total:', reduxTotalAmount);
      setLocalCartItems([...reduxCartItems]); // Create new array reference
      setLocalTotalAmount(reduxTotalAmount);
      setForceUpdate(prev => prev + 1); // Force re-render
      setIsInitialized(true); // Mark as initialized
    } else if (!loading && reduxCartItems.length === 0 && reduxTotalAmount === 0) {
      // Only mark as initialized if we're not loading and have confirmed empty cart
      console.log('CartScreen: Confirmed empty cart, marking as initialized');
      setIsInitialized(true);
    }
  }, [reduxCartItems, reduxTotalAmount, loading]);

  // Debug: Monitor local cart state changes
  useEffect(() => {
    console.log('CartScreen: Local cart state updated - Items:', localCartItems.length, 'Total:', localTotalAmount);
    localCartItems.forEach(item => {
      console.log(`CartScreen: Item ${item.name} - Quantity: ${item.quantity_kg}, Price: ${item.price_per_kg}`);
    });
  }, [localCartItems, localTotalAmount]);

  const handleNotificationPress = () => {
    console.log('Cart notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleQuantityChange = async (itemId, change) => {
    // Prevent multiple simultaneous updates for the same item
    if (updatingItems.has(itemId)) {
      console.log('CartScreen: Item already being updated, skipping:', itemId);
      return;
    }
    
    const currentItem = localCartItems.find(item => item.id === itemId);
    if (!currentItem) return;

    const newQuantity = Math.max(1, currentItem.quantity_kg + change);
    console.log('CartScreen: Updating quantity for item:', currentItem.name, 'from', currentItem.quantity_kg, 'to', newQuantity);
    
    // Don't allow quantity less than 1
    if (newQuantity < 1) {
      setErrorMessage('Quantity cannot be less than 1');
      setShowErrorModal(true);
      return;
    }
    
    // Don't allow quantity more than 99 (reasonable limit)
    if (newQuantity > 99) {
      setErrorMessage('Quantity cannot be more than 99');
      setShowErrorModal(true);
      return;
    }
    
    // Mark this item as being updated
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    // Store original values for rollback on error
    const originalQuantity = currentItem.quantity_kg;
    const originalTotal = localTotalAmount;
    
    // Update local state immediately for instant feedback (optimistic update)
    const updatedLocalCartItems = localCartItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity_kg: newQuantity }
        : item
    );
    
    // Calculate new total amount
    const newLocalTotalAmount = updatedLocalCartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price_per_kg) * item.quantity_kg), 0
    );
    
    console.log('CartScreen: Updating local state - new quantity:', newQuantity, 'new total:', newLocalTotalAmount);
    
    // Update local state immediately - this will trigger re-render
    setLocalCartItems([...updatedLocalCartItems]); // Create new array reference
    setLocalTotalAmount(newLocalTotalAmount);
    setForceUpdate(prev => prev + 1); // Force re-render
    
    // Add small delay to prevent rapid successive clicks
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      console.log('CartScreen: Making API call to update quantity');
      await dispatch(updateCartQuantity({ id: itemId, quantity: newQuantity })).unwrap();
      console.log('CartScreen: API call successful, quantity updated');
      setSuccessMessage('Quantity updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('CartScreen: Quantity update error:', error);
      // Show specific error message from API
      const errorMsg = error.message || error.error || 'Failed to update quantity. Please try again.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      
      console.log('CartScreen: Rolling back optimistic update due to error');
      // Revert local state on error (rollback optimistic update)
      const revertedLocalCartItems = localCartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity_kg: originalQuantity }
          : item
      );
      
      setLocalCartItems([...revertedLocalCartItems]); // Create new array reference
      setLocalTotalAmount(originalTotal);
      setForceUpdate(prev => prev + 1); // Force re-render
    } finally {
      // Remove this item from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = (item) => {
    console.log('CartScreen: handleRemoveItem called for item:', item);
    setItemToRemove(item);
    setShowConfirmationModal(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    console.log('CartScreen: confirmRemoveItem called for item:', itemToRemove);
    
    // Mark this item as being removed
    setRemovingItems(prev => new Set(prev).add(itemToRemove.id));
    
    try {
      await dispatch(removeFromCart(itemToRemove.id)).unwrap();
      console.log('CartScreen: Item removed successfully');
      setSuccessMessage(`${itemToRemove.name} removed from cart successfully!`);
      setShowSuccessModal(true);
      
      // Update local state immediately after successful removal
      // No need to refresh entire cart - just remove the item locally
      const updatedLocalCartItems = localCartItems.filter(item => item.id !== itemToRemove.id);
      const newLocalTotalAmount = updatedLocalCartItems.reduce((sum, item) => 
        sum + (parseFloat(item.price_per_kg) * item.quantity_kg), 0
      );
      
      setLocalCartItems([...updatedLocalCartItems]); // Create new array reference
      setLocalTotalAmount(newLocalTotalAmount);
      setForceUpdate(prev => prev + 1); // Force re-render
      
      // Clear the item to remove
      setItemToRemove(null);
      setShowConfirmationModal(false);
    } catch (error) {
      console.error('CartScreen: Remove from cart error:', error);
      setErrorMessage(error.message || 'Failed to remove item from cart. Please try again.');
      setShowErrorModal(true);
      
      // Clear the item to remove on error
      setItemToRemove(null);
      setShowConfirmationModal(false);
    } finally {
      // Remove this item from removing set
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemToRemove.id);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (localCartItems.length === 0) {
      setErrorMessage('Please add items to your cart before checkout.');
      setShowErrorModal(true);
      return;
    }
    console.log('Proceeding to checkout');
    navigation.navigate('Checkout', { totalPrice: localTotalAmount });
  };

  // Cart Item Component
  const CartItem = ({ item }) => {
    // Helper function to get product image
    const getProductImage = () => {
      // Check if item has veg_images and if it's a valid URL
      if (item.veg_images && item.veg_images.length > 0 && item.veg_images[0]) {
        // If it's a URL string, return the URI object
        if (typeof item.veg_images[0] === 'string' && item.veg_images[0].startsWith('http')) {
          return { uri: item.veg_images[0] };
        }
      }
      // Fallback to local image if no valid image URL
      return require('../../assets/vegebg.png');
    };

    const isItemUpdating = updatingItems.has(item.id);
    const isItemRemoving = removingItems.has(item.id);

    return (
      <View style={styles.cartItemCard}>
        <View style={styles.itemLeft}>
          <Image 
            source={getProductImage()} 
            style={styles.itemImage}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.unit_type}</Text>
            <Text style={styles.itemPrice}>₹{parseFloat(item.price_per_kg).toFixed(2)}/{item.unit_type}</Text>
          </View>
        </View>
        
        <View style={styles.itemRight}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={[styles.quantityButton, isItemUpdating && styles.disabledButton]} 
              onPress={() => handleQuantityChange(item.id, -1)}
              disabled={isItemUpdating || item.quantity_kg <= 1}
            >
              {isItemUpdating ? (
                <SkeletonLoader type="category" width={14} height={14} borderRadius={7} />
              ) : (
                <Icon name="minus" size={16} color={item.quantity_kg <= 1 ? "#ccc" : "#666"} />
              )}
            </TouchableOpacity>
            <Text style={[
              styles.quantityText, 
              (item.quantity_kg <= 1 || item.quantity_kg >= 99) && styles.quantityTextLimit
            ]}>
              {item.quantity_kg} {item.unit_type}
            </Text>
            <TouchableOpacity 
              style={[styles.quantityButton, isItemUpdating && styles.disabledButton]} 
              onPress={() => handleQuantityChange(item.id, 1)}
              disabled={isItemUpdating || item.quantity_kg >= 99}
            >
              {isItemUpdating ? (
                <SkeletonLoader type="category" width={14} height={14} borderRadius={7} />
              ) : (
                <Icon name="plus" size={16} color={item.quantity_kg >= 99 ? "#ccc" : "#019a34"} />
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
            disabled={isItemRemoving}
          >
            {isItemRemoving ? (
              <SkeletonLoader type="category" width={16} height={16} borderRadius={8} />
            ) : (
              <Icon name="trash" size={16} color="#F44336" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty Cart View
  const EmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Icon name="shopping-cart" size={80} color="#ccc" />
      <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyCartSubtitle}>
        Add some items to your cart to get started
      </Text>
      
      <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('Bucket')}>
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Cart with Items View
  const CartWithItems = () => (
    <>
      {/* Cart Items */}
      <View style={styles.cartItemsSection}>
        <Text style={styles.sectionTitle}>Cart Items</Text>
        {localCartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </View>

      {/* Price Breakdown */}
      <View style={styles.priceBreakdownSection}>
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Sub Total</Text>
          <Text style={styles.priceValue}>₹{localTotalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={styles.priceValue}>₹0.00</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Discount</Text>
          <Text style={styles.priceValue}>₹0.00</Text>
        </View>
        <View style={[styles.priceRow, styles.finalTotalRow]}>
          <Text style={styles.finalTotalLabel}>Final Total</Text>
          <Text style={styles.finalTotalValue}>₹{localTotalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </>
  );

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // No need to refresh cart - local state is already updated
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleConfirmationModalClose = () => {
    setShowConfirmationModal(false);
    setItemToRemove(null);
  };

  // Show loading state while initializing or if still loading
  if (loading || !isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#019a34" />
        <CommonHeader 
          screenName="Cart"
          showBackButton={true}
          onBackPress={handleBackPress}
          showNotification={true}
          onNotificationPress={handleNotificationPress}
          navigation={navigation}
        />
        <View style={styles.content}>
          {/* Skeleton loader for cart items */}
          <View style={styles.cartItemsSection}>
            <Text style={styles.sectionTitle}>Cart Items</Text>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCartItem}>
                <View style={styles.skeletonItemLeft}>
                  <SkeletonLoader type="category" width={p(60)} height={p(60)} borderRadius={p(30)} />
                  <View style={styles.skeletonItemInfo}>
                    <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonItemName} />
                    <SkeletonLoader type="text" width="60%" height={p(12)} style={styles.skeletonItemCategory} />
                    <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonItemPrice} />
                  </View>
                </View>
                <View style={styles.skeletonItemRight}>
                  <View style={styles.skeletonQuantitySelector}>
                    <SkeletonLoader type="category" width={p(35)} height={p(35)} borderRadius={p(17.5)} />
                    <SkeletonLoader type="text" width={p(40)} height={p(12)} style={styles.skeletonQuantityText} />
                    <SkeletonLoader type="category" width={p(35)} height={p(35)} borderRadius={p(17.5)} />
                  </View>
                  <SkeletonLoader type="category" width={p(24)} height={p(24)} borderRadius={p(12)} />
                </View>
              </View>
            ))}
          </View>

          {/* Skeleton loader for price breakdown */}
          <View style={styles.skeletonPriceBreakdown}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonPriceRow}>
                <SkeletonLoader type="text" width="40%" height={p(16)} />
                <SkeletonLoader type="text" width="30%" height={p(16)} />
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Cart"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {localCartItems.length === 0 ? <EmptyCart /> : <CartWithItems />}
      </ScrollView>

      {/* Bottom Checkout Bar */}
      {localCartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>₹{localTotalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Success!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
        showRetry={true}
        onRetry={() => setShowErrorModal(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={handleConfirmationModalClose}
        title="Remove Item"
        message={`Are you sure you want to remove ${itemToRemove?.name} from your cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveItem}
        onCancel={handleConfirmationModalClose}
        confirmButtonStyle="destructive"
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
    paddingHorizontal: p(20),
  },

  // Empty Cart Styles
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyCartTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginTop: p(20),
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  emptyCartSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    marginBottom: p(30),
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  shopNowButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(30),
    paddingVertical: p(15),
    borderRadius: p(25),
  },
  shopNowText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Section Styles
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },

  // Cart Items Section
  cartItemsSection: {
    marginBottom: p(25),
    marginTop: p(10),
  },

  // Cart Item Card
  cartItemCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    marginRight: p(15),
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(3),
  },
  itemCategory: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(3),
  },
  itemPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  itemRight: {
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(25),
    paddingHorizontal: p(5),
    marginBottom: p(10),
  },
  quantityButton: {
    width: p(35),
    height: p(35),
    borderRadius: p(17.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    fontSize: fontSizes.sm,
    color: '#333',
    marginHorizontal: p(12),
    fontFamily: 'Poppins-SemiBold',
  },
  quantityTextLimit: {
    color: '#F44336', // Red color for limits
  },
  removeButton: {
    padding: p(8),
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },

  // Promo Code Section
  promoSection: {
    marginBottom: p(25),
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: p(15),
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: p(15),
    paddingHorizontal: p(20),
    paddingVertical: p(15),
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  applyButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(25),
    paddingVertical: p(15),
    borderRadius: p(15),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Price Breakdown Section
  priceBreakdownSection: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  priceLabel: {
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  priceValue: {
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: p(12),
    marginTop: p(8),
  },
  finalTotalLabel: {
    fontSize: fontSizes.lg,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  finalTotalValue: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(20),
    paddingVertical: p(15),
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(5),
    fontFamily: 'Poppins-Regular',
  },
  totalPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  checkoutButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(30),
    paddingVertical: p(10),
    borderRadius: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },

  // Skeleton Loader Styles
  skeletonCartItem: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonItemInfo: {
    flex: 1,
    marginLeft: p(15),
  },
  skeletonItemName: {
    marginBottom: p(3),
  },
  skeletonItemCategory: {
    marginBottom: p(3),
  },
  skeletonItemPrice: {
    marginTop: p(5),
  },
  skeletonItemRight: {
    alignItems: 'center',
  },
  skeletonQuantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(25),
    paddingHorizontal: p(5),
    marginBottom: p(10),
    gap: p(12),
  },
  skeletonQuantityText: {
    marginHorizontal: p(12),
  },
  skeletonPriceBreakdown: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(20),
    marginBottom: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
});

export default CartScreen;
