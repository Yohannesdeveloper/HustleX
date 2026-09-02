import React from 'react';
import { View, ViewStyle } from 'react-native';

interface PagerViewWrapperProps {
  style?: ViewStyle;
  initialPage?: number;
  onPageSelected?: (e: any) => void;
  ref?: any;
  children: React.ReactNode;
}

const PagerViewWrapper = React.forwardRef<any, PagerViewWrapperProps>(
  ({ style, children }, ref) => {
    return <View ref={ref} style={style}>{children}</View>;
  }
);

PagerViewWrapper.displayName = 'PagerViewWrapper';
export default PagerViewWrapper;
