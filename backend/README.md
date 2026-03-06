# HustleX Backend API

A Node.js/Express.js backend API for the HustleX platform using MongoDB.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Job Management**: CRUD operations for job postings
- **Application System**: Submit and manage job applications
- **File Upload**: Support for CV uploads (placeholder implementation)
- **Security**: Rate limiting, CORS, helmet security headers
- **Validation**: Input validation using express-validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hustlex
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Jobs

- `GET /api/jobs` - Get all jobs (with pagination and filters)
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job (requires authentication)
- `PUT /api/jobs/:id` - Update a job (requires authentication)
- `DELETE /api/jobs/:id` - Delete a job (requires authentication)
- `GET /api/jobs/user/my-jobs` - Get user's posted jobs (requires authentication)

### Applications

- `POST /api/applications` - Submit a job application (requires authentication)
- `GET /api/applications/my-applications` - Get user's applications (requires authentication)
- `GET /api/applications/job/:jobId` - Get applications for a job (requires authentication)
- `PUT /api/applications/:id/status` - Update application status (requires authentication)
- `GET /api/applications/check/:jobId` - Check if user has applied to a job (requires authentication)

## Database Models

### User

- email, password, role (freelancer/client)
- profile information (firstName, lastName, phone, skills, etc.)

### Job

- title, description, company, budget, category
- jobType, workLocation, experience, education
- skills, requirements, benefits
- postedBy (reference to User)

### Application

- job (reference to Job), applicant (reference to User)
- coverLetter, cvUrl, status (pending/in_review/hired/rejected)
- appliedAt, updatedAt

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization

## File Upload

The current implementation includes a placeholder for file uploads. To implement actual file upload:

1. Create an `uploads` directory in the backend folder
2. Implement a file upload endpoint
3. Update the application submission to handle file uploads
4. Configure proper file storage (local or cloud storage like AWS S3)

## Testing

You can test the API using tools like Postman or curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"freelancer","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get jobs (replace TOKEN with actual JWT token)
curl -X GET http://localhost:5000/api/jobs \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Frontend URL for CORS
- `MAX_FILE_SIZE`: Maximum file upload size in bytes
- `UPLOAD_PATH`: Directory for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License






