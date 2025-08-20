import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import ProductCard from '../../components/ProductCard';

const CategoryProductsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample products data (this would come from Redux/API)
  const allProducts = [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: '$2.99',
      unit: 'KG',
      rating: 4.0,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 2,
      name: 'Organic Carrots',
      price: '$1.99',
      unit: 'KG',
      rating: 4.2,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 3,
      name: 'Green Bell Peppers',
      price: '$3.49',
      unit: 'KG',
      rating: 4.1,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 4,
      name: 'Fresh Onions',
      price: '$1.49',
      unit: 'KG',
      rating: 3.8,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 5,
      name: 'Fresh Oranges',
      price: '$4.99',
      unit: 'KG',
      rating: 4.5,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 6,
      name: 'Ripe Avocados',
      price: '$6.99',
      unit: 'KG',
      rating: 4.2,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 7,
      name: 'Kiwi',
      price: '$1.50',
      unit: 'KG',
      rating: 4.5,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 8,
      name: 'Fresh Apples',
      price: '$3.99',
      unit: 'KG',
      rating: 4.3,
      category: 'fruits',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 9,
      name: 'Organic Spinach',
      price: '$2.49',
      unit: 'KG',
      rating: 4.0,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
    {
      id: 10,
      name: 'Fresh Broccoli',
      price: '$3.99',
      unit: 'KG',
      rating: 4.1,
      category: 'veggies',
      image: require('../../assets/vegebg.png'),
    },
  ];

  // Filter products by category and search query
  const filteredProducts = (() => {
    let products = category.id === 'all' 
      ? allProducts 
      : allProducts.filter(product => product.category === category.id);
    
    if (searchQuery.trim()) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return products;
  })();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleProductPress = (item) => {
    navigation.navigate('ProductDetail', { product: item });
  };

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item.name);
    // Add to cart logic here
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'veggies':
        return 'carrot';
      case 'fruits':
        return 'apple';
      case 'meat':
        return 'cutlery';
      case 'dairy':
        return 'glass';
      default:
        return 'leaf';
    }
  };

  const getCategoryColor = (categoryId) => {
    switch (categoryId) {
      case 'veggies':
        return '#4CAF50';
      case 'fruits':
        return '#FF9800';
      case 'meat':
        return '#F44336';
      case 'dairy':
        return '#2196F3';
      default:
        return '#019a34';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName={category.name}
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        navigation={navigation}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#019a34" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${category.name}...`}
              placeholderTextColor="#999"
              onChangeText={handleSearch}
              value={searchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="times" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() 
              ? `Search Results (${filteredProducts.length})` 
              : (category.id === 'all' ? 'All Products' : `${category.name} Products`)
            }
          </Text>
          
          {filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => (
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
          ) : (
            <View style={styles.emptyState}>
              <Icon name="shopping-bag" size={80} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Products Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                No products available in this category at the moment
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: p(20),
  },

  // Search Bar
  searchContainer: {
    marginTop: p(20),
    marginBottom: p(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: p(15),
    paddingHorizontal: p(20),
    paddingVertical: p(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: p(15),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: p(5),
    marginLeft: p(10),
  },

  // Products Section
  productsSection: {
    marginBottom: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Poppins-SemiBold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: p(20),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(60),
  },
  emptyStateTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    fontFamily: 'Montserrat-Bold',
    marginTop: p(20),
    marginBottom: p(10),
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.base,
    color: '#666',
    textAlign: 'center',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
  },
});

export default CategoryProductsScreen;
