import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import ProductCard from '../../components/ProductCard';
import CategoryItem from '../../components/CategoryItem';

const BucketScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegetables, setVegetables] = useState([
    {
      id: 1,
      name: 'Kiwi',
      price: '$1.50',
      unit: 'KG',
      rating: 4.5,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 2,
      name: 'Avocado',
      price: '$5.99',
      unit: 'KG',
      rating: 3.5,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 3,
      name: 'Fresh Tomatoes',
      price: '$2.99',
      unit: 'KG',
      rating: 4.0,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 4,
      name: 'Organic Carrots',
      price: '$1.99',
      unit: 'KG',
      rating: 4.2,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 5,
      name: 'Green Bell Peppers',
      price: '$3.49',
      unit: 'KG',
      rating: 4.1,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 6,
      name: 'Fresh Onions',
      price: '$1.49',
      unit: 'KG',
      rating: 3.8,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
  ]);

  const handleNotificationPress = () => {
    console.log('Bucket notification pressed');
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    navigation.navigate('CategoryProducts', { category });
  };

  // Categories data
  const categories = [
    { id: 'all', name: 'All', icon: 'th-large', color: '#019a34' },
    { id: 'veggies', name: 'Veggies', icon: 'carrot', color: '#4CAF50' },
    { id: 'fruits', name: 'Fruits', icon: 'apple', color: '#FF9800' },
    { id: 'meat', name: 'Meat', color: '#F44336' },
    { id: 'dairy', name: 'Dairy', icon: 'glass', color: '#2196F3' },
  ];

  // Sample vegetables data
  const filteredVegetables =
    selectedCategory === 'all'
      ? vegetables
      : vegetables.filter(item => item.category === selectedCategory);

  const CategoriesSection = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => handleCategoryPress(category)}
            size="medium"
          />
        ))}
      </ScrollView>
    </View>
  );

  const VegetablesSection = () => {
    const handleProductPress = (item) => {
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleAddToCart = (item) => {
      console.log('Added to cart:', item.name);
      // Add to cart logic here
    };

    return (
      <View style={styles.vegetablesContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all'
            ? 'All Products'
            : `${categories.find(c => c.id === selectedCategory)?.name} Products`}
        </Text>
        <ScrollView 
          style={styles.productsScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsScrollContent}
        >
          <View style={styles.vegetablesGrid}>
            {filteredVegetables.map(item => (
              <View key={item.id} style={styles.productCardWrapper}>
                <ProductCard
                  item={item}
                  onPress={() => handleProductPress(item)}
                  onAddToCart={handleAddToCart}
                  size="medium"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />

      <CommonHeader
        screenName="Bucket"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        <CategoriesSection />
        <VegetablesSection />
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
    paddingHorizontal: p(20),
  },

  // Categories Styles
  categoriesContainer: {
    marginTop: p(15),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },

  // Vegetables Styles
  vegetablesContainer: {
    marginVertical: p(20),
    paddingBottom: p(220),
  },
  vegetablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%', // Adjust as needed for the grid layout
    marginBottom: p(20),
  },
  productsScrollView: {
    // Add any specific styles for the ScrollView if needed
  },
  productsScrollContent: {
    // Add any specific styles for the ScrollView content if needed
  },
});

export default BucketScreen;
