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
import { addToCart, addItemToCart } from '../../../redux/slices/cartSlice';
import { toggleWishlistItem, fetchWishlist } from '../../../redux/slices/wishlistSlice';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const ProductDetailScreen = ({ navigation, route }) => {
  const [quantity, setQuantity] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWishlistSuccessModal, setShowWishlistSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [wishlistMessage, setWishlistMessage] = useState('');
  const dispatch = useDispatch();
  const { vegetables, loading: vegetablesLoading } = useSelector(state => state.vegetables);
  const { addLoading } = useSelector(state => state.cart);
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(state => state.wishlist);
  
  // Get product data from navigation params or use default
  const product = route.params?.product || {
    id: 1,
    name: 'Fresh Orange',
    price: '₹2.99',
    unit: 'KG',
    rating: 4.0,
    image: require('../../../assets/vegebg.png'),
    description: 'Orange is a vibrant and juicy citrus fruit, known for its refreshing flavor and bright color. With a tangy savory sweetness, it adds a burst of freshness to both sweet and savory dishes. The peel of an orange is often used in cooking and baking to impart a zesty',
    category: {
      id: 1,
      name: 'Fruits'
    },
    farmer: {
      id: 1,
      name: 'John Smith',
      phone: '+91 9876543210'
    }
  };

  // Debug logging to see what product data we're receiving
  console.log('ProductDetailScreen: Received product data:', {
    product: product,
    hasCategory: !!product.category,
    hasFarmer: !!product.farmer,
    categoryName: product.category?.name,
    farmerName: product.farmer?.name,
    farmerData: product.farmer
  });

  // Try to find complete product data from vegetables list if current product is incomplete
  const completeProduct = React.useMemo(() => {
    // Always try to find the complete product from vegetables list first
    const foundProduct = vegetables.find(item => item.id === product.id);
    if (foundProduct) {
      console.log('ProductDetailScreen: Found complete product data from vegetables list:', foundProduct);
      return foundProduct;
    }
    
    // If not found in vegetables list, check if current product has complete data
    if (product.category && product.farmer) {
      console.log('ProductDetailScreen: Using current product data (complete):', product);
      return product;
    }
    
    // If current product is incomplete, enhance it with better fallbacks
    console.log('ProductDetailScreen: Using enhanced product data with fallbacks:', product);
    return {
      ...product,
      category: product.category || { id: 1, name: 'General' },
      farmer: product.farmer || { id: 1, name: 'Farmer Information Not Available', phone: '' }
    };
  }, [product, vegetables]);

  // Fetch vegetables and wishlist when component mounts
  useEffect(() => {
    dispatch(fetchVegetables());
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Force re-render when vegetables are loaded to update completeProduct
  useEffect(() => {
    if (vegetables.length > 0 && (!product.category || !product.farmer)) {
      console.log('ProductDetailScreen: Vegetables loaded, checking for complete product data');
    }
  }, [vegetables, product]);

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
      // Update cart state immediately for badge
      dispatch(addItemToCart({
        vegetable_id: completeProduct.id,
        quantity: quantity,
        vegetable: completeProduct
      }));

      // Show success modal immediately
      setSuccessMessage(`${quantity} ${getProductUnit()} of ${completeProduct.name} (${getTotalPrice()}) added to cart successfully!`);
      setShowSuccessModal(true);

      // Make API call in background
      dispatch(addToCart({ 
        vegetable_id: completeProduct.id, 
        quantity: quantity 
      })).unwrap().then(() => {
        console.log('ProductDetailScreen: Add to cart API successful');
      }).catch((error) => {
        console.error('ProductDetailScreen: Add to cart API error:', error);
      });
    } catch (error) {
      // Show error modal
      setErrorMessage(error.message || 'Failed to add item to cart. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = wishlistItems?.some(item => item.id === completeProduct.id || item.vegetable_id === completeProduct.id) || false;

  const handleWishlistToggle = async () => {
    try {
      // Use toggleWishlistItem which handles both add and remove
      const result = await dispatch(toggleWishlistItem(completeProduct.id)).unwrap();
      
      if (result.wishlisted) {
        setWishlistMessage(`${completeProduct.name} added to wishlist!`);
      } else {
        setWishlistMessage(`${completeProduct.name} removed from wishlist!`);
      }
      setShowWishlistSuccessModal(true);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      setErrorMessage(error.message || 'Failed to update wishlist. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleWishlistSuccessModalClose = () => {
    setShowWishlistSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    // Navigate to App (BottomTabNavigator) and then to CartTab
    navigation.navigate('App', { screen: 'CartTab' });
  };

  const handleViewWishlist = () => {
    setShowWishlistSuccessModal(false);
    // Navigate to Wishlist screen
    navigation.navigate('Wishlist');
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
        item.id !== completeProduct.id && 
        (item.category?.id === completeProduct.category?.id || 
         item.category?.name?.toLowerCase() === completeProduct.category?.name?.toLowerCase())
      )
      .slice(0, 8);

    const handleRelatedProductPress = (item) => {
      console.log('Navigating to product detail:', item.name);
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleRelatedAddToCart = async (item) => {
      try {
        console.log('Adding related product to cart:', item.name);
        
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
          console.log('Related product add to cart API successful');
        }).catch((error) => {
          console.error('Related product add to cart API error:', error);
        });
      } catch (error) {
        console.error('Related product add to cart error:', error);
        setErrorMessage(error.message || 'Failed to add item to cart. Please try again.');
        setShowErrorModal(true);
      }
    };

    // Always show the related products section, even if empty
    return (
      <View style={styles.relatedSection}>
        <Text style={styles.relatedTitle}>Related Products</Text>
        {relatedItems.length === 0 ? (
          <View style={styles.noRelatedProducts}>
            <Text style={styles.noRelatedText}>No related products found</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onPress={() => handleRelatedProductPress(item)}
                onAddToCart={handleRelatedAddToCart}
                showWishlist={true}
                size="medium"
                navigation={navigation}
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  // Helper function to get product image
  const getProductImage = () => {
    if (completeProduct?.images && completeProduct.images.length > 0) {
      return { uri: `https://kisancart.in/storage/${completeProduct.images[0].image_path}` };
    }
    return completeProduct.image || require('../../../assets/vegebg.png');
  };

  // Helper function to get product price
  const getPriceDisplay = () => {
    if (completeProduct.price_per_kg) {
      return `₹${parseFloat(completeProduct.price_per_kg).toFixed(2)}`;
    }
    return completeProduct?.price || '₹0.00';
  };

  // Helper function to get total price (price × quantity)
  const getTotalPrice = () => {
    const basePrice = completeProduct.price_per_kg ? parseFloat(completeProduct.price_per_kg) : parseFloat(completeProduct?.price?.replace('₹', '') || '0');
    const totalPrice = basePrice * quantity;
    return `₹${totalPrice.toFixed(2)}`;
  };

  // Helper function to get product unit
  const getProductUnit = () => {
    return completeProduct?.unit_type || completeProduct?.unit || 'kg';
  };

  // Helper function to get product description
  const getProductDescription = () => {
    return completeProduct?.description || 'No description available for this product.';
  };

  const handlePhonePress = () => {
    if (completeProduct?.farmer?.phone) {
      const phoneNumber = `tel:${completeProduct.farmer.phone}`;
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
              {/* Wishlist Heart Icon */}
              <TouchableOpacity 
                style={styles.wishlistButton}
                onPress={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Icon 
                  name={isInWishlist ? "heart" : "heart-o"} 
                  size={18} 
                  color={isInWishlist ? "#dc3545" : "#fff"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Product Information Card */}
            <View style={styles.productCard}>
          {/* Product Name and Rating */}
          <Text style={styles.productName}>{completeProduct?.name || 'Unknown Product'}</Text>
          <StarRating rating={completeProduct?.rating || 0} />
          
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
          <View style={styles.farmerSection}>
            <Text style={styles.farmerTitle}>Farmer Information</Text>
            {completeProduct?.farmer ? (
              <>
                <TouchableOpacity 
                  style={styles.farmerInfo}
                  onPress={() => navigation.navigate('FarmerProfile', { 
                    farmerId: completeProduct.farmer.id, 
                    farmerName: completeProduct.farmer.name 
                  })}
                >
                  <Icon name="user" size={16} color="#019a34" style={styles.farmerIcon} />
                  <Text style={styles.farmerName}>{completeProduct.farmer.name}</Text>
                  <Icon name="chevron-right" size={14} color="#019a34" style={styles.farmerChevron} />
                </TouchableOpacity>
                {completeProduct.farmer.phone && (
                  <View style={styles.farmerInfo}>
                    <Icon name="phone" size={16} color="#019a34" style={styles.farmerIcon} />
                    <TouchableOpacity onPress={handlePhonePress}>
                      <Text style={styles.farmerPhone}>{completeProduct.farmer.phone}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noFarmerInfo}>
                <Icon name="user" size={16} color="#999" style={styles.farmerIcon} />
                <Text style={styles.noFarmerText}>
                  {completeProduct.farmer?.name === 'Farmer Information Not Available' 
                    ? 'Farmer information not available' 
                    : 'Loading farmer information...'}
                </Text>
              </View>
            )}
          </View>
          
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
          <Text style={styles.totalPrice}>{getTotalPrice()}</Text>
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

      {/* Wishlist Success Modal */}
      <SuccessModal
        visible={showWishlistSuccessModal}
        onClose={handleWishlistSuccessModalClose}
        title="Wishlist Updated!"
        message={wishlistMessage}
        buttonText="OK"
        onButtonPress={handleWishlistSuccessModalClose}
        showSecondaryButton={true}
        secondaryButtonText="View Wishlist"
        onSecondaryButtonPress={handleViewWishlist}
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
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: p(250),
    borderRadius: p(8),
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: p(22),
    right: p(25),
    width: p(32),
    height: p(32),
    borderRadius: p(16),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
  noFarmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: p(6),
  },
  noFarmerText: {
    fontSize: fontSizes.sm,
    color: '#999',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
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
  noRelatedProducts: {
    padding: p(20),
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
  },
  noRelatedText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
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
