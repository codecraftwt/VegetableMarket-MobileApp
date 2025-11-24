import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

// Redux
import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
import { store } from './src/redux/store';
import { StatusBar, StyleSheet, View, Text, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong!</Text>
          <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Component to conditionally apply safe area
const ConditionalSafeArea = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  // Only apply bottom safe area on Android devices with system navigation buttons
  const shouldApplySafeArea = Platform.OS === 'android' && insets.bottom > 47; // Try 40px threshold
  
  if (shouldApplySafeArea) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        {children}
      </SafeAreaView>
    );
  }
  
  return children;
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Provider store={store}>
          {/* <PersistGate loading={<LoadingComponent />} persistor={persistor}> */}
            <StatusBar backgroundColor="#019a34" barStyle="light-content" />
            <ConditionalSafeArea>
              <AppNavigator />
            </ConditionalSafeArea>
          {/* </PersistGate> */}
        </Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#019a34',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetails: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

