# Connecting Installed Mobile App to Backend

## Problem
When you install the app on a physical device, it can't connect to `localhost` because that refers to the device itself, not your computer where the backend is running.

## Solution: Use Your Computer's IP Address

### Step 1: Find Your Computer's IP Address

**Windows:**
1. Open Command Prompt or PowerShell
2. Run:
   ```bash
   ipconfig
   ```
3. Look for **IPv4 Address** under your active network adapter (usually Wi-Fi or Ethernet)
   - Example: `192.168.1.100` or `192.168.0.5`

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 2: Start the Backend Server

Make sure the backend is running on your computer:

```bash
cd backend
npm run dev
```

The backend should start on port 5001 (or check the console output).

### Step 3: Configure Backend for Network Access

The backend should already be configured to accept connections from your local network. Verify in `backend/server.js` that CORS allows your network IPs.

### Step 4: Update Mobile App Configuration

You have two options:

#### Option A: Use Environment Variable (Recommended)

Create or update a configuration file to set the backend URL:

1. **For Development/Testing:**
   - The app tries to auto-detect the IP from Expo
   - If that doesn't work, you may need to manually configure it

2. **Check if there's a config file:**
   - Look for `.env` or config files in the project root
   - Or check `src/utils/portDetector.ts` - it should auto-detect

#### Option B: Use Your Computer's IP Directly

If auto-detection doesn't work, you can temporarily hardcode it:

1. Find your computer's IP (from Step 1)
2. The app should detect it automatically via Expo Constants
3. If not, you may need to set it manually in the code

### Step 5: Ensure Same Network

**Important:** Your mobile device and computer must be on the same Wi-Fi network!

- ✅ Same Wi-Fi network = Works
- ❌ Different networks = Won't work
- ❌ Mobile data = Won't work (unless you use a tunneling service)

### Step 6: Test the Connection

1. **On your computer**, open a browser and go to:
   ```
   http://YOUR_IP_ADDRESS:5001/api
   ```
   Replace `YOUR_IP_ADDRESS` with your actual IP from Step 1.

2. **If you see a response**, the backend is accessible from the network ✅

3. **If you get an error**, check:
   - Windows Firewall might be blocking the port
   - Backend might not be running
   - Wrong IP address

## Troubleshooting

### Backend Not Accessible from Network

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js or allow port 5001

**Or via Command Prompt (as Administrator):**
```bash
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=5001
```

### App Still Can't Connect

1. **Check backend is running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify IP address:**
   - Make sure you're using the correct IP
   - Try accessing `http://YOUR_IP:5001/api` from your phone's browser

3. **Check network:**
   - Both devices on same Wi-Fi?
   - Try disconnecting and reconnecting

4. **Check backend logs:**
   - Look for connection attempts in the backend console
   - See if requests are reaching the server

### Alternative: Use ngrok (For Testing Across Networks)

If you need to test from a different network:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Create tunnel:**
   ```bash
   ngrok http 5001
   ```

4. **Use the ngrok URL** in your app configuration
   - Example: `https://abc123.ngrok.io`

## Quick Test

1. **Get your IP:** Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. **Start backend:** `cd backend && npm run dev`
3. **Test from phone browser:** `http://YOUR_IP:5001/api`
4. **If that works**, the app should be able to connect too!

## For Production

For a production app, you'll want to:
- Use a proper backend URL (not localhost)
- Deploy backend to a cloud service (Heroku, AWS, etc.)
- Use HTTPS
- Configure proper CORS and security

---

**Need help?** Check the backend console logs for connection attempts and errors.
