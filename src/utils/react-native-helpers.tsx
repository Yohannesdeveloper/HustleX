/**
 * React Native Helper Utilities
 * These utilities help convert web components to React Native equivalents
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Convert Tailwind classes to React Native styles
export const createStyles = (styles: any) => StyleSheet.create(styles);

// Platform check
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Navigation helper
export const useNav = () => {
  const navigation = useNavigation();
  return {
    navigate: (route: string, params?: any) => {
      navigation.navigate(route as never, params as never);
    },
    goBack: () => navigation.goBack(),
  };
};

// Component replacements
export const RNView = View;
export const RNText = Text;
export const RNTouchable = TouchableOpacity;
export const RNImage = Image;
export const RNTextInput = TextInput;
export const RNScrollView = ScrollView;

// Convert className string to style object (basic mapping)
export const twToStyle = (className: string, darkMode: boolean = false) => {
  const styles: any = {};
  
  // Basic Tailwind to React Native style mapping
  const mappings: { [key: string]: any } = {
    'flex': { display: 'flex' },
    'flex-row': { flexDirection: 'row' },
    'flex-col': { flexDirection: 'column' },
    'items-center': { alignItems: 'center' },
    'justify-center': { justifyContent: 'center' },
    'justify-between': { justifyContent: 'space-between' },
    'w-full': { width: '100%' },
    'h-full': { height: '100%' },
    'p-4': { padding: 16 },
    'px-4': { paddingHorizontal: 16 },
    'py-4': { paddingVertical: 16 },
    'm-4': { margin: 16 },
    'mx-4': { marginHorizontal: 16 },
    'my-4': { marginVertical: 16 },
    'rounded': { borderRadius: 4 },
    'rounded-lg': { borderRadius: 8 },
    'rounded-xl': { borderRadius: 12 },
    'bg-white': { backgroundColor: '#ffffff' },
    'bg-black': { backgroundColor: '#000000' },
    'text-white': { color: '#ffffff' },
    'text-black': { color: '#000000' },
    'text-center': { textAlign: 'center' },
    'font-bold': { fontWeight: 'bold' },
  };

  className.split(' ').forEach(cls => {
    if (mappings[cls]) {
      Object.assign(styles, mappings[cls]);
    }
  });

  return styles;
};

// Icon replacement helper
export const getIcon = (iconName: string, size: number = 24, color: string = '#000') => {
  // Use @expo/vector-icons or react-native-vector-icons
  // This is a placeholder - you'll need to map your react-icons to React Native icons
  return null;
};
