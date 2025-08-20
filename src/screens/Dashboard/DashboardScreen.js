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
import ProductCard from '../../components/ProductCard';
import CategoryItem from '../../components/CategoryItem';

const DashboardScreen = ({ navigation }) => {
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
            source={require('../../assets/vegebg1.png')}
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
      { id: 'all', name: 'All', icon: 'th-large', color: '#019a34' },
      { id: 'veggies', name: 'Veggies', icon: 'carrot', color: '#4CAF50' },
      { id: 'fruits', name: 'Fruits', icon: 'apple', color: '#FF9800' },
      { id: 'meat', name: 'Meat', icon: 'cutlery', color: '#F44336' },
      { id: 'dairy', name: 'Dairy', icon: 'glass', color: '#2196F3' },
    ];

    const handleCategoryPress = (category) => {
      console.log('Category pressed:', category.name);
      navigation.navigate('CategoryProducts', { category });
    };

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
              size="medium"
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Popular Items Component
  const PopularItems = () => {
    const popularItems = [
      {
        id: 1,
        name: 'Fresh Oranges',
        price: '$4.99',
        unit: 'KG',
        rating: 4.5,
        image: require('../../assets/vegebg.png'),
      },
      {
        id: 2,
        name: 'Ripe Avocados',
        price: '$6.99',
        unit: 'KG',
        rating: 4.2,
        image: require('../../assets/vegebg.png'),
      },
    ];

    const handleProductPress = (item) => {
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleAddToCart = (item) => {
      console.log('Added to cart:', item.name);
      // Add to cart logic here
    };

    return (
      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>Popular</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onPress={() => handleProductPress(item)}
              onAddToCart={handleAddToCart}
              size="medium"
            />
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
        navigation={navigation}
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
    borderRadius: p(20),
    paddingHorizontal: p(20),
    paddingVertical: p(5),
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
    marginBottom: p(0),
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
    marginBottom: p(0),
    marginVertical: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Poppins-SemiBold',
  },
  // Popular Items Styles
  popularContainer: {
    marginVertical: p(20),
    paddingBottom: p(10),
  },
});

export default DashboardScreen;
