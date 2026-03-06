# HustleX MongoDB Setup Guide

## Quick Start

### 1. Backend Setup

1. **Install MongoDB** (if not already installed):

   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas

2. **Create Backend Environment File**:

   ```bash
   cd backend
   ```

   Create a `.env` file with the following content:

   ```env
   MONGODB_URI=mongodb://localhost:27017/hustlex
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

3. **Start the Backend Server**:

   ```bash
   cd backend
   npm run dev
   ```

### 2. Frontend Setup

1. **Update Job Details Route** (Optional):
   To use the new MongoDB version, update your routing in `src/App.tsx`:

   ```tsx
   // Replace the existing job details route with:
   <Route path="/job-details/:jobId" element={<JobDetailsMongo />} />
   ```

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```

### 3. Test the Application

1. **Backend API**: http://localhost:5000
2. **Frontend**: http://localhost:5173

### 4. API Testing

You can test the API endpoints using the following:

#### Register a User:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"freelancer","firstName":"John","lastName":"Doe"}'
```

#### Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get Jobs:

```bash
curl -X GET http://localhost:5000/api/jobs
```

## Key Features Implemented

### ✅ Backend (MongoDB + Express.js)

- **Authentication**: JWT-based auth with registration/login
- **Job Management**: Full CRUD operations for jobs
- **Application System**: Submit and manage job applications
- **Security**: Rate limiting, CORS, input validation
- **Database Models**: User, Job, Application with proper relationships

### ✅ Frontend Integration

- **API Service**: Complete service layer for backend communication
- **Job Details Page**: New MongoDB-powered version (`JobDetailsMongo.tsx`)
- **Application Flow**: Submit applications with cover letter and CV
- **Authentication**: JWT token management
- **Error Handling**: Proper error handling and user feedback

### ✅ Application Features

- **Smart Apply Button**: Different states based on user role and application status
- **Application Form**: Cover letter and CV upload
- **Status Management**: Pending, In Review, Hired, Rejected
- **User Roles**: Freelancer, Client, Guest with appropriate permissions

## File Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Job.js               # Job model
│   └── Application.js       # Application model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── jobs.js              # Job management routes
│   └── applications.js      # Application routes
├── server.js                # Main server file
└── package.json             # Dependencies

src/
├── services/
│   └── api.ts               # API service for backend communication
└── Pages/
    └── JobDetailsMongo.tsx  # New MongoDB-powered job details page
```

## Next Steps

1. **File Upload**: Implement actual file upload for CVs
2. **Email Notifications**: Add email notifications for applications
3. **Real-time Updates**: Add WebSocket support for real-time updates
4. **Advanced Search**: Implement advanced job search and filtering
5. **Payment Integration**: Add payment processing for premium features

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env` file
- Verify MongoDB service is started

### CORS Issues

- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Check that both servers are running on correct ports

### Authentication Issues

- Verify JWT_SECRET is set in `.env`
- Check token expiration (currently 7 days)
- Ensure proper Authorization header format: `Bearer <token>`

## Support

For issues or questions:

1. Check the backend logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check network connectivity between frontend and backend
