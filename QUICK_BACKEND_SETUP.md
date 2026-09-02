# Quick Backend Setup for Mobile App

## Your Computer's IP Address
Based on your network, your IP is likely: **192.168.1.2**

## Quick Steps

### 1. Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5001
```

### 2. Test from Your Phone

**On your phone's browser**, try:
```
http://192.168.1.2:5001/api
```

If you see a JSON response, the backend is accessible! ✅

### 3. Ensure Same Network

- ✅ Your phone and computer must be on the **same Wi-Fi network**
- ❌ Mobile data won't work
- ❌ Different Wi-Fi networks won't work

### 4. Windows Firewall (If Step 2 Fails)

If you can't access from your phone, allow the port through Windows Firewall:

**Option A: Via Settings**
1. Open Windows Security
2. Firewall & network protection
3. Allow an app through firewall
4. Add Node.js or allow port 5001

**Option B: Via Command (Run as Administrator)**
```bash
netsh advfirewall firewall add rule name="HustleX Backend" dir=in action=allow protocol=TCP localport=5001
```

## How the App Connects

The mobile app automatically detects your computer's IP address through Expo. It should work automatically if:
- ✅ Backend is running
- ✅ Both devices on same network
- ✅ Firewall allows connections

## Troubleshooting

### "Cannot connect to backend"
1. ✅ Backend running? Check terminal
2. ✅ Same Wi-Fi network?
3. ✅ Firewall blocking? (see above)
4. ✅ Try accessing `http://192.168.1.2:5001/api` from phone browser

### Backend shows "MongoDB Disconnected"
- The backend will still run, but database features won't work
- Make sure MongoDB is installed and running
- Or use MongoDB Atlas (cloud)

### Still Not Working?

1. **Check backend port:**
   - Look at backend console output
   - It might be on port 5002, 5003, etc. if 5001 is busy

2. **Verify IP address:**
   ```bash
   ipconfig
   ```
   Look for the IP under your active Wi-Fi adapter

3. **Test connection:**
   - From phone browser: `http://YOUR_IP:PORT/api`
   - Should return JSON with status

---

**Current Backend Port:** Check `port.json` or backend console
**Your IP:** 192.168.1.2 (or check with `ipconfig`)
