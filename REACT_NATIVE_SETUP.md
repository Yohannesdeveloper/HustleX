# React Native Conversion Setup Instructions

## Step 1: Install Dependencies

```bash
# Backup your current package.json
cp package.json package-web.json

# Replace with React Native version
cp package-react-native.json package.json

# Install dependencies
npm install

# Install additional required packages
npm install @react-native-async-storage/async-storage
npm install react-native-safe-area-context
npm install react-native-gesture-handler
npm install react-native-reanimated
```

## Step 2: Initialize Expo

```bash
npx expo install --fix
```

## Step 3: Update TypeScript Config

```bash
cp tsconfig-react-native.json tsconfig.json
```

## Step 4: Create Entry Point

Create `App.tsx` in root:

```typescript
import AppNavigator from './src/navigation/AppNavigator';

export default AppNavigator;
```

## Step 5: Conversion Process

### A. Convert Components Systematically

For each component in `src/components/`:
1. Replace HTML elements with React Native components
2. Convert Tailwind classes to StyleSheet
3. Replace `react-router-dom` navigation with `@react-navigation/native`
4. Update image imports
5. Handle file uploads with expo pickers

### B. Convert Pages to Screens

1. Rename `src/Pages/` to `src/screens/`
2. Convert each page following the same pattern as components
3. Update navigation references

### C. Update Store

1. Use `src/store/index-react-native.ts` instead of `src/store/index.ts`
2. Replace `localStorage` with `AsyncStorage`

## Step 6: Run the App

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android

# Run on Web (React Native Web)
npm run web
```

## Conversion Priority

1. ✅ Core navigation setup
2. ✅ Store configuration
3. ⏳ HomeFinal screen (main landing page)
4. ⏳ HomeNavbar component
5. ⏳ Signup/Login screens
6. ⏳ Dashboard screens
7. ⏳ Job listing screens
8. ⏳ Chat interface
9. ⏳ All other screens

## Important Notes

- **Styling**: React Native doesn't support CSS. All styles must be converted to StyleSheet
- **Images**: Use `require()` or `expo-asset` for local images
- **Navigation**: Use React Navigation hooks instead of React Router
- **Platform**: Use `Platform.OS` for platform-specific code
- **Animations**: Framer Motion works with React Native Web, but use `react-native-reanimated` for native animations

## Testing Checklist

- [ ] App launches on iOS
- [ ] App launches on Android  
- [ ] App works on Web (React Native Web)
- [ ] Navigation works correctly
- [ ] Redux store persists data
- [ ] API calls work
- [ ] WebSocket connections work
- [ ] File uploads work
- [ ] Images display correctly
- [ ] Dark mode works
- [ ] Language switching works
- [ ] All forms submit correctly
