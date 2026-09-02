# All Ways to Configure Backend URL

There are **3 different methods** to configure your hosted backend URL. Choose the one that works best for you!

## Method 1: app.json (Recommended - Simplest)

**Best for:** Quick setup, single backend URL

Edit `app.json`:

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": "https://your-backend-url.com"
    }
  }
}
```

**Pros:**
- ✅ Simple and straightforward
- ✅ Works immediately
- ✅ No extra files needed

**Cons:**
- ❌ Requires rebuild when changing
- ❌ Hardcoded in the app

---

## Method 2: Environment Variable (EXPO_PUBLIC_BACKEND_URL)

**Best for:** Different URLs for dev/staging/production

### Step 1: Create `.env` file in project root

```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Step 2: Update app.json to use it

```json
{
  "expo": {
    ...
    "extra": {
      "backendUrl": process.env.EXPO_PUBLIC_BACKEND_URL || null
    }
  }
}
```

**Note:** For Expo, you need to install `dotenv` and configure it, OR use EAS Build secrets.

### Alternative: Use EAS Build Secrets

For EAS Build, you can set environment variables in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BACKEND_URL": "https://your-backend-url.com"
      }
    }
  }
}
```

Then in `app.json`:
```json
"extra": {
  "EXPO_PUBLIC_BACKEND_URL": process.env.EXPO_PUBLIC_BACKEND_URL
}
```

**Pros:**
- ✅ Can have different URLs per environment
- ✅ Don't commit secrets to git
- ✅ Works with CI/CD

**Cons:**
- ❌ More setup required
- ❌ Need to configure EAS secrets or dotenv

---

## Method 3: Direct Code Modification (Not Recommended)

**Best for:** Quick testing, temporary changes

You can directly modify `src/utils/portDetector.ts`:

```typescript
export async function getBackendUrl(): Promise<string> {
  // Hardcode your URL here (temporary)
  const HOSTED_URL = "https://your-backend-url.com";
  if (HOSTED_URL) {
    return HOSTED_URL;
  }
  
  // ... rest of the code
}
```

**Pros:**
- ✅ Quick for testing

**Cons:**
- ❌ Not maintainable
- ❌ Easy to forget and commit
- ❌ Hard to change per environment

---

## Method 4: Runtime Configuration (Advanced)

**Best for:** Dynamic configuration, A/B testing, feature flags

Create a config service that can be updated:

```typescript
// src/config/backend.ts
export const BACKEND_CONFIG = {
  url: "https://your-backend-url.com",
  // Can be updated via remote config, etc.
};
```

Then use it in `portDetector.ts`.

**Pros:**
- ✅ Can update without rebuilding
- ✅ Supports remote configuration

**Cons:**
- ❌ More complex
- ❌ Requires additional infrastructure

---

## Which Method Should You Use?

### For Most Users: **Method 1 (app.json)**
- Simplest and works immediately
- Good for single backend URL
- Just edit and rebuild

### For Teams/Production: **Method 2 (Environment Variables)**
- Better for different environments
- More professional setup
- Works with CI/CD pipelines

### For Quick Testing: **Method 3 (Direct Code)**
- Fastest for temporary testing
- Remember to revert before committing!

---

## Current Implementation Priority

The app checks in this order:

1. ✅ `app.json` → `extra.backendUrl`
2. ✅ `app.json` → `extra.EXPO_PUBLIC_BACKEND_URL`
3. ✅ Auto-detect localhost IP (for development)
4. ✅ Fallback to localhost:5001

So **Method 1** (app.json) is already set up and ready to use!

---

## Quick Comparison

| Method | Setup Time | Flexibility | Best For |
|--------|-----------|-------------|----------|
| app.json | ⚡ Instant | Low | Single URL |
| Environment Var | 🕐 5 min | High | Multiple environments |
| Direct Code | ⚡ Instant | Low | Testing only |
| Runtime Config | 🕐 30 min | Very High | Advanced use cases |

---

## Recommendation

**Start with Method 1** (app.json). It's the simplest and works perfectly for most cases. You can always switch to Method 2 later if you need multiple environments.
