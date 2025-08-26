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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import CommonHeader from '../../components/CommonHeader';
import ProductCard from '../../components/ProductCard';
import CategoryItem from '../../components/CategoryItem';
import PromoBanner from '../../components/PromoBanner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVegetables, fetchVegetableCategories } from '../../redux/slices/vegetablesSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#019a34" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#019a34" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(20),
  },
  loadingText: {
    marginLeft: p(10),
    fontSize: fontSizes.base,
    color: '#666',
    fontFamily: 'Poppins-Regular',
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
