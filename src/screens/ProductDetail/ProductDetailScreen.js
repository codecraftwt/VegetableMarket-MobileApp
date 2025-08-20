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

const ProductDetailScreen = ({ navigation, route }) => {
  const [quantity, setQuantity] = useState(1);
  
  // Get product data from navigation params or use default
  const product = route.params?.product || {
    id: 1,
    name: 'Fresh Orange',
    price: '$2.99',
    unit: 'KG',
    rating: 4.0,
    image: require('../../assets/vegebg.png'),
    description: 'Orange is a vibrant and juicy citrus fruit, known for its refreshing flavor and bright color. With a tangy savory sweetness, it adds a burst of freshness to both sweet and savory dishes. The peel of an orange is often used in cooking and baking to impart a zesty',
  };

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

  const handleAddToCart = () => {
    console.log('Added to cart:', product.name, 'Quantity:', quantity);
    // Add to cart logic here
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
    const relatedItems = [
      { 
        id: 1, 
        name: 'Lemon', 
        price: '$1.20', 
        unit: 'KG',
        rating: 4.0,
        image: require('../../assets/vegebg.png') 
      },
      { 
        id: 2, 
        name: 'Apple', 
        price: '$3.99', 
        unit: 'KG',
        rating: 4.2,
        image: require('../../assets/vegebg.png') 
      },
      { 
        id: 3, 
        name: 'Banana', 
        price: '$2.49', 
        unit: 'KG',
        rating: 4.1,
        image: require('../../assets/vegebg.png') 
      },
      { 
        id: 4, 
        name: 'Grapes', 
        price: '$4.99', 
        unit: 'KG',
        rating: 4.3,
        image: require('../../assets/vegebg.png') 
      },
    ];

    const handleRelatedProductPress = (item) => {
      console.log('Navigating to product detail:', item.name);
      navigation.navigate('ProductDetail', { product: item });
    };

    const handleRelatedAddToCart = (item) => {
      console.log('Added related product to cart:', item.name);
      // Add to cart logic here
    };

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
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Details"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <Image source={product.image} style={styles.productImage} />
        </View>
        
        {/* Product Information Card */}
        <View style={styles.productCard}>
          {/* Product Name and Rating */}
          <Text style={styles.productName}>{product.name}</Text>
          <StarRating rating={product.rating} />
          
          {/* Price and Quantity Selector */}
          <View style={styles.priceQuantityRow}>
            <Text style={styles.productPrice}>{product.price}/{product.unit}</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange('decrease')}
              >
                <Icon name="minus" size={16} color="#666" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity} {product.unit}</Text>
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
              {product.description}
              <Text style={styles.readMoreText}> Read More</Text>
            </Text>
          </View>
          
          {/* Related Products */}
          <RelatedProducts />
        </View>
      </ScrollView>
      
      {/* Bottom Fixed Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>{product.price}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
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
  },
  
  // Product Image Section
  imageSection: {
    backgroundColor: '#f0f8f0',
    padding: p(20),
    marginBottom: p(0),
  },
  productImage: {
    width: '100%',
    height: p(250),
    borderRadius: p(20),
    resizeMode: 'cover',
  },
  
  // Product Information Card
  productCard: {
    backgroundColor: '#f6fbf7',
    borderTopLeftRadius: p(20),
    borderTopRightRadius: p(20),
    padding: p(20),
    marginTop: p(-20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productName: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: p(15),
    gap: p(3),
  },
  
  // Price and Quantity Row
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: p(20),
  },
  productPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(25),
    paddingHorizontal: p(5),
  },
  quantityButton: {
    width: p(40),
    height: p(40),
    borderRadius: p(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    fontSize: fontSizes.base,
    color: '#333',
    marginHorizontal: p(15),
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Product Details Section
  detailsSection: {
    marginBottom: p(25),
  },
  detailsTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(10),
    fontFamily: 'Montserrat-Bold',
  },
  detailsText: {
    fontSize: fontSizes.base,
    color: '#666',
    lineHeight: p(22),
    fontFamily: 'Poppins-Regular',
  },
  readMoreText: {
    color: '#019a34',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Related Products Section
  relatedSection: {
    marginBottom: p(20),
  },
  relatedTitle: {
    fontSize: fontSizes.lg,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },
  
  // Bottom Fixed Bar
  bottomBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: p(20),
    paddingVertical: p(15),
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: p(5),
    fontFamily: 'Poppins-Regular',
  },
  totalPrice: {
    fontSize: fontSizes.lg,
    color: '#019a34',
    fontFamily: 'Rubik-Bold',
  },
  addToCartButton: {
    backgroundColor: '#019a34',
    paddingHorizontal: p(25),
    paddingVertical: p(10),
    borderRadius: p(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartText: {
    color: '#fff',
    fontSize: fontSizes.base,
    fontFamily: 'Poppins-Bold',
  },
});

export default ProductDetailScreen;
