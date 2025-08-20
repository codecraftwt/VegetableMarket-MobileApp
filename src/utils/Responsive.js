import { Dimensions, Platform } from 'react-native';

// Base design dimensions (iPhone 14 Pro)
const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

// Get initial dimensions
let screen = Dimensions.get('window');

// Update on rotation/resize
Dimensions.addEventListener('change', ({ window }) => {
  screen = window;
});

/**
 * Perfect unified scaling function
 * @param {number} size - Original size in design (points)
 * @returns {number} - Responsive size in device pixels
 */
export const p = (size) => {
  // Calculate ratios
  const widthRatio = screen.width / guidelineBaseWidth;
  const heightRatio = screen.height / guidelineBaseHeight;
  
  // Calculate geometric mean (most balanced scaling)
  const ratio = Math.sqrt(widthRatio * heightRatio);
  
  // Apply scaling with base adjustment
  let scaledSize = size * ratio;
  
  // Tablet detection and adjustment
  const isTablet = Math.min(screen.width, screen.height) >= 600;
  if (isTablet) {
    scaledSize *= 0.92; // Reduce size slightly on tablets
  }
  
  // Apply reasonable scaling limits
  const minScale = 0.85; // Minimum scaling factor
  const maxScale = 1.25; // Maximum scaling factor
  scaledSize = Math.max(
    minScale * size,
    Math.min(maxScale * size, scaledSize)
  );
  
  // Round to nearest pixel
  const pixelSize = Math.round(scaledSize);
  
  // Special handling for 1px borders
  if (size === 1 && pixelSize < 1) {
    return Platform.select({
      ios: 0.33,
      android: 0.5,
      default: 1
    });
  }
  
  return pixelSize;
};