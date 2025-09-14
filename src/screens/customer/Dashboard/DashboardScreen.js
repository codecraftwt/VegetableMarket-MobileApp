import React, { useState, useEffect, useCallback, memo } from 'react';
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
import SkeletonLoader from '../../../components/SkeletonLoader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import CommonHeader from '../../../components/CommonHeader';
import ProductCard from '../../../components/ProductCard';
import CategoryItem from '../../../components/CategoryItem';
import PromoBanner from '../../../components/PromoBanner';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVegetables,
  fetchVegetableCategories,
} from '../../../redux/slices/vegetablesSlice';
import { fetchPopularItems } from '../../../redux/slices/wishlistSlice';
import { addToCart } from '../../../redux/slices/cartSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';
import { useFocusEffect } from '@react-navigation/native';

// Memoized Search Bar Component
const SearchBar = memo(({ searchQuery, onSearchChange, onSearch }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Your Groceries"
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={onSearchChange}
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      <TouchableOpacity onPress={onSearch}>
        <Icon name="search" size={20} color="#019a34" />
      </TouchableOpacity>
    </View>
  </View>
));

// Memoized Categories Component
const Categories = memo(
  ({ categories, categoriesLoading, onCategoryPress }) => {
    if (categoriesLoading) {
      return (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4, 5].map(item => (
              <View key={item} style={styles.skeletonCategoryWrapper}>
                <SkeletonLoader type="category" width={p(60)} height={p(60)} />
                <SkeletonLoader
                  type="text"
                  width={p(50)}
                  height={p(12)}
                  style={styles.skeletonText}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CategoryItem
            category={{ id: 'all', name: 'All' }}
            onPress={onCategoryPress}
            size="medium"
          />
          {categories.map(category => (
            <CategoryItem
              key={category.id}
              category={category}
              onPress={onCategoryPress}
              size="medium"
            />
          ))}
        </ScrollView>
      </View>
    );
  },
);

// Memoized Popular Items Component
const PopularItems = memo(
  ({ loading, popularItems, onProductPress, onAddToCart, navigation }) => {
    if (loading) {
      return (
        <View style={styles.popularContainer}>
          <Text style={styles.sectionTitle}>Popular</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map(item => (
              <View key={item} style={styles.skeletonProductWrapper}>
                <View style={styles.skeletonCard}>
                  <SkeletonLoader
                    type="card"
                    width={p(160)}
                    height={p(120)}
                    style={styles.skeletonImage}
                  />
                  <SkeletonLoader
                    type="text"
                    width={p(120)}
                    height={p(16)}
                    style={styles.skeletonTitle}
                  />
                  <SkeletonLoader
                    type="text"
                    width={p(80)}
                    height={p(12)}
                    style={styles.skeletonRating}
                  />
                  <SkeletonLoader
                    type="text"
                    width={p(100)}
                    height={p(16)}
                    style={styles.skeletonPrice}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.popularContainer}>
        <Text style={styles.sectionTitle}>Popular</Text>
        {popularItems.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularItems.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={() => onProductPress(item)}
                onAddToCart={onAddToCart}
                size="medium"
                navigation={navigation}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="shopping-bag" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No products available</Text>
          </View>
        )}
      </View>
    );
  },
);

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { vegetables, categories, loading, categoriesLoading } = useSelector(
    state => state.vegetables,
  );
  const { popularItems, popularLoading, popularError } = useSelector(
    state => state.wishlist,
  );
  const { addError } = useSelector(state => state.cart);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
    dispatch(fetchVegetableCategories());
    dispatch(fetchPopularItems());
  }, [dispatch]);

  // Monitor cart errors and show error modal automatically
  useEffect(() => {
    if (addError) {
      setErrorMessage(
        addError.message || addError.error || 'Failed to add item to cart',
      );
      setShowErrorModal(true);
    }
  }, [addError]);

  // Clear search query when user comes back to DashboardScreen
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, []),
  );

  // Transform popular items data to match ProductCard format
  const transformedPopularItems = popularItems.map(item => ({
    ...item.vegetable,
    // Add any additional fields if needed
  }));

  // Handle search functionality
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // Navigate to BucketScreen with search query
      navigation.navigate('App', {
        screen: 'BucketTab',
        params: {
          searchQuery: searchQuery.trim(),
          selectedCategory: 'all',
        },
      });
    }
  }, [searchQuery, navigation]);

  // Handle search input change
  const handleSearchChange = useCallback(text => {
    setSearchQuery(text);
  }, []);

  // Handle category press
  const handleCategoryPress = useCallback(
    category => {
      console.log('Category pressed:', category.name);
      navigation.navigate('CategoryProducts', { category });
    },
    [navigation],
  );

  // Handle product press
  const handleProductPress = useCallback(
    item => {
      navigation.navigate('ProductDetail', { product: item });
    },
    [navigation],
  );

  // Handle add to cart
  const handleAddToCart = useCallback(
    async item => {
      try {
        console.log('Adding to cart:', item.name);
        await dispatch(
          addToCart({
            vegetable_id: item.id,
            quantity: 1,
          }),
        ).unwrap();

        // Show success modal
        setSuccessMessage(`${item.name} added to cart successfully!`);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Add to cart error:', error);
        // Show error modal
        const errorMsg =
          error.message ||
          error.error ||
          'Failed to add item to cart. Please try again.';
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      }
    },
    [dispatch],
  );

  const handleNotificationPress = useCallback(() => {
    // Handle notification press
    console.log('Notification pressed');
  }, []);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleErrorModalClose = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />

      <CommonHeader
        screenName="Walstar VeggieMart"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PromoBanner navigation={navigation} />
        <Categories
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCategoryPress={handleCategoryPress}
        />
        <PopularItems
          loading={popularLoading}
          popularItems={transformedPopularItems}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          navigation={navigation}
        />
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
        onSecondaryButtonPress={() => {
          setShowSuccessModal(false);
          // Navigate to App (BottomTabNavigator) and then to CartTab
          navigation.navigate('App', { screen: 'CartTab' });
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleErrorModalClose}
        title="Error"
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
  // Search Bar Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: p(16),
    paddingVertical: p(4),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(6),
    paddingHorizontal: p(12),
    paddingVertical: p(2),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: '#333',
    marginRight: p(8),
    fontFamily: 'Poppins-Regular',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: p(16),
  },

  // Categories Styles
  categoriesContainer: {
    marginBottom: p(16),
    marginVertical: p(16),
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(12),
    fontFamily: 'Poppins-Bold',
  },
  // Popular Items Styles
  popularContainer: {
    marginVertical: p(16),
    paddingBottom: p(8),
  },
  // Skeleton Loader Styles
  skeletonCategoryWrapper: {
    alignItems: 'center',
    marginRight: p(16),
  },
  skeletonText: {
    marginTop: p(8),
  },
  skeletonProductWrapper: {
    marginRight: p(12),
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
    width: p(160),
    height: p(240),
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(24),
  },
  emptyStateText: {
    marginTop: p(8),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default DashboardScreen;
