import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import CommonHeader from '../../components/CommonHeader';

const DashboardScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search Bar Component
  const SearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Your Groceries"
          placeholderTextColor="#999"
        />
        <Icon name="search" size={20} color="#019a34" />
      </View>
    </View>
  );

  // Promotional Banner Component
  const PromoBanner = () => (
    <View style={styles.promoContainer}>
      <View style={styles.promoContent}>
        <View style={styles.promoTextContainer}>
          <Text style={styles.promoTitle}>
            Get 40% discount on your first order from app
          </Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.promoImageContainer}>
          <Image
            source={require('../../assets/vegebg.png')}
            style={styles.promoImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      {/* Carousel Dots */}
      <View style={styles.carouselDots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );

  // Categories Component
  const Categories = () => {
    const categories = [
      { name: 'Veggies', icon: 'carrot', color: '#4CAF50' },
      { name: 'Fruits', icon: 'apple', color: '#FF9800' },
      { name: 'Meat', icon: 'cutlery', color: '#F44336' },
      { name: 'Dairy', icon: 'glass', color: '#2196F3' },
    ];

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesList}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Icon name={category.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Popular Items Component
  const PopularItems = () => {
    const popularItems = [
      {
        name: 'Fresh Oranges',
        price: '$4.99',
        image: require('../../assets/vegebg.png'),
        isFavorite: true,
      },
      {
        name: 'Ripe Avocados',
        price: '$6.99',
        image: require('../../assets/vegebg.png'),
        isFavorite: true,
      },
    ];

    return (
      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>Popular</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularItems.map((item, index) => (
            <View key={index} style={styles.popularItem}>
              <Image source={item.image} style={styles.itemImage} />
              <TouchableOpacity style={styles.favoriteButton}>
                <Icon 
                  name={item.isFavorite ? "heart" : "heart-o"} 
                  size={16} 
                  color={item.isFavorite ? "#ff4757" : "#999"} 
                />
              </TouchableOpacity>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleNotificationPress = () => {
    // Handle notification press
    console.log('Notification pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Home"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      
      <SearchBar />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PromoBanner />
        <Categories />
        <PopularItems />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  // Search Bar Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: p(20),
    paddingVertical: p(8),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(25),
    paddingHorizontal: p(20),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: '#333',
    marginRight: p(10),
    fontFamily: 'Poppins-Regular',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: p(20),
  },
  // Promo Banner Styles
  promoContainer: {
    backgroundColor: '#019a34',
    borderRadius: p(20),
    padding: p(20),
    marginVertical: p(10),
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTextContainer: {
    flex: 1,
    marginRight: p(15),
  },
  promoTitle: {
    color: '#fff',
    fontSize: fontSizes.lg,
    lineHeight: p(24),
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },
  shopNowButton: {
    backgroundColor: '#fff',
    paddingHorizontal: p(20),
    paddingVertical: p(10),
    borderRadius: p(20),
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#019a34',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  promoImageContainer: {
    width: p(100),
    height: p(60),
    borderRadius: p(15),
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: p(15),
    gap: p(8),
  },
  dot: {
    width: p(8),
    height: p(8),
    borderRadius: p(4),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  // Categories Styles
  categoriesContainer: {
    marginVertical: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Poppins-SemiBold',
  },
  categoriesList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(10),
  },
  categoryName: {
    fontSize: fontSizes.sm,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  // Popular Items Styles
  popularContainer: {
    marginVertical: p(20),
  },
  popularItem: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginRight: p(15),
    width: p(160),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: p(100),
    borderRadius: p(10),
    marginBottom: p(10),
  },
  favoriteButton: {
    position: 'absolute',
    top: p(20),
    right: p(20),
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    alignItems: 'center',
  },
  itemName: {
    fontSize: fontSizes.base,
    color: '#333',
    marginBottom: p(5),
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  itemPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
});

export default DashboardScreen;
