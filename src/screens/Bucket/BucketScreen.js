import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../utils/Responsive';
import { fontSizes } from '../../utils/fonts';

const BucketScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const handleNotificationPress = () => {
    console.log('Bucket notification pressed');
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  // Categories data
  const categories = [
    { id: 'all', name: 'All', icon: 'th-large', color: '#019a34' },
    { id: 'veggies', name: 'Veggies', icon: 'carrot', color: '#4CAF50' },
    { id: 'fruits', name: 'Fruits', icon: 'apple', color: '#FF9800' },
    { id: 'meat', name: 'Meat', color: '#F44336' },
    { id: 'dairy', name: 'Dairy', icon: 'glass', color: '#2196F3' },
  ];

  // Sample vegetables data
  const vegetables = [
    { id: 1, name: 'Fresh Tomatoes', price: '$2.99', category: 'veggies', image: require('../../assets/vegebg.png') },
    { id: 2, name: 'Organic Carrots', price: '$1.99', category: 'veggies', image: require('../../assets/vegebg.png') },
    { id: 3, name: 'Green Bell Peppers', price: '$3.49', category: 'veggies', image: require('../../assets/vegebg.png') },
    { id: 4, name: 'Fresh Onions', price: '$1.49', category: 'veggies', image: require('../../assets/vegebg.png') },
    { id: 5, name: 'Cucumber', price: '$0.99', category: 'veggies', image: require('../../assets/vegebg.png') },
    { id: 6, name: 'Broccoli', price: '$2.49', category: 'veggies', image: require('../../assets/vegebg.png') },
  ];

  const filteredVegetables = selectedCategory === 'all' 
    ? vegetables 
    : vegetables.filter(item => item.category === selectedCategory);

  const CategoriesSection = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Icon name={category.icon || 'leaf'} size={24} color="#fff" />
            </View>
            <Text style={[
              styles.categoryName,
              selectedCategory === category.id && styles.selectedCategoryName
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const VegetablesSection = () => (
    <View style={styles.vegetablesContainer}>
      <Text style={styles.sectionTitle}>
        {selectedCategory === 'all' ? 'All Vegetables' : `${categories.find(c => c.id === selectedCategory)?.name} Vegetables`}
      </Text>
      <View style={styles.vegetablesGrid}>
        {filteredVegetables.map((item) => (
          <TouchableOpacity key={item.id} style={styles.vegetableItem}>
            <Image source={item.image} style={styles.vegetableImage} />
            <View style={styles.vegetableInfo}>
              <Text style={styles.vegetableName}>{item.name}</Text>
              <Text style={styles.vegetablePrice}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addToCartButton}>
              <Icon name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#019a34" />
      
      <CommonHeader 
        screenName="Bucket"
        showBackButton={false}
        showNotification={true}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CategoriesSection />
        <VegetablesSection />
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
  
  // Categories Styles
  categoriesContainer: {
    marginVertical: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    color: '#333',
    marginBottom: p(15),
    fontFamily: 'Montserrat-Bold',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: p(20),
    paddingVertical: p(10),
  },
  selectedCategory: {
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    width: p(60),
    height: p(60),
    borderRadius: p(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(10),
  },
  categoryName: {
    fontSize: fontSizes.sm,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  selectedCategoryName: {
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
  },
  
  // Vegetables Styles
  vegetablesContainer: {
    marginVertical: p(20),
  },
  vegetablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vegetableItem: {
    backgroundColor: '#fff',
    borderRadius: p(15),
    padding: p(15),
    marginBottom: p(15),
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vegetableImage: {
    width: '100%',
    height: p(120),
    borderRadius: p(10),
    marginBottom: p(10),
  },
  vegetableInfo: {
    marginBottom: p(10),
  },
  vegetableName: {
    fontSize: fontSizes.sm,
    color: '#333',
    marginBottom: p(5),
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  vegetablePrice: {
    fontSize: fontSizes.base,
    color: '#019a34',
    textAlign: 'center',
    fontFamily: 'Rubik-Bold',
  },
  addToCartButton: {
    position: 'absolute',
    top: p(15),
    right: p(15),
    backgroundColor: '#019a34',
    borderRadius: p(20),
    padding: p(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default BucketScreen;
