import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import CommonHeader from '../../../components/CommonHeader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../../../utils/Responsive';
import { fontSizes } from '../../../utils/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchFilteredVegetables, 
  clearFilters, 
  updateFilter, 
  resetFilters 
} from '../../../redux/slices/filterSlice';
import { fetchVegetableCategories } from '../../../redux/slices/vegetablesSlice';
import SkeletonLoader from '../../../components/SkeletonLoader';

const FilterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    vegetables, 
    loading, 
    error, 
    currentFilters, 
    pagination 
  } = useSelector(state => state.filter);
  const { categories } = useSelector(state => state.vegetables);

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');
  const [priceMin, setPriceMin] = useState(currentFilters.price_min?.toString() || '');
  const [priceMax, setPriceMax] = useState(currentFilters.price_max?.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category_id || '');
  const [selectedLocation, setSelectedLocation] = useState(currentFilters.location || '');
  const [isOrganic, setIsOrganic] = useState(currentFilters.organic === 1);

  // Fetch categories when component mounts
  useEffect(() => {
    dispatch(fetchVegetableCategories());
  }, [dispatch]);

  // Apply filters when component mounts or filters change
  useEffect(() => {
    const filters = {
      search: searchQuery,
      price_min: priceMin ? parseFloat(priceMin) : undefined,
      price_max: priceMax ? parseFloat(priceMax) : undefined,
      category_id: selectedCategory || undefined,
      location: selectedLocation || undefined,
      organic: isOrganic ? 1 : undefined,
      page: 1,
      per_page: 12,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );

    if (Object.keys(cleanFilters).length > 0) {
      dispatch(fetchFilteredVegetables(cleanFilters));
    }
  }, [dispatch, searchQuery, priceMin, priceMax, selectedCategory, selectedLocation, isOrganic]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleApplyFilters = useCallback(() => {
    const filters = {
      search: searchQuery,
      price_min: priceMin ? parseFloat(priceMin) : undefined,
      price_max: priceMax ? parseFloat(priceMax) : undefined,
      category_id: selectedCategory || undefined,
      location: selectedLocation || undefined,
      organic: isOrganic ? 1 : undefined,
      page: 1,
      per_page: 12,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );

    dispatch(fetchFilteredVegetables(cleanFilters));
  }, [dispatch, searchQuery, priceMin, priceMax, selectedCategory, selectedLocation, isOrganic]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setSelectedCategory('');
    setSelectedLocation('');
    setIsOrganic(false);
    dispatch(resetFilters());
  }, [dispatch]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  }, [selectedCategory]);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location === selectedLocation ? '' : location);
  }, [selectedLocation]);

  const locations = ['kolhapur', 'mumbai', 'pune', 'delhi', 'bangalore'];

  const FilterSection = ({ title, children }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const PriceRangeInput = () => (
    <View style={styles.priceRangeContainer}>
      <View style={styles.priceInputContainer}>
        <Text style={styles.priceLabel}>Min Price</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="0"
          value={priceMin}
          onChangeText={setPriceMin}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.priceInputContainer}>
        <Text style={styles.priceLabel}>Max Price</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="1000"
          value={priceMax}
          onChangeText={setPriceMax}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const CategorySelector = () => (
    <View style={styles.selectorContainer}>
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.selectorItem,
            selectedCategory === category.id && styles.selectorItemSelected
          ]}
          onPress={() => handleCategorySelect(category.id)}
        >
          <Text style={[
            styles.selectorItemText,
            selectedCategory === category.id && styles.selectorItemTextSelected
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const LocationSelector = () => (
    <View style={styles.selectorContainer}>
      {locations.map(location => (
        <TouchableOpacity
          key={location}
          style={[
            styles.selectorItem,
            selectedLocation === location && styles.selectorItemSelected
          ]}
          onPress={() => handleLocationSelect(location)}
        >
          <Text style={[
            styles.selectorItemText,
            selectedLocation === location && styles.selectorItemTextSelected
          ]}>
            {location.charAt(0).toUpperCase() + location.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const ResultsSection = () => {
    if (loading) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Filtered Results</Text>
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <SkeletonLoader type="card" width="100%" height={p(120)} style={styles.skeletonImage} />
                <SkeletonLoader type="text" width="80%" height={p(16)} style={styles.skeletonTitle} />
                <SkeletonLoader type="text" width="60%" height={p(12)} style={styles.skeletonRating} />
                <SkeletonLoader type="text" width="70%" height={p(16)} style={styles.skeletonPrice} />
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Filtered Results ({pagination.total})
          </Text>
          <Text style={styles.resultsSubtitle}>
            Showing {pagination.from}-{pagination.to} of {pagination.total} products
          </Text>
        </View>
        
        {vegetables.length > 0 ? (
          <View style={styles.productsGrid}>
            {vegetables.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              >
                <View style={styles.productImageContainer}>
                  {item.images && item.images.length > 0 ? (
                    <Text style={styles.productImagePlaceholder}>📦</Text>
                  ) : (
                    <Text style={styles.productImagePlaceholder}>🥬</Text>
                  )}
                </View>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{item.price_per_kg}/{item.unit_type}
                </Text>
                {item.is_organic === 1 && (
                  <View style={styles.organicBadge}>
                    <Text style={styles.organicText}>Organic</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Products Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your filters to see more results
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#019a34" barStyle="light-content" />
      
      <CommonHeader 
        screenName="Filter Products"
        showBackButton={true}
        onBackPress={handleBackPress}
        showNotification={false}
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <FilterSection title="Search">
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#019a34" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range">
          <PriceRangeInput />
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          <CategorySelector />
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location">
          <LocationSelector />
        </FilterSection>

        {/* Organic */}
        <FilterSection title="Organic Products">
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Show only organic products</Text>
            <Switch
              value={isOrganic}
              onValueChange={setIsOrganic}
              trackColor={{ false: '#e0e0e0', true: '#019a34' }}
              thumbColor={isOrganic ? '#fff' : '#f4f3f4'}
            />
          </View>
        </FilterSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearFilters}
          >
            <Icon name="times" size={16} color="#dc3545" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ResultsSection />
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
    paddingHorizontal: p(16),
  },

  // Filter Sections
  filterSection: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSectionTitle: {
    fontSize: fontSizes.md,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(12),
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: p(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },

  // Price Range
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: p(4),
  },
  priceLabel: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(4),
  },
  priceInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    paddingHorizontal: p(12),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
  },

  // Selectors
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: p(8),
  },
  selectorItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(20),
    paddingHorizontal: p(16),
    paddingVertical: p(8),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectorItemSelected: {
    backgroundColor: '#019a34',
    borderColor: '#019a34',
  },
  selectorItemText: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
  },
  selectorItemTextSelected: {
    color: '#fff',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: p(16),
    gap: p(12),
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: p(8),
    paddingVertical: p(12),
    borderWidth: 1,
    borderColor: '#dc3545',
    gap: p(8),
  },
  clearButtonText: {
    fontSize: fontSizes.sm,
    color: '#dc3545',
    fontFamily: 'Poppins-SemiBold',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#019a34',
    borderRadius: p(8),
    paddingVertical: p(12),
    gap: p(8),
  },
  applyButtonText: {
    fontSize: fontSizes.sm,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  // Results
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: p(12),
    padding: p(16),
    marginBottom: p(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsHeader: {
    marginBottom: p(16),
  },
  resultsTitle: {
    fontSize: fontSizes.md,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  resultsSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  productImageContainer: {
    height: p(80),
    backgroundColor: '#e9ecef',
    borderRadius: p(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: p(8),
  },
  productImagePlaceholder: {
    fontSize: p(24),
  },
  productName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(4),
  },
  productPrice: {
    fontSize: fontSizes.sm,
    color: '#019a34',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  organicBadge: {
    backgroundColor: '#d4edda',
    borderRadius: p(12),
    paddingHorizontal: p(8),
    paddingVertical: p(4),
    alignSelf: 'flex-start',
  },
  organicText: {
    fontSize: fontSizes.xs,
    color: '#28a745',
    fontFamily: 'Poppins-SemiBold',
  },

  // Skeleton
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
  },
  skeletonImage: {
    marginBottom: p(8),
  },
  skeletonTitle: {
    marginBottom: p(4),
  },
  skeletonRating: {
    marginBottom: p(4),
  },
  skeletonPrice: {
    marginBottom: p(4),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: p(32),
  },
  emptyStateTitle: {
    fontSize: fontSizes.md,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginTop: p(16),
    marginBottom: p(8),
  },
  emptyStateSubtitle: {
    fontSize: fontSizes.sm,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default FilterScreen;
