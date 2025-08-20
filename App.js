import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

// Redux
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/redux/store';
import { StatusBar, StyleSheet, View } from 'react-native';

const LoadingComponent = () => <View style={styles.loadingContainer}></View>;

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <StatusBar backgroundColor="#019a34" barStyle="light-content" />
        <AppNavigator />
      </PersistGate>
    </Provider>
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
});

