# Backend Setup & Running Guide

## Quick Start

### Option 1: Using the Batch Script (Windows)
```bash
start-server.bat
```

### Option 2: Manual Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Create `.env` file** (if it doesn't exist):
   ```bash
   # Create .env file in backend directory
   ```
   
   Add these variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hustlex
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

4. **Start the server:**

   **Development mode (with auto-restart):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

## Prerequisites

### 1. MongoDB Setup

You need MongoDB running. Choose one:

**Option A: Local MongoDB**
- Install MongoDB locally
- Make sure it's running on `mongodb://localhost:27017`
- The default connection string is: `mongodb://localhost:27017/hustlex`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env`:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hustlex
  ```

### 2. Node.js
- Make sure Node.js (v14 or higher) is installed
- Check with: `node --version`

## Running the Server

### Development Mode (Recommended)
```bash
cd backend
npm run dev
```

This uses **nodemon** which automatically restarts the server when you make changes.

### Production Mode
```bash
cd backend
npm start
```

## Server Information

- **Default Port:** 5000
- **URL:** http://localhost:5000
- **API Base:** http://localhost:5000/api

The server will automatically find an available port if 5000 is in use.

## API Endpoints

Once running, you can access:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Create job (auth required)
- `PUT /api/jobs/:id` - Update job (auth required)
- `DELETE /api/jobs/:id` - Delete job (auth required)

### Applications
- `POST /api/applications` - Submit application (auth required)
- `GET /api/applications/my-applications` - Get user's applications

### Other Endpoints
- `/api/users` - User management
- `/api/messages` - Messaging system
- `/api/companies` - Company management
- `/api/blogs` - Blog posts
- `/api/chatbot` - Chatbot integration
- `/api/statistics` - Statistics
- `/api/pricing` - Pricing information

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, the server will automatically try to find another port. Check the console output for the actual port number.

### MongoDB Connection Issues
1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or check MongoDB service
   ```

2. **Verify connection string in `.env`**

3. **Check MongoDB logs** for connection errors

4. **For MongoDB Atlas:**
   - Ensure your IP is whitelisted
   - Check username/password are correct
   - Verify network access settings

### Dependencies Not Installed
```bash
cd backend
npm install
```

### Environment Variables Not Loading
- Make sure `.env` file is in the `backend` directory
- Restart the server after creating/updating `.env`

## Development Tips

1. **Watch Mode:** Use `npm run dev` for auto-restart on file changes
2. **Logs:** Check console for connection status and errors
3. **Socket.IO:** The server also runs a Socket.IO server for real-time features
4. **File Uploads:** Uploads are stored in `backend/uploads/` directory

## Testing the Server

Once running, test with:

```bash
# Health check
curl http://localhost:5000/api

# Or open in browser
http://localhost:5000/api
```

## Next Steps

1. ✅ Backend server running
2. ✅ Start your frontend/mobile app
3. ✅ Configure API URL in your app to point to `http://localhost:5000`

---

**Need help?** Check the `backend/README.md` for more detailed documentation.
