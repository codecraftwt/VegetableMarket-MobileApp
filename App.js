/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // return (
  //   // <View style={styles.container}>
  //   //   <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
  //   //   <NewAppScreen templateFileName="App.tsx" />
  //   //   <Icon name="home" size={50} color={isDarkMode ? 'white' : 'black'} />
  //   // </View>
    
    
  // );
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
// // App.js
// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator';
// // import AppNavigator from './src/navigation/AppNavigator';

// const App = () => {
//   return <AppNavigator/>;
// };

// export default App;

