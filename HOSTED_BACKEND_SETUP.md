# Configure App to Use Hosted Backend

This guide shows you how to configure your mobile app to connect to a hosted backend server instead of localhost.

## Step 1: Get Your Hosted Backend URL

Your backend should be hosted on a service like:
- **Heroku**: `https://your-app.herokuapp.com`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`
- **AWS/Google Cloud/Azure**: Your custom domain
- **Any VPS/Server**: `https://your-domain.com` or `http://your-ip:port`

**Important:** Make sure your backend URL:
- ✅ Is accessible from the internet (not localhost)
- ✅ Uses HTTPS if possible (more secure)
- ✅ Has CORS configured to allow your app

## Step 2: Configure the App

### Option A: Update app.json (Recommended)

Edit `app.json` and set your hosted backend URL:

```json
{
  "expo": {
    ...
    "extra": {
      "eas": {
        "projectId": "3e351fc0-c8bb-4f3b-9afe-22f0cb85607d"
      },
      "backendUrl": "https://your-backend-url.com"
    }
  }
}
```

**Example:**
```json
"backendUrl": "https://hustlex-api.herokuapp.com"
```

### Option B: Use Environment Variable

You can also use an environment variable. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

Then update `app.json`:

```json
"extra": {
  "backendUrl": process.env.EXPO_PUBLIC_BACKEND_URL || null
}
```

## Step 3: Update Backend CORS Settings

Make sure your hosted backend allows requests from your mobile app.

In `backend/server.js`, update CORS to allow your app:

```javascript
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  // Add your app's origins if needed
  /^https?:\/\/.*$/, // Allow all HTTPS/HTTP (for mobile apps)
];
```

For production, you might want to be more specific, but mobile apps typically don't send an Origin header, so the backend should handle that.

## Step 4: Build the App with Hosted Backend

### For Android:

```bash
# Make sure app.json has your backend URL set
npm run build:android:preview
```

Or for production:

```bash
npm run build:android
```

### For iOS:

```bash
npm run build:ios:preview
```

Or for production:

```bash
npm run build:ios
```

## Step 5: Verify Configuration

After building, the app will:
1. ✅ First check for `backendUrl` in app.json
2. ✅ If found, use that hosted URL
3. ✅ If not found, fall back to localhost detection (for development)

## Testing

### Test Backend is Accessible

Before building, test your backend URL:

```bash
# Test from command line
curl https://your-backend-url.com/api

# Or open in browser
https://your-backend-url.com/api
```

You should see a JSON response.

### Test from App

After installing the built app:
1. Open the app
2. Try to login or fetch data
3. Check app logs/console for backend connection
4. Should connect to your hosted URL automatically

## Example Configuration

### app.json with Heroku Backend:

```json
{
  "expo": {
    "name": "HustleX",
    "slug": "hustlex",
    "version": "1.0.0",
    ...
    "extra": {
      "eas": {
        "projectId": "3e351fc0-c8bb-4f3b-9afe-22f0cb85607d"
      },
      "backendUrl": "https://hustlex-api.herokuapp.com"
    }
  }
}
```

### app.json with Custom Domain:

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "https://api.hustlexet.com"
    }
  }
}
```

## Troubleshooting

### App Still Uses Localhost

1. ✅ Check `app.json` has `backendUrl` set correctly
2. ✅ Rebuild the app (configuration is baked into the build)
3. ✅ Check for typos in the URL
4. ✅ Make sure URL doesn't have trailing slash: `https://api.com` not `https://api.com/`

### Backend Not Accessible

1. ✅ Test backend URL in browser/Postman
2. ✅ Check backend is running and deployed
3. ✅ Verify CORS settings allow mobile apps
4. ✅ Check backend logs for connection attempts

### Connection Errors

- **Network Error**: Backend might be down or URL incorrect
- **CORS Error**: Backend CORS not configured for mobile apps
- **404 Error**: Backend URL might be missing `/api` path (app adds it automatically)

## Development vs Production

### Development (Local Testing)
- Leave `backendUrl` as `null` in `app.json`
- App will auto-detect localhost IP
- Works when testing on same network

### Production (Hosted Backend)
- Set `backendUrl` to your hosted URL
- Rebuild the app
- App will use hosted URL everywhere

## Quick Setup Script

1. **Edit `app.json`**:
   ```json
   "backendUrl": "YOUR_HOSTED_BACKEND_URL_HERE"
   ```

2. **Build the app**:
   ```bash
   npm run build:android:preview
   ```

3. **Install and test**:
   - Download the APK
   - Install on device
   - App should connect to hosted backend automatically

---

**That's it!** Once you set `backendUrl` in `app.json` and rebuild, your app will use the hosted backend.
