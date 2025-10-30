import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import FarmerProfileScreen from '../screens/farmer/Profile/FarmerProfileScreen';
import FarmerDashboardScreen from '../screens/farmer/Dashboard/FarmerDashboardScreen';
import FarmerBucketScreen from '../screens/farmer/Vegetables/FarmerBucketScreen';
import FarmerOrdersScreen from '../screens/farmer/Orders/FarmerOrdersScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const FarmerBottomTabNavigator = () => {
const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Vegetables') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
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
        name="Dashboard" 
        component={FarmerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Vegetables" 
        component={FarmerBucketScreen}
        options={{
          tabBarLabel: 'Vegetables',
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={FarmerOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={FarmerProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default FarmerBottomTabNavigator;
