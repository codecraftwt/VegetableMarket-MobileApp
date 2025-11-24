// Font configuration for the Vegetable Market app
export const fonts = {
  // Montserrat Font Family
  'Montserrat-Regular': 'Montserrat-Regular',
  'Montserrat-Medium': 'Montserrat-Regular',
  'Montserrat-SemiBold': 'Montserrat-SemiBold',
  'Montserrat-Bold': 'Montserrat-Bold',
  
  // Poppins Font Family
  'Poppins-Regular': 'Poppins-Regular',
  'Poppins-Medium': 'Poppins-Regular',
  'Poppins-SemiBold': 'Poppins-SemiBold',
  'Poppins-Bold': 'Poppins-Bold',
  
  // Rubik Font Family
  'Rubik-Regular': 'Rubik-Regular',
  'Rubik-Medium': 'Rubik-Regular',
  'Rubik-SemiBold': 'Rubik-SemiBold',
  'Rubik-Bold': 'Rubik-Bold',
  
  // Intrepid Font Family
  'Intrepid': 'Intrepid',
};

// Font weights for fallback
export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// Font sizes for consistent typography
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 48,
};

// Helper function to get font family with fallback
export const getFontFamily = (fontName) => {
  return fonts[fontName] || 'System';
};

// Helper function to get font with weight
export const getFont = (fontName, weight = 'regular') => {
  const family = getFontFamily(fontName);
  return {
    fontFamily: family,
    fontWeight: fontWeights[weight],
  };
};
