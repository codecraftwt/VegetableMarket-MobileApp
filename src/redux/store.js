import { configureStore, combineReducers } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import vegetablesReducer from './slices/vegetablesSlice';
import cartReducer from './slices/cartSlice';

// Create root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  vegetables: vegetablesReducer,
  cart: cartReducer,
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
