# React Native Conversion Guide for HustleX

## Overview
This guide documents the conversion from React Web to React Native while maintaining 100% UI/UX parity.

## Key Conversion Rules

### 1. Component Replacements
- `<div>` → `<View>`
- `<span>`, `<p>`, `<h1-h6>` → `<Text>`
- `<img>` → `<Image>` from `react-native`
- `<input>` → `<TextInput>`
- `<button>` → `<TouchableOpacity>` or `<Pressable>`
- `<a>` → `<TouchableOpacity>` with navigation
- `<ul>`, `<ol>`, `<li>` → `<View>` with `<Text>`

### 2. Styling Conversion
- Tailwind classes → React Native StyleSheet
- CSS properties → React Native style properties
- `className` → `style` prop

### 3. Navigation
- `react-router-dom` → `@react-navigation/native`
- `<Link>` → `navigation.navigate()`
- `useNavigate()` → `useNavigation()` hook

### 4. Platform-Specific Code
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code
} else {
  // Mobile-specific code
}
```

### 5. File Handling
- File uploads: Use `expo-image-picker` or `expo-document-picker`
- Images: Use `expo-asset` for bundled assets

### 6. WebSocket
- Socket.io works the same way in React Native
- No changes needed for WebSocket logic

## Conversion Checklist

- [ ] Convert all HTML elements to React Native components
- [ ] Convert all Tailwind classes to StyleSheet
- [ ] Replace React Router with React Navigation
- [ ] Update image imports to use require() or expo-asset
- [ ] Convert file uploads to use expo pickers
- [ ] Test all navigation flows
- [ ] Test all API calls
- [ ] Test WebSocket connections
- [ ] Test file uploads/downloads
- [ ] Verify all animations work
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on web (React Native Web)

## File Structure
```
src/
├── navigation/        # React Navigation setup
├── components/       # Converted components
├── screens/          # Converted pages (renamed from Pages)
├── styles/          # StyleSheet files
├── utils/           # Utilities (mostly unchanged)
├── services/        # API services (mostly unchanged)
└── store/           # Redux store (unchanged)
```
