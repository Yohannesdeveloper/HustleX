# 🚀 HustleX API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Jobs](#jobs-endpoints)
3. [Applications](#applications-endpoints)
4. [Users](#users-endpoints)
5. [Companies](#companies-endpoints)
6. [Blogs](#blogs-endpoints)
7. [Messages](#messages-endpoints)
8. [Notifications](#notifications-endpoints)
9. [Upload](#upload-endpoints)
10. [Contact](#contact-endpoints)
11. [Chatbot](#chatbot-endpoints)
12. [Statistics](#statistics-endpoints)
13. [Pricing](#pricing-endpoints)

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "freelancer" | "client",
  "roles": ["freelancer", "client"]
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "roles": ["freelancer"]
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": { ... }
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 💼 Jobs Endpoints

### Get All Jobs
```http
GET /api/jobs?page=1&limit=10&category=Web Development&search=react&jobType=Full-time&workLocation=Remote&sortBy=budget
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `search` - Search in title/description
- `jobType` - Full-time, Part-time, Contract, etc.
- `workLocation` - Remote, On-site, Hybrid
- `sortBy` - Sort by: budget, createdAt, etc.

**Response:**
```json
{
  "jobs": [...],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Get Single Job
```http
GET /api/jobs/:jobId
```

### Get User's Posted Jobs
```http
GET /api/jobs/user/my-jobs
Authorization: Bearer <token>
```

### Create Job
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React Developer Needed",
  "description": "We need an experienced React developer...",
  "category": "Web Development",
  "budget": "50000",
  "jobType": "Full-time",
  "workLocation": "Remote",
  "skills": ["React", "TypeScript", "Node.js"],
  "deadline": "2025-02-01",
  "experienceLevel": "Mid-level"
}
```

### Update Job
```http
PUT /api/jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  ...
}
```

### Delete Job
```http
DELETE /api/jobs/:jobId
Authorization: Bearer <token>
```

### Approve Job (Admin)
```http
PUT /api/jobs/:jobId/approve
Authorization: Bearer <admin-token>
```

### Reject Job (Admin)
```http
PUT /api/jobs/:jobId/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

---

## 📝 Applications Endpoints

### Get All Applications
```http
GET /api/applications?jobId=xxx&freelancerId=xxx&status=pending
Authorization: Bearer <token>
```

### Get Single Application
```http
GET /api/applications/:applicationId
Authorization: Bearer <token>
```

### Create Application
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "job-id-here",
  "coverLetter": "I am interested in this position...",
  "proposedRate": "40000",
  "estimatedTime": "2 weeks"
}
```

### Update Application Status
```http
PUT /api/applications/:applicationId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted" | "rejected" | "pending"
}
```

### Delete Application
```http
DELETE /api/applications/:applicationId
Authorization: Bearer <token>
```

---

## 👤 Users Endpoints

### Get User Profile
```http
GET /api/users/:userId
```

### Update User Profile
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Experienced developer...",
    "skills": ["React", "Node.js"],
    "location": "Addis Ababa",
    "phone": "+251911234567"
  }
}
```

### Get All Users
```http
GET /api/users?role=freelancer&search=react&page=1&limit=10
```

### Get Freelancers
```http
GET /api/users/freelancers?skills=React&location=Addis Ababa&experienceLevel=Senior
```

---

## 🏢 Companies Endpoints

### Get All Companies
```http
GET /api/companies
```

### Get Single Company
```http
GET /api/companies/:companyId
```

### Create Company
```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Solutions Inc",
  "description": "Leading tech company...",
  "industry": "Technology",
  "website": "https://example.com",
  "location": "Addis Ababa"
}
```

### Update Company
```http
PUT /api/companies/:companyId
Authorization: Bearer <token>
```

---

## 📰 Blogs Endpoints

### Get All Blogs
```http
GET /api/blogs?page=1&limit=10&category=Technology&search=react
```

### Get Single Blog
```http
GET /api/blogs/:id
```

### Create Blog
```http
POST /api/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blog Title",
  "content": "Blog content here...",
  "category": "Technology",
  "readTime": "5 min",
  "imageUrl": "image-url"
}
```

### Update Blog
```http
PUT /api/blogs/:id
Authorization: Bearer <token>
```

### Delete Blog
```http
DELETE /api/blogs/:id
Authorization: Bearer <token>
```

---

## 💬 Messages Endpoints

### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

### Get Messages
```http
GET /api/messages/:conversationId
Authorization: Bearer <token>
```

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "user-id",
  "message": "Hello!",
  "conversationId": "conversation-id"
}
```

**Note:** Messages are also handled via WebSocket (Socket.IO)

---

## 🔔 Notifications Endpoints

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <token>
```

---

## 📤 Upload Endpoints

### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
type: "avatar" | "cv" | "portfolio" | "job-image" | "blog-image"
```

**Response:**
```json
{
  "url": "/uploads/filename.jpg",
  "filename": "filename.jpg"
}
```

---

## 📧 Contact Endpoints

### Send Contact Message
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question..."
}
```

---

## 🤖 Chatbot Endpoints

### Chat with AI
```http
POST /api/chatbot/chat
Content-Type: application/json

{
  "message": "What is HustleX?",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "Hello"
    },
    {
      "sender": "bot",
      "text": "Hi! How can I help?"
    }
  ]
}
```

**Response:**
```json
{
  "response": "HustleX is a freelancing platform..."
}
```

---

## 📊 Statistics Endpoints

### Get Platform Statistics
```http
GET /api/statistics
```

**Response:**
```json
{
  "totalJobs": 1500,
  "totalFreelancers": 5000,
  "totalClients": 800,
  "totalApplications": 12000,
  "activeJobs": 300,
  "completedJobs": 1200
}
```

### Get User Statistics
```http
GET /api/statistics/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "postedJobs": 10,
  "applications": 25,
  "acceptedApplications": 5,
  "completedJobs": 3
}
```

---

## 💳 Pricing Endpoints

### Get Pricing Plans
```http
GET /api/pricing/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free Trial",
      "price": 0,
      "currency": "ETB",
      "period": "forever",
      "features": [...]
    },
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 999,
      "currency": "ETB",
      "period": "per month",
      "features": [...]
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 9999,
      "currency": "ETB",
      "period": "per month",
      "features": [...]
    }
  ]
}
```

### Subscribe to Plan
```http
POST /api/pricing/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "basic",
  "paymentMethod": "card" | "mobile-money"
}
```

---

## 🔍 Health Check

### API Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-19T10:00:00.000Z",
  "database": "connected",
  "uptime": 3600
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. File uploads are limited to 10MB
3. Rate limiting: 100 requests per 15 minutes
4. JWT tokens expire after 7 days
5. WebSocket events are available for real-time messaging

---

## 🔗 WebSocket Events

### Client → Server
- `join` - Join with userId
- `sendMessage` - Send a message
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Server → Client
- `newMessage` - New message received
- `messageSent` - Message sent confirmation
- `userTyping` - User is typing indicator
- `userStoppedTyping` - User stopped typing

---

## 📚 Example Usage

### JavaScript/Fetch
```javascript
// Get jobs
const response = await fetch('http://localhost:5000/api/jobs?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Create job
const newJob = await fetch('http://localhost:5000/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'React Developer',
    description: 'We need a React developer...',
    category: 'Web Development',
    budget: '50000'
  })
});
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get jobs
const jobs = await api.get('/jobs', {
  params: { page: 1, limit: 10 }
});

// Create job
const newJob = await api.post('/jobs', {
  title: 'React Developer',
  description: 'We need a React developer...',
  category: 'Web Development',
  budget: '50000'
});
```

---

**Last Updated:** January 19, 2025
**API Version:** 1.0.0
