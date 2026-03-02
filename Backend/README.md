# HealthConnect Backend API

A secure RESTful API backend for HealthConnect - A healthcare records management system built with MERN stack.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 📋 **Health Records Management**: Upload, view, update, and delete health records
- 🔑 **Access Control**: Doctors can request access to patient records, patients can approve/reject
- 📊 **Activity Logging**: Comprehensive activity tracking for all user actions
- 📁 **File Upload**: Secure file upload for health documents (PDF, images)
- 👥 **User Management**: Separate roles for patients and doctors

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Project Structure

```
Backend/
├── config/          # Configuration files (multer, etc.)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, etc.)
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Utility functions
├── uploads/         # Uploaded files (gitignored)
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/healthconnect
     JWT_SECRET=your_secret_key_here
     JWT_EXPIRE=7d
     FRONTEND_URL=http://localhost:5173
     ```

3. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

4. **Run the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (patient/doctor)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Health Records
- `GET /api/health-records` - Get all health records (filtered by user role)
- `GET /api/health-records/:id` - Get single health record
- `POST /api/health-records` - Create health record (patient only)
- `PUT /api/health-records/:id` - Update health record (patient only)
- `DELETE /api/health-records/:id` - Delete health record (patient only)
- `GET /api/health-records/:id/download` - Download health record file

### Access Requests
- `GET /api/access-requests` - Get all access requests
- `GET /api/access-requests/:id` - Get single access request
- `POST /api/access-requests` - Create access request (doctor only)
- `PUT /api/access-requests/:id/approve` - Approve access request (patient only)
- `PUT /api/access-requests/:id/reject` - Reject access request (patient only)
- `PUT /api/access-requests/:id/revoke` - Revoke access (patient only)

### Activity Logs
- `GET /api/activity-logs` - Get activity logs
- `GET /api/activity-logs/entity/:entityType/:entityId` - Get logs for specific entity

### Users
- `GET /api/users/stats` - Get dashboard statistics
- `GET /api/users/:id` - Get user profile
- `GET /api/users/patients/authorized` - Get authorized patients (doctor only)
- `GET /api/users/doctors/shared` - Get shared access doctors (patient only)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Request/Response Examples

### Register Patient
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "dateOfBirth": "1990-01-01",
  "phone": "+1234567890"
}
```

### Register Doctor
```json
POST /api/auth/register
{
  "name": "Dr. Sarah Chen",
  "email": "sarah@example.com",
  "password": "password123",
  "role": "doctor",
  "licenseNumber": "MD12345",
  "specialty": "Cardiology",
  "hospital": "City General Hospital"
}
```

### Create Health Record
```json
POST /api/health-records
Content-Type: multipart/form-data

{
  "name": "Blood Test Results",
  "type": "lab",
  "description": "Complete blood count",
  "file": <file>
}
```

### Create Access Request
```json
POST /api/access-requests
{
  "patientId": "patient@example.com",
  "reason": "Follow-up consultation",
  "duration": "30 days",
  "conditions": "none"
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- File upload validation
- CORS configuration
- Input validation

## Development

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `MAX_FILE_SIZE` - Maximum file upload size in bytes
- `NODE_ENV` - Environment (development/production)

## Notes

- The `uploads/` directory is created automatically
- All file uploads are stored in the `uploads/` directory
- Activity logs are automatically created for all user actions
- Access requests expire based on the duration specified

## License

ISC

