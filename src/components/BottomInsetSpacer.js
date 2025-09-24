import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * BottomInsetSpacer component
 * 
 * A reusable component that adds bottom safe area spacing.
 * Use this component at the end of any fixed bottom area (like custom bottom bars)
 * to ensure content doesn't get hidden behind system navigation controls.
 * 
 * @param {Object} props - Component props
 * @param {number} [props.minHeight=8] - Minimum height when no system bar is present
 * @param {Object} [props.style] - Additional styles to apply
 * @returns {JSX.Element} BottomInsetSpacer component
 */
const BottomInsetSpacer = ({ minHeight = 8, style }) => {
  const { bottom } = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        { 
          height: Math.max(bottom, minHeight) 
        }, 
        style
      ]} 
    />
  );
};

export default BottomInsetSpacer;
