// /navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from './StackNavigator';
import { View, Text } from 'react-native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = () => {
  return (
    <View>
      <Text>Custom Drawer</Text>
      {/* Add custom drawer items */}
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={CustomDrawerContent}>
      <Drawer.Screen name="Home" component={StackNavigator} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
