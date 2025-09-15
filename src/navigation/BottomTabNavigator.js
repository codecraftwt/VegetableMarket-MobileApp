import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../redux/slices/cartSlice';
import ProfileScreen from '../screens/customer/Profile/ProfileScreen';
import DashboardScreen from '../screens/customer/Dashboard/DashboardScreen';
import CartScreen from '../screens/customer/Cart/CartScreen';
import BucketScreen from '../screens/customer/Bucket/BucketScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { p } from '../utils/Responsive';

const Tab = createBottomTabNavigator();

// Custom Cart Icon with Badge
const CartIconWithBadge = ({ focused, color, size }) => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity_kg || item.quantity || 0), 0);
  
  // Calculate display count - show badge if there are items in cart
  const displayCount = cartCount > 0 ? cartCount : (cartItems.length > 0 ? 1 : 0);

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

  // Fetch cart data when the tab navigator loads
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

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
          paddingVertical: 8,
          paddingHorizontal: 20,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
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
