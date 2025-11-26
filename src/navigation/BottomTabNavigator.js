import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, loadGuestCart } from '../redux/slices/cartSlice';
import { fetchWishlist, loadGuestWishlist } from '../redux/slices/wishlistSlice';
import ProfileScreen from '../screens/customer/Profile/ProfileScreen';
import DashboardScreen from '../screens/customer/Dashboard/DashboardScreen';
import CartScreen from '../screens/customer/Cart/CartScreen';
import BucketScreen from '../screens/customer/Bucket/BucketScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { p } from '../utils/Responsive';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// Custom Cart Icon with Badge
const CartIconWithBadge = ({ focused, color, size }) => {
  const cartItems = useSelector(state => state.cart.cartItems);
  // Count the number of items in cart, not the total quantity
  const displayCount = cartItems.length;

  return (
    <View style={styles.iconContainer}>
      <Icon 
        name={focused ? 'cart' : 'cart-outline'} 
        size={size} 
        color={color} 
      />
      {displayCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {displayCount > 99 ? '99+' : displayCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const BottomTabNavigator = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useSelector(state => state.auth);

  // Fetch cart and wishlist data when the tab navigator loads
  useEffect(() => {
    if (isLoggedIn) {
      // If logged in, fetch from server
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      // If not logged in, load from AsyncStorage (guest mode)
      dispatch(loadGuestCart());
      dispatch(loadGuestWishlist());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'CartTab') {
            return <CartIconWithBadge focused={focused} color={color} size={size} />;
          }
          
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BucketTab') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#019a34',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingVertical: 4,
          paddingHorizontal: 20,
          // height: 75,
           height: 55 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
          fontFamily: 'Poppins-SemiBold',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="BucketTab" 
        component={BucketScreen}
        options={{
          tabBarLabel: 'Bucket',
        }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc3545',
    borderRadius: p(7),
    minWidth: p(14),
    height: p(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    zIndex: 1000,
  },
  badgeText: {
    color: '#fff',
    fontSize: p(8),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    lineHeight: p(9),
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;
