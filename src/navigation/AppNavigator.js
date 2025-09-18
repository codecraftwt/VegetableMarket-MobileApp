import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import FarmerBottomTabNavigator from './FarmerBottomTabNavigator';
import DeliveryBottomTabNavigator from './DeliveryBottomTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import DashboardScreen from '../screens/customer/Dashboard/DashboardScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileEditScreen from '../screens/customer/Profile/ProfileEditScreen';
import AllAddressesScreen from '../screens/customer/Profile/AllAddressesScreen';
import WishlistScreen from '../screens/customer/Wishlist/WishlistScreen';
import FilterScreen from '../screens/customer/Filter/FilterScreen';
import ChangePasswordScreen from '../screens/customer/Profile/ChangePasswordScreen';
import MyOrdersScreen from '../screens/customer/Profile/MyOrdersScreen';
import MyRefundsScreen from '../screens/customer/Profile/MyRefundsScreen';
import WithdrawalRequestScreen from '../screens/farmer/WithdrawalRequestScreen';
import WithdrawalFormScreen from '../screens/farmer/WithdrawalFormScreen';
import ProductDetailScreen from '../screens/customer/ProductDetail/ProductDetailScreen';
import CheckoutScreen from '../screens/customer/Checkout/CheckoutScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import CategoryProductsScreen from '../screens/customer/Category/CategoryProductsScreen';
import OrderDetailsScreen from '../screens/customer/Profile/OrderDetailsScreen';
import FarmerProfileScreen from '../screens/customer/Profile/FarmerProfileScreen';
import HelpCenterScreen from '../screens/customer/Profile/HelpCenterScreen';
import GenerateTicketScreen from '../screens/customer/Profile/GenerateTicketScreen';
import ViewTicketsScreen from '../screens/customer/Profile/ViewTicketsScreen';
import TicketDetailsScreen from '../screens/customer/Profile/TicketDetailsScreen';
import MyFarmsScreen from '../screens/farmer/farm/MyFarmsScreen';
import SalesReportScreen from '../screens/farmer/Sales/SalesReportScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import { Easing, StatusBar } from 'react-native';
import StatusBarSpacer from '../components/StatusBarSpacer';
import AddFarmScreen from '../screens/farmer/farm/AddFarmScreen';
import FarmDetailsScreen from '../screens/farmer/farm/FarmDetailsScreen';
import EditFarmScreen from '../screens/farmer/farm/EditFarmScreen';
import VegetableDetailsScreen from '../screens/farmer/Vegetables/VegetableDetailsScreen';
import AddVegetableScreen from '../screens/farmer/Vegetables/AddVegetableScreen';
import EditVegetableScreen from '../screens/farmer/Vegetables/EditVegetableScreen';
import FarmerOrderDetailsScreen from '../screens/farmer/Orders/OrderDetailsScreen';
import DeliveryHistoryScreen from '../screens/delivery/DeliveryHistory/DeliveryHistoryScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetails/DeliveryDetailsScreen';
import AssignedDeliveryDetailsScreen from '../screens/delivery/AssignedDeliveryDetails/AssignedDeliveryDetailsScreen';
import TodaysTaskDetailsScreen from '../screens/delivery/TodaysTaskDetails/TodaysTaskDetailsScreen';
import AdvertisementManagementScreen from '../screens/farmer/Advertisement/AdvertisementManagementScreen';
import CreateAdvertisementScreen from '../screens/farmer/Advertisement/CreateAdvertisementScreen';

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
    { name: 'EmailVerification', component: EmailVerificationScreen, transition: slideFromRight },
    { name: 'App', component: BottomTabNavigator, transition: slideFromRight },
    { name: 'FarmerApp', component: FarmerBottomTabNavigator, transition: slideFromRight },
    { name: 'DeliveryApp', component: DeliveryBottomTabNavigator, transition: slideFromRight },
    {
      name: 'Dashboard',
      component: DashboardScreen,
      transition: slideFromRight,
    },
    { name: 'ProfileEdit', component: ProfileEditScreen, transition: slideFromRight },
    { name: 'AllAddresses', component: AllAddressesScreen, transition: slideFromRight },
    { name: 'Wishlist', component: WishlistScreen, transition: slideFromRight },
    { name: 'Filter', component: FilterScreen, transition: slideFromRight },
    { name: 'ChangePassword', component: ChangePasswordScreen, transition: slideFromRight },
    { name: 'MyOrders', component: MyOrdersScreen, transition: slideFromRight },
    { name: 'MyRefunds', component: MyRefundsScreen, transition: slideFromRight },
        { name: 'WithdrawalRequest', component: WithdrawalRequestScreen, transition: slideFromRight },
        { name: 'WithdrawalForm', component: WithdrawalFormScreen, transition: slideFromRight },
    { name: 'ProductDetail', component: ProductDetailScreen, transition: slideFromRight },
    { name: 'Checkout', component: CheckoutScreen, transition: slideFromRight },
    { name: 'Notification', component: NotificationScreen, transition: slideFromRight },
    { name: 'CategoryProducts', component: CategoryProductsScreen, transition: slideFromRight },
    { name: 'OrderDetails', component: OrderDetailsScreen, transition: slideFromRight },
    { name: 'FarmerProfile', component: FarmerProfileScreen, transition: slideFromRight },
    { name: 'HelpCenter', component: HelpCenterScreen, transition: slideFromRight },
    { name: 'GenerateTicket', component: GenerateTicketScreen, transition: slideFromRight },
    { name: 'ViewTickets', component: ViewTicketsScreen, transition: slideFromRight },
    { name: 'TicketDetails', component: TicketDetailsScreen, transition: slideFromRight },
    { name: 'MyFarms', component: MyFarmsScreen, transition: slideFromRight },
    { name: 'SalesReport', component: SalesReportScreen, transition: slideFromRight },
    { name: 'AddFarm', component: AddFarmScreen, transition: slideFromRight },
    { name: 'FarmDetails', component: FarmDetailsScreen, transition: slideFromRight },
    { name: 'EditFarm', component: EditFarmScreen, transition: slideFromRight },
    { name: 'VegetableDetails', component: VegetableDetailsScreen, transition: slideFromRight },
    { name: 'AddVegetable', component: AddVegetableScreen, transition: slideFromRight },
    { name: 'EditVegetable', component: EditVegetableScreen, transition: slideFromRight },
    { name: 'FarmerOrderDetails', component: FarmerOrderDetailsScreen, transition: slideFromRight },
    { name: 'DeliveryHistory', component: DeliveryHistoryScreen, transition: slideFromRight },
    { name: 'DeliveryDetails', component: DeliveryDetailsScreen, transition: slideFromRight },
    { name: 'AssignedDeliveryDetails', component: AssignedDeliveryDetailsScreen, transition: slideFromRight },
    { name: 'TodaysTaskDetails', component: TodaysTaskDetailsScreen, transition: slideFromRight },
    { name: 'AdvertisementManagement', component: AdvertisementManagementScreen, transition: slideFromRight },
    { name: 'CreateAdvertisement', component: CreateAdvertisementScreen, transition: slideFromRight },
  ];

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      <StatusBarSpacer backgroundColor="#019a34" />
      <Stack.Navigator
        initialRouteName="Splash"
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
