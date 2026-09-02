# Quick Build Steps - Apply Now

## Step 1: Login to Expo (Required)

Run this command in your terminal:
```bash
eas login
```

You'll be prompted to:
- Enter your email/username (or create a new account at https://expo.dev)
- Enter your password

## Step 2: Build Your App

### For Android APK (for direct installation):
```bash
npm run build:android:preview
```

### For Android AAB (for Google Play Store):
```bash
npm run build:android
```

### For iOS:
```bash
npm run build:ios:preview
```

## Step 3: Download Your Build

After the build completes (usually 10-20 minutes), you'll get a download link. You can also:
- Check your builds at: https://expo.dev
- Download via: `eas build:list` then `eas build:download [build-id]`

## Alternative: Local Build (No Login Required)

If you prefer to build locally without Expo account:

### Android:
1. Open Android Studio
2. Open the `android` folder
3. Build → Build Bundle(s) / APK(s) → Build APK(s)

### iOS (macOS only):
1. Open Xcode
2. Open `ios/App/App.xcworkspace`
3. Product → Archive

---

**Note:** The EAS build method is recommended as it's easier and doesn't require setting up native development environments.
