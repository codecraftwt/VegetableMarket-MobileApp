import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_CART_KEY = '@guest_cart';
const GUEST_WISHLIST_KEY = '@guest_wishlist';

// Guest Cart Storage Functions
export const saveGuestCart = async (cartItems) => {
  try {
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

export const getGuestCart = async () => {
  try {
    const cartData = await AsyncStorage.getItem(GUEST_CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting guest cart:', error);
    return [];
  }
};

export const clearGuestCart = async () => {
  try {
    await AsyncStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
};

// Guest Wishlist Storage Functions
export const saveGuestWishlist = async (wishlistItems) => {
  try {
    await AsyncStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistItems));
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
  }
};

export const getGuestWishlist = async () => {
  try {
    const wishlistData = await AsyncStorage.getItem(GUEST_WISHLIST_KEY);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error('Error getting guest wishlist:', error);
    return [];
  }
};

export const clearGuestWishlist = async () => {
  try {
    await AsyncStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (error) {
    console.error('Error clearing guest wishlist:', error);
  }
};

// Merge guest cart with user cart items
export const mergeGuestCartWithUserCart = (guestCart, userCart) => {
  const mergedCart = [...userCart];
  
  guestCart.forEach((guestItem) => {
    const existingItem = mergedCart.find(
      item => item.vegetable_id === guestItem.vegetable_id
    );
    
    if (existingItem) {
      // If item exists, update quantity
      existingItem.quantity_kg = (existingItem.quantity_kg || 0) + (guestItem.quantity_kg || 0);
      existingItem.subtotal = parseFloat(existingItem.price_per_kg || 0) * existingItem.quantity_kg;
    } else {
      // If item doesn't exist, add it
      mergedCart.push(guestItem);
    }
  });
  
  return mergedCart;
};

// Merge guest wishlist with user wishlist items
export const mergeGuestWishlistWithUserWishlist = (guestWishlist, userWishlist) => {
  const mergedWishlist = [...userWishlist];
  const userWishlistIds = new Set(userWishlist.map(item => item.id || item.vegetable_id));
  
  guestWishlist.forEach((guestItem) => {
    const itemId = guestItem.id || guestItem.vegetable_id;
    if (!userWishlistIds.has(itemId)) {
      mergedWishlist.push(guestItem);
    }
  });
  
  return mergedWishlist;
};


