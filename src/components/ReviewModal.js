import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { p } from '../utils/Responsive';
import { fontSizes } from '../utils/fonts';

const ReviewModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  order, 
  loading = false 
}) => {
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [farmerRatings, setFarmerRatings] = useState({});
  const [farmerComments, setFarmerComments] = useState({});

  // Initialize farmer ratings and comments when order changes
  useEffect(() => {
    if (order && order.items) {
      const initialRatings = {};
      const initialComments = {};
      
      order.items.forEach(item => {
        if (item.farmer && item.farmer.id) {
          initialRatings[item.farmer.id] = 0;
          initialComments[item.farmer.id] = '';
        }
      });
      
      setFarmerRatings(initialRatings);
      setFarmerComments(initialComments);
    }
  }, [order]);

  const handleSubmit = () => {
    // Validate ratings
    if (deliveryRating === 0) {
      Alert.alert('Error', 'Please rate the delivery service');
      return;
    }

    const hasFarmerRating = Object.values(farmerRatings).some(rating => rating > 0);
    if (!hasFarmerRating) {
      Alert.alert('Error', 'Please rate at least one farmer');
      return;
    }

    // Prepare review data
    const reviewData = {
      delivery_boy_id: order.delivery_boy_id || 6, // Default value if not provided
      delivery_rating: deliveryRating,
      delivery_comment: deliveryComment.trim() || 'Good delivery service',
      farmers: {}
    };

    // Add farmer ratings and comments
    Object.keys(farmerRatings).forEach(farmerId => {
      if (farmerRatings[farmerId] > 0) {
        reviewData.farmers[farmerId] = {
          rating: farmerRatings[farmerId],
          comment: farmerComments[farmerId] || 'Good quality produce'
        };
      }
    });

    onSubmit(reviewData);
  };

  const handleClose = () => {
    // Reset form
    setDeliveryRating(0);
    setDeliveryComment('');
    setFarmerRatings({});
    setFarmerComments({});
    onClose();
  };

  const renderStars = (rating, onRatingChange, size = 20) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-o'}
              size={size}
              color={star <= rating ? '#FFD700' : '#ccc'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Submit Review</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Delivery Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Service Rating</Text>
              {renderStars(deliveryRating, setDeliveryRating, 24)}
              <TextInput
                style={styles.commentInput}
                placeholder="Comment about delivery service (optional)"
                value={deliveryComment}
                onChangeText={setDeliveryComment}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Farmer Ratings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer Ratings</Text>
              {order.items.map((item, index) => {
                if (!item.farmer || !item.farmer.id) return null;
                
                const farmerId = item.farmer.id;
                const farmerRating = farmerRatings[farmerId] || 0;
                const farmerComment = farmerComments[farmerId] || '';

                return (
                  <View key={index} style={styles.farmerRatingItem}>
                    <Text style={styles.farmerName}>{item.farmer.name}</Text>
                    <Text style={styles.itemName}>{item.vegetable_name}</Text>
                    {renderStars(farmerRating, (rating) => 
                      setFarmerRatings(prev => ({ ...prev, [farmerId]: rating }))
                    )}
                    <TextInput
                      style={styles.commentInput}
                      placeholder={`Comment about ${item.farmer.name}'s produce (optional)`}
                      value={farmerComment}
                      onChangeText={(comment) => 
                        setFarmerComments(prev => ({ ...prev, [farmerId]: comment }))
                      }
                      multiline
                      numberOfLines={2}
                      maxLength={150}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Icon name="paper-plane" size={16} color="#fff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: p(8),
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: p(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: fontSizes.base,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    padding: p(4),
  },
  content: {
    padding: p(16),
  },
  section: {
    marginBottom: p(20),
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: p(12),
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: p(12),
  },
  starButton: {
    marginRight: p(6),
    padding: p(2),
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: p(8),
    padding: p(10),
    fontSize: fontSizes.xs,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#f9f9f9',
    minHeight: p(32),
  },
  farmerRatingItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: p(8),
    padding: p(12),
    marginBottom: p(12),
  },
  farmerName: {
    fontSize: fontSizes.sm,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Bold',
    marginBottom: p(4),
  },
  itemName: {
    fontSize: fontSizes.xs,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: p(8),
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#019a34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: p(12),
    margin: p(16),
    borderRadius: p(8),
    gap: p(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins-Bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default ReviewModal;
