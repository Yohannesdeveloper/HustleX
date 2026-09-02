# Quick Setup: Use Hosted Backend in Your App

## 3 Simple Steps

### 1. Edit `app.json`

Find the `extra` section and set your backend URL:

```json
"extra": {
  "eas": {
    "projectId": "3e351fc0-c8bb-4f3b-9afe-22f0cb85607d"
  },
  "backendUrl": "https://your-backend-url.com"
}
```

**Example:**
```json
"backendUrl": "https://hustlex-api.herokuapp.com"
```

### 2. Rebuild the App

```bash
# For Android APK
npm run build:android:preview

# For Android AAB (Play Store)
npm run build:android

# For iOS
npm run build:ios:preview
```

### 3. Install and Test

- Download the built app
- Install on your device
- The app will automatically use your hosted backend! ✅

## Important Notes

- ✅ **No trailing slash**: Use `https://api.com` not `https://api.com/`
- ✅ **Use HTTPS** if possible (more secure)
- ✅ **Rebuild required**: Changes to `app.json` need a new build
- ✅ **Backend must be accessible**: Test URL in browser first

## Example URLs

- Heroku: `https://my-app.herokuapp.com`
- Railway: `https://my-app.railway.app`
- Render: `https://my-app.onrender.com`
- Custom domain: `https://api.mydomain.com`
- VPS with IP: `http://123.45.67.89:5001` (use HTTPS if possible)

## Testing

Before building, test your backend:

```bash
curl https://your-backend-url.com/api
```

Should return JSON. If it works, your app will work too!

---

**That's it!** Set the URL, rebuild, and install. The app will use your hosted backend automatically.
