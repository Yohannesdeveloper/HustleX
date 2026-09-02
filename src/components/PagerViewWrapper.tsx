import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';

let PagerViewNative: any = View;
if (Platform.OS !== 'web') {
  try {
    PagerViewNative = require('react-native-pager-view').default;
  } catch (e) {
    // fallback to View
  }
}

interface PagerViewWrapperProps {
  style?: ViewStyle;
  initialPage?: number;
  onPageSelected?: (e: any) => void;
  ref?: any;
  children: React.ReactNode;
}

const PagerViewWrapper = React.forwardRef<any, PagerViewWrapperProps>(
  ({ style, children, initialPage, onPageSelected }, ref) => {
    if (Platform.OS !== 'web' && PagerViewNative !== View) {
      return (
        <PagerViewNative
          ref={ref}
          style={style}
          initialPage={initialPage}
          onPageSelected={onPageSelected}
        >
          {children}
        </PagerViewNative>
      );
    }

    return <View style={style}>{children}</View>;
  }
);

PagerViewWrapper.displayName = 'PagerViewWrapper';
export default PagerViewWrapper;
