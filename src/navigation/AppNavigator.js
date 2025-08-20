import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileEditScreen from '../screens/Profile/ProfileEditScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import MyOrdersScreen from '../screens/Profile/MyOrdersScreen';
import ProductDetailScreen from '../screens/ProductDetail/ProductDetailScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import CategoryProductsScreen from '../screens/Category/CategoryProductsScreen';
import OrderDetailsScreen from '../screens/Profile/OrderDetailsScreen';
import { Easing } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Reusable transition functions
  const slideFromRight = ({ current, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  });

  const splashTransition = ({ current }) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0],
          }),
        },
      ],
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1],
      }),
    },
  });

  // Screen configurations
  const screens = [
    { name: 'Splash', component: SplashScreen, transition: splashTransition },
    { name: 'Login', component: LoginScreen, transition: slideFromRight },
    { name: 'Register', component: RegisterScreen, transition: slideFromRight },
    { name: 'App', component: BottomTabNavigator, transition: slideFromRight },
    {
      name: 'Dashboard',
      component: DashboardScreen,
      transition: slideFromRight,
    },
    { name: 'ProfileEdit', component: ProfileEditScreen, transition: slideFromRight },
    { name: 'ChangePassword', component: ChangePasswordScreen, transition: slideFromRight },
    { name: 'MyOrders', component: MyOrdersScreen, transition: slideFromRight },
    { name: 'ProductDetail', component: ProductDetailScreen, transition: slideFromRight },
    { name: 'Checkout', component: CheckoutScreen, transition: slideFromRight },
    { name: 'Notification', component: NotificationScreen, transition: slideFromRight },
    { name: 'CategoryProducts', component: CategoryProductsScreen, transition: slideFromRight },
    { name: 'OrderDetails', component: OrderDetailsScreen, transition: slideFromRight },
  ];

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#019a34' },
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 400,
                easing: Easing.out(Easing.cubic),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 400,
                easing: Easing.in(Easing.cubic),
              },
            },
          },
        }}
      >
        {screens.map(({ name, component, transition }) => (
          <Stack.Screen
            key={name}
            name={name}
            component={component}
            options={{
              cardStyleInterpolator: transition,
            }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
