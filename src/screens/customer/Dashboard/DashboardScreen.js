import React, { useState, useEffect } from 'react';
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
import { fetchVegetables, fetchVegetableCategories } from '../../../redux/slices/vegetablesSlice';
import { addToCart } from '../../../redux/slices/cartSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { vegetables, categories, loading, categoriesLoading } = useSelector(state => state.vegetables);
  const { addError } = useSelector(state => state.cart);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
    dispatch(fetchVegetableCategories());
  }, [dispatch]);

  // Monitor cart errors and show error modal automatically
  useEffect(() => {
    if (addError) {
      setErrorMessage(addError.message || addError.error || 'Failed to add item to cart');
      setShowErrorModal(true);
    }
  }, [addError]);

  // Get popular items (first 4 items from all vegetables)
  const popularItems = vegetables.slice(0, 4);

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



  // Categories Component
  const Categories = () => {
    const handleCategoryPress = (category) => {
      console.log('Category pressed:', category.name);
      navigation.navigate('CategoryProducts', { category });
    };

    if (categoriesLoading) {
      return (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Add "All" category */}
          <CategoryItem
            category={{ id: 'all', name: 'All' }}
            onPress={handleCategoryPress}
            size="medium"
          />
          {/* Map through API categories */}
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
    const handleProductPress = (item) => {
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleAddToCart = async (item) => {
      try {
        console.log('Adding to cart:', item.name);
        await dispatch(addToCart({ 
          vegetable_id: item.id, 
          quantity: 1 
        })).unwrap();
        
        // Show success modal
        setSuccessMessage(`${item.name} added to cart successfully!`);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Add to cart error:', error);
        // Show error modal
        const errorMsg = error.message || error.error || 'Failed to add item to cart. Please try again.';
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
      }
    };

    if (loading) {
      return (
        <View style={styles.popularContainer}>
          <Text style={styles.sectionTitle}>Popular</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Skeleton loaders for popular items */}
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonProductWrapper}>
                <View style={styles.skeletonCard}>
                  <SkeletonLoader type="card" width={p(160)} height={p(120)} style={styles.skeletonImage} />
                  <SkeletonLoader type="text" width={p(120)} height={p(16)} style={styles.skeletonTitle} />
                  <SkeletonLoader type="text" width={p(80)} height={p(12)} style={styles.skeletonRating} />
                  <SkeletonLoader type="text" width={p(100)} height={p(16)} style={styles.skeletonPrice} />
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
        ) : (
          <View style={styles.emptyState}>
            <Icon name="shopping-bag" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>No products available</Text>
          </View>
        )}
      </View>
    );
  };

  const handleNotificationPress = () => {
    // Handle notification press
    console.log('Notification pressed');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

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
      
      <SearchBar />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PromoBanner navigation={navigation} />
        <Categories />
        <PopularItems />
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
          navigation.navigate('Cart');
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
  // Skeleton Loader Styles
  skeletonCategoryWrapper: {
    alignItems: 'center',
    marginRight: p(20),
  },
  skeletonText: {
    marginTop: p(10),
  },
  skeletonProductWrapper: {
    marginRight: p(15),
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: p(160),
    height: p(240),
  },
  skeletonImage: {
    marginBottom: p(15),
  },
  skeletonTitle: {
    marginBottom: p(3),
  },
  skeletonRating: {
    marginBottom: p(5),
  },
  skeletonPrice: {
    marginTop: p(5),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(30),
  },
  emptyStateText: {
    marginTop: p(10),
    fontSize: fontSizes.base,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
});

export default DashboardScreen;
