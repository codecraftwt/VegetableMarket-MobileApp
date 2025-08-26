import React, { useState, useEffect } from 'react';
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
import SkeletonLoader from '../../components/SkeletonLoader';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import ProductCard from '../../components/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVegetables } from '../../redux/slices/vegetablesSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const CategoryProductsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const { vegetables, loading } = useSelector(state => state.vegetables);
  const { addLoading } = useSelector(state => state.cart);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vegetables when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
  }, [dispatch]);

  // Filter products by category and search query
  const filteredProducts = (() => {
    let products = vegetables;
    
    // Filter by category if not "all"
    if (category.id !== 'all') {
      products = products.filter(product => 
        product.category?.id === category.id || 
        product.category?.name?.toLowerCase() === category.name?.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      products = products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAddToCart = async (item) => {
    try {
      await dispatch(addToCart({ 
        vegetable_id: item.id, 
        quantity: 1 
      })).unwrap();
      
      // Show success modal
      setSuccessMessage(`${item.name} added to cart successfully!`);
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to add item to cart. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    navigation.navigate('Cart');
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
          
          {loading ? (
            <View style={styles.skeletonContainer}>
              {/* Skeleton loader for products grid */}
              <View style={styles.productsGrid}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <View key={item} style={styles.productCardWrapper}>
                    <View style={styles.skeletonProductCard}>
                      <SkeletonLoader type="card" width="100%" height={p(120)} style={styles.skeletonProductImage} />
                      <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonProductName} />
                      <SkeletonLoader type="text" width="60%" height={p(12)} style={styles.skeletonProductRating} />
                      <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonProductPrice} />
                      <SkeletonLoader type="category" width="100%" height={p(35)} borderRadius={p(17.5)} style={styles.skeletonAddButton} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => (
                <View key={item.id} style={styles.productCardWrapper}>
                  <ProductCard
                    item={item}
                    onPress={() => handleProductPress(item)}
                    onAddToCart={handleAddToCart}
                    size="medium"
                    navigation={navigation}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="shopping-bag" size={80} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Products Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery.trim() 
                  ? 'No products match your search criteria'
                  : 'No products available in this category at the moment'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Added to Cart!"
        message={successMessage}
        buttonText="Ok"
        onButtonPress={handleSuccessModalClose}
        showSecondaryButton={true}
        secondaryButtonText="View Cart"
        onSecondaryButtonPress={handleViewCart}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Add to Cart Failed"
        message={errorMessage}
        buttonText="OK"
        onButtonPress={handleErrorModalClose}
        showRetry={true}
        onRetry={() => setShowErrorModal(false)}
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
  // Skeleton Loader Styles
  skeletonContainer: {
    marginBottom: p(20),
  },
  skeletonProductCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonProductImage: {
    marginBottom: p(15),
  },
  skeletonProductName: {
    marginBottom: p(3),
  },
  skeletonProductRating: {
    marginBottom: p(3),
  },
  skeletonProductPrice: {
    marginBottom: p(10),
  },
  skeletonAddButton: {
    marginTop: p(5),
  },
});

export default CategoryProductsScreen;
