import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveGuestCart, saveGuestWishlist } from '../utils/guestStorage';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import addressesReducer from './slices/addressesSlice';
import wishlistReducer from './slices/wishlistSlice';
import filterReducer from './slices/filterSlice';
import vegetablesReducer from './slices/vegetablesSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import farmsReducer from './slices/farmsSlice';
import farmerVegetablesReducer from './slices/farmerVegetablesSlice';
import farmerOrdersReducer from './slices/farmerOrdersSlice';
import salesReportReducer from './slices/salesReportSlice';
import supportTicketReducer from './slices/supportTicketSlice';
import advertisementReducer from './slices/advertisementSlice';
import deliveryDashboardReducer from './slices/deliveryDashboardSlice';
import deliveryReducer from './slices/deliverySlice';
import todaysTaskReducer from './slices/todaysTaskSlice';
import deliveryHistoryReducer from './slices/deliveryHistorySlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';
import otpReducer from './slices/otpSlice';

// Create root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  addresses: addressesReducer,
  wishlist: wishlistReducer,
  filter: filterReducer,
  vegetables: vegetablesReducer,
  cart: cartReducer,
  orders: ordersReducer,
  farms: farmsReducer,
  farmerVegetables: farmerVegetablesReducer,
  farmerOrders: farmerOrdersReducer,
  salesReport: salesReportReducer,
  supportTicket: supportTicketReducer,
  advertisement: advertisementReducer,
  deliveryDashboard: deliveryDashboardReducer,
  delivery: deliveryReducer,
  todaysTask: todaysTaskReducer,
  deliveryHistory: deliveryHistoryReducer,
  wallet: walletReducer,
  notification: notificationReducer,
  otp: otpReducer,
});

// Middleware to save guest cart and wishlist to AsyncStorage
const guestStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Only process cart and wishlist actions
  if (action.type?.startsWith('cart/') || action.type?.startsWith('wishlist/')) {
    const state = store.getState();
    const isLoggedIn = state.auth?.isLoggedIn || false;
    
    // Save to AsyncStorage only when not logged in (guest mode)
    if (!isLoggedIn) {
      if (action.type?.startsWith('cart/')) {
        const cartItems = state.cart?.cartItems || [];
        // Save guest cart after cart-related actions
        if (action.type.includes('addItemToCart') || 
            action.type.includes('removeItemFromCart') || 
            action.type.includes('updateItemQuantity') ||
            action.type.includes('addToCart') ||
            action.type.includes('removeFromCart') ||
            action.type.includes('updateCartQuantity')) {
          saveGuestCart(cartItems).catch(err => {
            console.error('Failed to save guest cart:', err);
          });
        }
      }
      
      if (action.type?.startsWith('wishlist/')) {
        const wishlistItems = state.wishlist?.items || [];
        // Save guest wishlist after wishlist-related actions
        if (action.type.includes('toggleWishlistItem') || 
            action.type.includes('removeWishlistItem') ||
            action.type.includes('addWishlistItemLocally') ||
            action.type.includes('removeWishlistItemLocally')) {
          saveGuestWishlist(wishlistItems).catch(err => {
            console.error('Failed to save guest wishlist:', err);
          });
        }
      }
    }
  }
  
  return result;
};

// Configure store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(guestStorageMiddleware),
});

// Create persistor
// const persistor = persistStore(store);

// export { store, persistor };
export { store };
export default store;
