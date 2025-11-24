import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';
import { handleBackNavigation, getFallbackRoute } from '../utils/navigationUtils';

const CommonHeader = ({
  screenName = 'Screen',
  showBackButton = false,
  showNotification = true,
  showEditButton = false,
  onBackPress,
  onNotificationPress,
  onEditPress,
  backgroundColor = '#019a34',
  navigation,
}) => {
  const handleBackPress = () => {
    
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      const fallbackRoute = getFallbackRoute(screenName);
      handleBackNavigation(navigation, fallbackRoute);
    } else {
      console.log('No navigation or onBackPress handler available');
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>{screenName}</Text>
      </View>

      <View style={styles.rightContainer}>
        {showEditButton ? (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Icon name="edit" size={16} color="#fff" />
          </TouchableOpacity>
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              if (navigation) {
                navigation.navigate('Notification');
              } else if (onNotificationPress) {
                onNotificationPress();
              }
            }}
          >
            <Icon name="bell-o" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: p(16),
    paddingVertical: Platform.OS === 'ios' ? p(5) : p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: p(8),
    width: p(32),
    height: p(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(16),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: p(32),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: '#fff',
    fontSize: fontSizes.lg,
    letterSpacing: 0.3,
    fontFamily: 'Montserrat-Bold',
  },
  rightContainer: {
    width: p(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    padding: p(8),
    width: p(32),
    height: p(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(16),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationButton: {
    padding: p(8),
    width: p(32),
    height: p(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(16),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CommonHeader;

