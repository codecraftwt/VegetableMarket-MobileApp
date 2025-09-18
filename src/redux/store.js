import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
});

// Configure store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
// const persistor = persistStore(store);

// export { store, persistor };
export { store };
export default store;
