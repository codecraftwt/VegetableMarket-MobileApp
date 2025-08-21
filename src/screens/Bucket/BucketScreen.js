import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';
import ProductCard from '../../components/ProductCard';
import CategoryItem from '../../components/CategoryItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVegetables, fetchVegetableCategories } from '../../redux/slices/vegetablesSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const BucketScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const { vegetables, categories, loading, categoriesLoading } = useSelector(state => state.vegetables);
  const { addLoading } = useSelector(state => state.cart);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
    dispatch(fetchVegetableCategories());
  }, [dispatch]);

  const handleNotificationPress = () => {
    console.log('Bucket notification pressed');
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category.id);
    navigation.navigate('CategoryProducts', { category });
  };

  // Filter vegetables by selected category
  const filteredVegetables =
    selectedCategory === 'all'
      ? vegetables
      : vegetables.filter(item => 
          item.category?.id === selectedCategory || 
          item.category?.name?.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name?.toLowerCase()
        );

  const CategoriesSection = () => {
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

    if (loading) {
      return (
        <View style={styles.vegetablesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'All Products'
              : `${categories.find(c => c.id === selectedCategory)?.name} Products`}
          </Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#019a34" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.vegetablesContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all'
            ? 'All Products'
            : `${categories.find(c => c.id === selectedCategory)?.name} Products`}
        </Text>
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
                    size="medium"
                    navigation={navigation}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
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
    );
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleViewCart = () => {
    console.log('BucketScreen: handleViewCart called');
    console.log('BucketScreen: navigation prop:', navigation);
    setShowSuccessModal(false);
    console.log('BucketScreen: Navigating to Cart screen');
    navigation.navigate('Cart');
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(50),
    marginTop: p(20),
  },
  emptyStateTitle: {
    fontSize: fontSizes.lg,
    color: '#666',
    marginTop: p(20),
    fontFamily: 'Montserrat-Bold',
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.base,
    color: '#999',
    marginTop: p(10),
    textAlign: 'center',
    paddingHorizontal: p(20),
    fontFamily: 'Poppins-Regular',
  },
});

export default BucketScreen;
