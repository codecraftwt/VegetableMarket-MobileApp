/**
 * Navigation utility functions for consistent back navigation behavior
 */

/**
 * Handles back navigation with fallback options
 * @param {Object} navigation - React Navigation object
 * @param {string} fallbackRoute - Fallback route name (default: 'Home')
 * @param {Function} customHandler - Custom back handler function
 */
export const handleBackNavigation = (navigation, fallbackRoute = 'Home', customHandler = null) => {
    console.log('handleBackNavigation called');
    console.log('Navigation available:', !!navigation);
    console.log('Fallback route:', fallbackRoute);
    console.log('Custom handler available:', !!customHandler);
    
    if (customHandler) {
      console.log('Using custom handler');
      customHandler();
      return;
    }
    
    if (!navigation) {
      console.log('No navigation object available');
      return;
    }
    
    // Check if we can go back in the navigation stack
    if (navigation.canGoBack()) {
      console.log('Can go back, calling navigation.goBack()');
      navigation.goBack();
    } else {
      console.log('Cannot go back, trying fallback navigation');
      // Try to navigate to the fallback route
      try {
        navigation.navigate(fallbackRoute);
      } catch (error) {
        console.log(`Failed to navigate to ${fallbackRoute}, trying Dashboard`);
        try {
          navigation.navigate('Dashboard');
        } catch (dashboardError) {
          console.log('Failed to navigate to Dashboard, trying to reset to Home');
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (resetError) {
            console.log('All navigation attempts failed:', resetError);
          }
        }
      }
    }
  };
  
  /**
   * Gets the appropriate fallback route based on the current screen context
   * @param {string} currentScreen - Current screen name
   * @returns {string} Fallback route name
   */
  export const getFallbackRoute = (currentScreen) => {
    const screenFallbacks = {
      'OrderDetails': 'MyOrders',
      'ProfileEdit': 'Profile',
      'MyOrders': 'Profile',
      'ProductDetail': 'Home',
      'CategoryProducts': 'Home',
      'Checkout': 'Cart',
      'Cart': 'Home',
      'FarmerProfile': 'Home',
      'ChangePassword': 'Profile',
      'Notification': 'Home',
    };
    
    return screenFallbacks[currentScreen] || 'Home';
  };
  
  /**
   * Creates a back press handler for CommonHeader
   * @param {Object} navigation - React Navigation object
   * @param {string} currentScreen - Current screen name
   * @param {Function} customHandler - Custom back handler function
   * @returns {Function} Back press handler function
   */
  export const createBackPressHandler = (navigation, currentScreen, customHandler = null) => {
    return () => {
      const fallbackRoute = getFallbackRoute(currentScreen);
      handleBackNavigation(navigation, fallbackRoute, customHandler);
    };
  };
  