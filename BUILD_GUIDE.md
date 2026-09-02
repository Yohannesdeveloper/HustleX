# HustleX App Build Guide

This guide explains how to export and build your HustleX app for Android and iOS.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI**: `npm install -g expo-cli eas-cli`
3. **For Android builds**: Android Studio and Android SDK
4. **For iOS builds** (macOS only): Xcode and CocoaPods

## Option 1: Expo EAS Build (Recommended - Cloud Builds)

EAS Build is the modern way to build Expo apps. It builds your app in the cloud, so you don't need to set up native development environments.

### Setup

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account:**
   ```bash
   eas login
   ```
   (Create an account at https://expo.dev if you don't have one)

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

### Building for Android

#### Build APK (for direct installation):
```bash
npm run build:android:preview
```
or
```bash
eas build --platform android --profile preview
```

#### Build AAB (for Google Play Store):
```bash
npm run build:android
```
or
```bash
eas build --platform android --profile production
```

### Building for iOS

#### Build for Simulator:
```bash
npm run build:ios:preview
```
or
```bash
eas build --platform ios --profile preview
```

#### Build for App Store:
```bash
npm run build:ios
```
or
```bash
eas build --platform ios --profile production
```

### Building for Both Platforms

```bash
npm run build:all
```
or
```bash
eas build --platform all
```

### Downloading Your Build

After the build completes, you'll get a download link. You can also:
- View builds at: https://expo.dev/accounts/[your-account]/projects/hustlex/builds
- Download via CLI: `eas build:list` then `eas build:download [build-id]`

## Option 2: Local Capacitor Builds

If you prefer to build locally using Capacitor:

### Setup

1. **Install Capacitor CLI:**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Sync Capacitor:**
   ```bash
   npm run capacitor:sync
   ```

### Building for Android Locally

1. **Open Android Studio:**
   ```bash
   npm run capacitor:android
   ```
   or manually: Open `android` folder in Android Studio

2. **Build APK:**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or via command line:
     ```bash
     npm run build:android:local
     ```
   - APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

3. **Build AAB (for Play Store):**
   - In Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle
   - Or via command line:
     ```bash
     cd android && ./gradlew bundleRelease
     ```
   - AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Building for iOS Locally (macOS only)

1. **Install CocoaPods dependencies:**
   ```bash
   cd ios/App/App
   pod install
   cd ../../..
   ```

2. **Open Xcode:**
   ```bash
   npm run capacitor:ios
   ```
   or manually: Open `ios/App/App.xcworkspace` in Xcode

3. **Build in Xcode:**
   - Select your device or simulator
   - Product → Archive (for App Store)
   - Or Product → Build (for testing)

4. **Via Command Line:**
   ```bash
   npm run build:ios:local
   ```

## Option 3: Development Builds

For testing during development:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## App Configuration

### Update App Details

Edit `app.json` to customize:
- App name
- Version number
- Bundle identifier (iOS) / Package name (Android)
- Icons and splash screens

### Signing

#### Android:
- For local builds: Create a keystore file
- For EAS builds: EAS handles signing automatically (or you can provide your own keystore)

#### iOS:
- For local builds: Configure in Xcode (Signing & Capabilities)
- For EAS builds: EAS handles signing automatically (or you can provide your own certificates)

## Publishing to Stores

### Google Play Store

1. Build AAB using EAS or locally
2. Go to Google Play Console
3. Create new app or update existing
4. Upload the AAB file
5. Fill in store listing details
6. Submit for review

### Apple App Store

1. Build using EAS or Xcode Archive
2. Upload via Xcode or EAS Submit:
   ```bash
   eas submit --platform ios
   ```
3. Go to App Store Connect
4. Create new app or update existing
5. Submit for review

## Troubleshooting

### Common Issues

1. **Build fails with dependency errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Clear cache: `expo start -c`

2. **Android build fails:**
   - Ensure Android SDK is properly installed
   - Check `android/build.gradle` for correct SDK versions

3. **iOS build fails:**
   - Run `pod install` in `ios/App/App` directory
   - Ensure Xcode and Command Line Tools are up to date

4. **EAS build fails:**
   - Check your `eas.json` configuration
   - Verify your Expo account has build credits
   - Check build logs at expo.dev

## Next Steps

1. **Test your build** on a physical device before publishing
2. **Update version numbers** in `app.json` for each release
3. **Prepare store assets** (screenshots, descriptions, etc.)
4. **Set up app signing** for production releases

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
