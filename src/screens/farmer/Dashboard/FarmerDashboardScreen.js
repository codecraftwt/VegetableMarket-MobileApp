import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { SkeletonLoader } from '../../../components';

const FarmerDashboardScreen = ({ navigation }) => {
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      <CommonHeader
        screenName="Farmer Dashboard"
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Farmer Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome to your farmer dashboard
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: p(20),
  },
  title: {
    fontSize: fontSizes.xl,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: p(8),
  },
  subtitle: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
});

export default FarmerDashboardScreen;
