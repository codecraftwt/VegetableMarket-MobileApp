import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import { SuccessModal, ErrorModal } from '../../../components';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';

const HelpCenterScreen = ({ navigation }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNotificationPress = () => {
    console.log('Help Center notification pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallSupport = () => {
    const phoneNumber = '+919623448771';
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone dialer not available on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Failed to open phone dialer');
      });
  };

  const handleEmailSupport = () => {
    const email = 'vegetablemarket@gmail.com'; // Updated support email
    const subject = 'Support Request - Vegetable Market App';
    const body = 'Hi,\n\nI need help with:\n\n';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email client not available on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening email client:', err);
        Alert.alert('Error', 'Failed to open email client');
      });
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = '+91 9623448771'; // Updated WhatsApp number
    const message = 'Hi, I need help with the Vegetable Market app.';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          // Fallback to web WhatsApp
          const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webWhatsappUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Error', 'Failed to open WhatsApp');
      });
  };

  const handleGenerateTicket = () => {
    navigation.navigate('GenerateTicket');
  };

  const handleViewTickets = () => {
    navigation.navigate('ViewTickets');
  };

  const ContactMethod = ({ icon, title, subtitle, onPress, color = '#019a34' }) => (
    <TouchableOpacity style={styles.contactMethod} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  const HelpSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const HelpItem = ({ icon, title, subtitle, onPress, color = '#019a34' }) => (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <View style={[styles.helpIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Help Center"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Icon name="life-ring" size={40} color="#019a34" />
          </View>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            We're here to assist you with any questions or issues you might have.
          </Text>
        </View>

        {/* Contact Methods */}
        <HelpSection title="Contact Support">
          <ContactMethod
            icon="phone"
            title="Call Support"
            subtitle="+91 9623448771 (9 AM - 9 PM)"
            onPress={handleCallSupport}
            color="#019a34"
          />
          <ContactMethod
            icon="envelope"
            title="Email Support"
            subtitle="info@kisancart.in"
            onPress={handleEmailSupport}
            color="#2196F3"
          />
          <ContactMethod
            icon="comment"
            title="WhatsApp Support"
            subtitle="Chat with us on WhatsApp"
            onPress={handleWhatsAppSupport}
            color="#25D366"
          />
        </HelpSection>

        {/* Help & Support */}
        <HelpSection title="Help & Support">
          <HelpItem
            icon="plus-circle"
            title="Generate New Ticket"
            subtitle="Create a new support ticket"
            onPress={handleGenerateTicket}
            color="#019a34"
          />
          <HelpItem
            icon="list-alt"
            title="View All Tickets"
            subtitle="Check status of your tickets"
            onPress={handleViewTickets}
            color="#2196F3"
          />
        </HelpSection>

        {/* App Information */}
        <HelpSection title="App Information">
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>December 2024</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>Walstar Media</Text>
          </View>
        </HelpSection>

        {/* Business Hours */}
        <HelpSection title="Business Hours">
          <View style={styles.businessHours}>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 9:00 PM</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 7:00 PM</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
            </View>
          </View>
        </HelpSection>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Coming Soon!"
        message={successMessage}
        buttonText="OK"
        onButtonPress={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={() => setShowErrorModal(false)}
      />
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
    paddingHorizontal: p(16),
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: p(24),
    backgroundColor: '#fff',
    borderRadius: p(12),
    marginVertical: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeIcon: {
    width: p(80),
    height: p(80),
    borderRadius: p(40),
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(16),
  },
  welcomeTitle: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: p(20),
    paddingHorizontal: p(16),
  },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(16),
    fontFamily: 'Poppins-Bold',
  },

  // Contact Methods
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIcon: {
    width: p(48),
    height: p(48),
    borderRadius: p(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(2),
    fontFamily: 'Poppins-SemiBold',
  },
  contactSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Help Items
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  helpIcon: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: p(12),
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    marginBottom: p(2),
    fontFamily: 'Poppins-SemiBold',
  },
  helpSubtitle: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Info Items
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },

  // Business Hours
  businessHours: {
    paddingVertical: p(8),
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: p(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hoursDay: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
  },
  hoursTime: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Regular',
  },
});

export default HelpCenterScreen;
