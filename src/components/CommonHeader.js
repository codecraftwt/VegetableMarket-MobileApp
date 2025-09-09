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
    console.log('Back button pressed');
    console.log('onBackPress available:', !!onBackPress);
    console.log('navigation available:', !!navigation);
    console.log('screenName:', screenName);
    
    if (onBackPress) {
      console.log('Using custom onBackPress handler');
      onBackPress();
    } else if (navigation) {
      console.log('Using navigation utility');
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
          <Icon name="chevron-left" size={18} color="#fff" />
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
            <Icon name="edit" size={18} color="#fff" />
          </TouchableOpacity>
        ) : showNotification ? (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              console.log('Notification button pressed, navigation available:', !!navigation);
              if (navigation) {
                console.log('Navigating to Notification screen');
                navigation.navigate('Notification');
              } else if (onNotificationPress) {
                console.log('Calling onNotificationPress fallback');
                onNotificationPress();
              }
            }}
          >
            <Icon name="bell-o" size={18} color="#fff" />
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
    // height: p(105),
    // marginTop: p(-80),

    paddingHorizontal: p(20),
    // paddingTop: p(60),
    // paddingBottom: p(20),
    paddingVertical: Platform.OS === 'ios' ? p(7) : p(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: p(10),
    width: p(38),
    height: p(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(22),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: p(44),
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: '#fff',
    fontSize: fontSizes.xl,
    letterSpacing: 0.5,
    fontFamily: 'Montserrat-Bold',
  },
  rightContainer: {
    width: p(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  //   editButton: {
  //     padding: p(10),
  //     width: p(38),
  //     height: p(38),
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     borderRadius: p(22),
  //     backgroundColor: 'rgba(255, 255, 255, 0.2)',
  //   },
  notificationButton: {
    padding: p(10),
    width: p(38),
    height: p(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: p(22),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CommonHeader;
