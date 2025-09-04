import React from 'react';
import { Platform, StatusBar, View, SafeAreaView } from 'react-native';

const StatusBarSpacer = ({ backgroundColor = '#019a34' }) => {
  if (Platform.OS === 'ios') {
    return <SafeAreaView style={{ flex: 0, backgroundColor }} />;
  }
  return <View style={{ height: StatusBar.currentHeight ?? 0, backgroundColor }} />;
};

export default StatusBarSpacer;


