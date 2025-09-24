import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Icon from 'react-native-vector-icons/Ionicons';
import DeliveryProfileScreen from '../screens/delivery/Profile/DeliveryProfileScreen';
import DeliveryDashboardScreen from '../screens/delivery/Dashboard/DeliveryDashboardScreen';
import DeliveriesScreen from '../screens/delivery/Deliveries/DeliveriesScreen';
import TodaysTaskScreen from '../screens/delivery/TodaysTask/TodaysTaskScreen';

const Tab = createBottomTabNavigator();

const DeliveryBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'TodaysTask') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
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
          height: 75,
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
        component={DeliveryDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={DeliveriesScreen}
        options={{
          tabBarLabel: 'Deliveries',
        }}
      />
      <Tab.Screen 
        name="TodaysTask" 
        component={TodaysTaskScreen}
        options={{
          tabBarLabel: 'Today\'s Task',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={DeliveryProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default DeliveryBottomTabNavigator;
