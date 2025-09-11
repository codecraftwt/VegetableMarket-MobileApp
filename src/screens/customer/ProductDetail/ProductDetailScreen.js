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
  Linking,
  Alert,
} from 'react-native';
import SkeletonLoader from '../../../components/SkeletonLoader';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import ProductCard from '../../../components/ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVegetables } from '../../../redux/slices/vegetablesSlice';
import { addToCart } from '../../../redux/slices/cartSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const ProductDetailScreen = ({ navigation, route }) => {
  const [quantity, setQuantity] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const { vegetables, loading: vegetablesLoading } = useSelector(state => state.vegetables);
  const { addLoading } = useSelector(state => state.cart);
  
  // Get product data from navigation params or use default
  const product = route.params?.product || {
    id: 1,
    name: 'Fresh Orange',
    price: '₹2.99',
    unit: 'KG',
    rating: 4.0,
    image: require('../../../assets/vegebg.png'),
    description: 'Orange is a vibrant and juicy citrus fruit, known for its refreshing flavor and bright color. With a tangy savory sweetness, it adds a burst of freshness to both sweet and savory dishes. The peel of an orange is often used in cooking and baking to impart a zesty',
  };

  // Fetch vegetables when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
  }, [dispatch]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNotificationPress = () => {
    console.log('Product detail notification pressed');
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ 
        vegetable_id: product.id, 
        quantity: quantity 
      })).unwrap();
      
      // Show success modal
      setSuccessMessage(`${product.name} added to cart successfully!`);
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to add item to cart. Please try again.');
      setShowErrorModal(true);
    }
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

  const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={16} color="#FF9800" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Icon key={`half`} name="star-half-o" size={16} color="#FF9800" />
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-o" size={16} color="#FF9800" />
      );
    }
    
    return (
      <View style={styles.starRating}>
        {stars}
      </View>
    );
  };

  const RelatedProducts = () => {
    // Get related products from the same category (7-8 products)
    const relatedItems = vegetables
      .filter(item => 
        item.id !== product.id && 
        (item.category?.id === product.category?.id || 
         item.category?.name?.toLowerCase() === product.category?.name?.toLowerCase())
      )
      .slice(0, 8);

    const handleRelatedProductPress = (item) => {
      console.log('Navigating to product detail:', item.name);
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleRelatedAddToCart = (item) => {
      console.log('Added related product to cart:', item.name);
      // Add to cart logic here
    };

    if (relatedItems.length === 0) {
      return null; // Don't show related products section if none available
    }

    return (
      <View style={styles.relatedSection}>
        <Text style={styles.relatedTitle}>Related Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onPress={() => handleRelatedProductPress(item)}
              onAddToCart={handleRelatedAddToCart}
              size="medium"
              navigation={navigation}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Helper function to get product image
  const getProductImage = () => {
    if (product?.images && product.images.length > 0) {
      return { uri: `https://vegetables.walstarmedia.com/storage/${product.images[0].image_path}` };
    }
    return product.image || require('../../../assets/vegebg.png');
  };

  // Helper function to get product price
  const getPriceDisplay = () => {
    if (product.price_per_kg) {
      return `₹${parseFloat(product.price_per_kg).toFixed(2)}`;
    }
    return product?.price || '₹0.00';
  };

  // Helper function to get product unit
  const getProductUnit = () => {
    return product?.unit_type || product?.unit || 'kg';
  };

  // Helper function to get product description
  const getProductDescription = () => {
    return product?.description || 'No description available for this product.';
  };

  const handlePhonePress = () => {
    if (product?.farmer?.phone) {
      const phoneNumber = `tel:${product.farmer.phone}`;
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(phoneNumber);
          } else {
            Alert.alert('Error', 'Phone dialer not available on this device');
          }
        })
        .catch((err) => {
          console.error('Error opening phone dialer:', err);
          Alert.alert('Error', 'Failed to open phone dialer');
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {vegetablesLoading ? (
          <>
            {/* Skeleton loader for product image */}
            <View style={styles.imageSection}>
              <SkeletonLoader type="banner" width="100%" height={p(250)} borderRadius={p(20)} />
            </View>
            
            {/* Skeleton loader for product information */}
            <View style={styles.productCard}>
              {/* Product Name Skeleton */}
              <SkeletonLoader type="text" width="80%" height={p(24)} style={styles.skeletonProductName} />
              
              {/* Star Rating Skeleton */}
              <View style={styles.skeletonStarRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <SkeletonLoader key={star} type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                ))}
              </View>
              
              {/* Price and Quantity Skeleton */}
              <View style={styles.priceQuantityRow}>
                <SkeletonLoader type="text" width="40%" height={p(20)} />
                <View style={styles.quantitySelector}>
                  <SkeletonLoader type="category" width={p(40)} height={p(40)} borderRadius={p(20)} />
                  <SkeletonLoader type="text" width={p(60)} height={p(16)} style={styles.skeletonQuantityText} />
                  <SkeletonLoader type="category" width={p(40)} height={p(40)} borderRadius={p(20)} />
                </View>
              </View>
              
              {/* Product Details Skeleton */}
              <View style={styles.detailsSection}>
                <SkeletonLoader type="text" width="50%" height={p(20)} style={styles.skeletonDetailsTitle} />
                <SkeletonLoader type="text" width="100%" height={p(16)} style={styles.skeletonDetailsText} />
                <SkeletonLoader type="text" width="90%" height={p(16)} style={styles.skeletonDetailsText} />
                <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonDetailsText} />
              </View>
              
              {/* Farmer Information Skeleton */}
              <View style={styles.farmerSection}>
                <SkeletonLoader type="text" width="60%" height={p(20)} style={styles.skeletonFarmerTitle} />
                <View style={styles.skeletonFarmerInfo}>
                  <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                  <SkeletonLoader type="text" width="50%" height={p(16)} style={styles.skeletonFarmerName} />
                  <SkeletonLoader type="category" width={p(14)} height={p(14)} borderRadius={p(7)} />
                </View>
                <View style={styles.skeletonFarmerInfo}>
                  <SkeletonLoader type="category" width={p(16)} height={p(16)} borderRadius={p(8)} />
                  <SkeletonLoader type="text" width="40%" height={p(16)} />
                </View>
              </View>
              
              {/* Related Products Skeleton */}
              <View style={styles.relatedSection}>
                <SkeletonLoader type="text" width="50%" height={p(20)} style={styles.skeletonRelatedTitle} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.skeletonRelatedProduct}>
                      <SkeletonLoader type="card" width={p(160)} height={p(120)} style={styles.skeletonRelatedImage} />
                      <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonRelatedName} />
                      <SkeletonLoader type="text" width="60%" height={p(12)} style={styles.skeletonRelatedRating} />
                      <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonRelatedPrice} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Product Image Section */}
            <View style={styles.imageSection}>
              <Image source={getProductImage()} style={styles.productImage} />
            </View>
            
            {/* Product Information Card */}
            <View style={styles.productCard}>
          {/* Product Name and Rating */}
          <Text style={styles.productName}>{product?.name || 'Unknown Product'}</Text>
          <StarRating rating={product?.rating || 0} />
          
          {/* Price and Quantity Selector */}
          <View style={styles.priceQuantityRow}>
            <Text style={styles.productPrice}>{getPriceDisplay()}/{getProductUnit()}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange('decrease')}
              >
                <Icon name="minus" size={16} color="#666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity} {getProductUnit()}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange('increase')}
              >
                <Icon name="plus" size={16} color="#019a34" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Product Details</Text>
            <Text style={styles.detailsText}>
              {getProductDescription()}
            </Text>
          </View>
          
          {/* Farmer Information */}
          {product?.farmer && (
            <View style={styles.farmerSection}>
              <Text style={styles.farmerTitle}>Farmer Information</Text>
              <TouchableOpacity 
                style={styles.farmerInfo}
                onPress={() => navigation.navigate('FarmerProfile', { 
                  farmerId: product.farmer.id, 
                  farmerName: product.farmer.name 
                })}
              >
                <Icon name="user" size={16} color="#019a34" style={styles.farmerIcon} />
                <Text style={styles.farmerName}>{product.farmer.name}</Text>
                <Icon name="chevron-right" size={14} color="#019a34" style={styles.farmerChevron} />
              </TouchableOpacity>
              {product.farmer.phone && (
                <View style={styles.farmerInfo}>
                  <Icon name="phone" size={16} color="#019a34" style={styles.farmerIcon} />
                  <TouchableOpacity onPress={handlePhonePress}>
                    <Text style={styles.farmerPhone}>{product.farmer.phone}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {/* Related Products */}
          <RelatedProducts />
        </View>
          </>
        )}
      </ScrollView>
      
      {/* Bottom Fixed Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>{getPriceDisplay()}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart} disabled={addLoading}>
          {addLoading ? (
            <SkeletonLoader type="text" width={p(80)} height={p(16)} borderRadius={p(8)} />
          ) : (
            <Text style={styles.addToCartText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Added to Cart!"
        message={successMessage}
        buttonText="OK"
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
        onRetry={handleAddToCart}
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
  },
  
  // Product Image Section
  imageSection: {
    backgroundColor: '#f0f8f0',
    padding: p(16),
    marginBottom: p(0),
  },
  productImage: {
    width: '100%',
    height: p(250),
    borderRadius: p(8),
    resizeMode: 'cover',
  },
  
  // Product Information Card
  productCard: {
    backgroundColor: '#f6fbf7',
    borderTopLeftRadius: p(8),
    borderTopRightRadius: p(8),
    padding: p(16),
    marginTop: p(-16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  productName: {
    fontSize: fontSizes.lg,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: p(12),
    gap: p(3),
  },
  
  // Price and Quantity Row
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(16),
  },
  productPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    paddingHorizontal: p(8),
  },
  quantityButton: {
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  quantityText: {
    fontSize: fontSizes.sm,
    color: '#333',
    marginHorizontal: p(12),
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Product Details Section
  detailsSection: {
    marginBottom: p(20),
  },
  detailsTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
  },
  detailsText: {
    fontSize: fontSizes.sm,
    color: '#666',
    lineHeight: p(18),
    fontFamily: 'Poppins-Regular',
  },
  readMoreText: {
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Farmer Section
  farmerSection: {
    marginBottom: p(20),
    backgroundColor: '#f0f8f0',
    borderRadius: p(8),
    padding: p(12),
  },
  farmerTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(8),
    fontFamily: 'Poppins-Bold',
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  farmerIcon: {
    marginRight: p(8),
  },
  farmerName: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  farmerChevron: {
    marginLeft: p(8),
  },
  farmerPhone: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  
  // Related Products Section
  relatedSection: {
    marginBottom: p(16),
  },
  relatedTitle: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    marginBottom: p(12),
    fontFamily: 'Poppins-Bold',
  },
  
  // Bottom Fixed Bar
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(16),
    paddingVertical: p(12),
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: fontSizes.xs,
    color: '#666',
    marginBottom: p(4),
    fontFamily: 'Poppins-Regular',
  },
  totalPrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  addToCartButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(20),
    paddingVertical: p(8),
    borderRadius: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addToCartText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },

  // Skeleton Loader Styles
  skeletonProductName: {
    marginBottom: p(8),
  },
  skeletonStarRating: {
    flexDirection: 'row',
    marginBottom: p(12),
    gap: p(3),
  },
  skeletonQuantityText: {
    marginHorizontal: p(12),
  },
  skeletonDetailsTitle: {
    marginBottom: p(8),
  },
  skeletonDetailsText: {
    marginBottom: p(6),
  },
  skeletonFarmerTitle: {
    marginBottom: p(8),
  },
  skeletonFarmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  skeletonFarmerName: {
    marginLeft: p(8),
    flex: 1,
  },
  skeletonRelatedTitle: {
    marginBottom: p(12),
  },
  skeletonRelatedProduct: {
    marginRight: p(12),
    width: p(160),
  },
  skeletonRelatedImage: {
    marginBottom: p(8),
  },
  skeletonRelatedName: {
    marginBottom: p(4),
  },
  skeletonRelatedRating: {
    marginBottom: p(4),
  },
  skeletonRelatedPrice: {
    marginTop: p(4),
  },
});

export default ProductDetailScreen;
