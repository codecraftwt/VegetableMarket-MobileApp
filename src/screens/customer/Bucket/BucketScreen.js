import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import SkeletonLoader from '../../../components/SkeletonLoader';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import ProductCard from '../../../components/ProductCard';
import CategoryItem from '../../../components/CategoryItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVegetables, fetchVegetableCategories } from '../../../redux/slices/vegetablesSlice';
import { addToCart, fetchCart, addItemToCart } from '../../../redux/slices/cartSlice';
import { fetchWishlist, loadGuestWishlist } from '../../../redux/slices/wishlistSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import { useFocusEffect } from '@react-navigation/native';

const BucketScreen = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const { vegetables, categories, loading, categoriesLoading } = useSelector(state => state.vegetables);
  const { isLoggedIn } = useSelector(state => state.auth);
  // const { addLoading } = useSelector(state => state.cart);
  const wishlistState = useSelector(state => state.wishlist);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
    dispatch(fetchVegetableCategories());
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle route parameters for search
  useEffect(() => {
    if (route?.params) {
      if (route.params.searchQuery) {
        setTimeout(() => {
          setSearchQuery(route.params.searchQuery);
        }, 50);
      }
      if (route.params.selectedCategory) {
        setTimeout(() => {
          setSelectedCategory(route.params.selectedCategory);
        }, 50);
      }
    }
  }, [route?.params]);

  // Reset selected category to 'all' when screen comes into focus (but preserve search query)
  useFocusEffect(
    React.useCallback(() => {
      // Always clear search state when screen comes into focus
      setSelectedCategory('all');
      setSearchQuery('');
      
      // Refresh wishlist state to ensure UI is up to date
      if (isLoggedIn) {
        dispatch(fetchWishlist());
      } else {
        dispatch(loadGuestWishlist());
      }
    }, [dispatch]) // Remove wishlistState.loading from dependencies to prevent infinite loop
  );

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      setSearchQuery('');
      setSelectedCategory('all');
    };
  }, []);

  const handleNotificationPress = () => {
    console.log('Bucket notification pressed');
  };

  const handleAddToCart = async (item) => {
    try {      
      // Update cart state immediately for badge
      dispatch(addItemToCart({
        vegetable_id: item.id,
        quantity: 1,
        vegetable: item
      }));

      // Show success modal immediately
      setSuccessMessage(`${item.name} added to cart successfully!`);
      setShowSuccessModal(true);

      // Make API call in background
      dispatch(addToCart({ 
        vegetable_id: item.id, 
        quantity: 1 
      })).unwrap().then(() => {
        // Refresh cart data after successful API call
        dispatch(fetchCart());
      }).catch((error) => {
        console.error('BucketScreen: Add to cart API error:', error);
        // Optionally show error modal for API failures
      });
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to add item to cart. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category.id);
    navigation.navigate('CategoryProducts', { category });
  };

  // Filter vegetables by selected category and search query
  const filteredVegetables = vegetables.filter(item => {
    // If there's a search query, show all products that match the search
    if (searchQuery) {
      const matches = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      if (matches) {
        console.log('BucketScreen: Product matches search:', item.name, 'for query:', searchQuery);
      }
      return matches;
    }
    
    // If no search query, filter by category
    const categoryMatch = selectedCategory === 'all' || 
      item.category?.id === selectedCategory || 
      item.category?.name?.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name?.toLowerCase();
    
    return categoryMatch;
  });

  const CategoriesSection = () => {
    if (categoriesLoading) {
      return (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {/* Skeleton loaders for categories */}
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.skeletonCategoryWrapper}>
                <SkeletonLoader type="category" width={p(60)} height={p(60)} />
                <SkeletonLoader type="text" width={p(50)} height={p(12)} style={styles.skeletonText} />
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {/* Add "All" category */}
          <CategoryItem
            category={{ id: 'all', name: 'All' }}
            isSelected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            size="medium"
          />
          {/* Map through API categories */}
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
  };

  const VegetablesSection = () => {
    const handleProductPress = (item) => {
      navigation.navigate('ProductDetail', { product: item });
    };

    if (loading) {
      return (
        <View style={styles.vegetablesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'All Products'
              : `${categories.find(c => c.id === selectedCategory)?.name} Products`}
          </Text>
          <View style={styles.vegetablesGrid}>
            {/* Skeleton loaders for products */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.productCardWrapper}>
                <View style={styles.skeletonCard}>
                  <SkeletonLoader type="card" width="100%" height={p(120)} style={styles.skeletonImage} />
                  <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonTitle} />
                  <SkeletonLoader type="text" width="60%" height={p(12)} style={styles.skeletonRating} />
                  <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonPrice} />
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.vegetablesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery 
              ? `Search Results for "${searchQuery}" (${filteredVegetables.length})`
              : selectedCategory === 'all'
                ? 'All Products'
                : `${categories.find(c => c.id === selectedCategory)?.name} Products`}
          </Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filter')}
          >
            <Icon name="filter" size={20} color="#019a34" />
          </TouchableOpacity>
        </View>
        {filteredVegetables.length > 0 ? (
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
                    showWishlist={true}
                    size="medium"
                    navigation={navigation}
                    isHighlighted={searchQuery && (
                      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="shopping-bag" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'Product Not Available' : 'No Products Found'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? `"${searchQuery}" is not available. Try searching for a different product.`
                : 'No products available in this category at the moment'
              }
            </Text>
          </View>
        )}
      </View>
    );
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    // Navigate to App (BottomTabNavigator) and then to CartTab
    navigation.navigate('App', { screen: 'CartTab' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Bucket"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <View style={styles.content}>
        {!searchQuery && <CategoriesSection />}
        <VegetablesSection />
      </View>

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
    paddingHorizontal: p(16),
  },

  // Categories Styles
  categoriesContainer: {
    marginTop: p(12),
  },
  categoriesScrollContent: {
    paddingLeft: p(5),
    // paddingRight: p(5),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(12),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  filterButton: {
    padding: p(8),
    backgroundColor: '#f0f8f0',
    borderRadius: p(8),
    marginLeft: p(12),
  },
  // Skeleton Loader Styles
  skeletonCategoryWrapper: {
    alignItems: 'center',
    marginRight: p(16),
  },
  skeletonText: {
    marginTop: p(8),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    padding: p(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  skeletonImage: {
    marginBottom: p(12),
  },
  skeletonTitle: {
    marginBottom: p(4),
  },
  skeletonRating: {
    marginBottom: p(6),
  },
  skeletonPrice: {
    marginTop: p(6),
  },

  // Vegetables Styles
  vegetablesContainer: {
    marginVertical: p(16),
    paddingBottom: p(150),
  },
  vegetablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%', // Adjust as needed for the grid layout
    marginBottom: p(16),
  },
  productsScrollView: {
    // Add any specific styles for the ScrollView if needed
  },
  productsScrollContent: {
    // Add any specific styles for the ScrollView content if needed
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(40),
    marginTop: p(16),
  },
  emptyStateTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginTop: p(16),
    fontFamily: 'Poppins-Bold',
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginTop: p(8),
    textAlign: 'center',
    paddingHorizontal: p(16),
    fontFamily: 'Poppins-Regular',
  },
});

export default BucketScreen;
