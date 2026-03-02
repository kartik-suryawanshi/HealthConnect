# HealthConnect - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Setup Instructions](#setup-instructions)
8. [Usage Guide](#usage-guide)

---

## 🎯 Project Overview

**HealthConnect** is a secure, modern healthcare records management system that allows patients to manage their medical documents and control access to them. Doctors can request access to patient records, and patients have full control over who can view their health information.

### Key Highlights
- **Secure**: JWT-based authentication with role-based access control
- **User-Friendly**: Modern, responsive UI built with React and Tailwind CSS
- **Scalable**: RESTful API architecture with MongoDB
- **Compliant**: Designed with healthcare data privacy in mind

---

## 🛠 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **date-fns** - Date formatting
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **Morgan** - HTTP request logger

### Development Tools
- **Nodemon** - Auto-restart for development
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## 📁 Project Structure

```
HealthConnect/
├── Backend/
│   ├── config/
│   │   └── multer.config.js          # File upload configuration
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── healthRecord.controller.js # Health records CRUD
│   │   ├── accessRequest.controller.js # Access request management
│   │   ├── activityLog.controller.js  # Activity logging
│   │   └── user.controller.js         # User management
│   ├── middleware/
│   │   └── auth.middleware.js         # JWT authentication & authorization
│   ├── models/
│   │   ├── User.model.js              # User schema
│   │   ├── HealthRecord.model.js      # Health record schema
│   │   ├── AccessRequest.model.js     # Access request schema
│   │   └── ActivityLog.model.js       # Activity log schema
│   ├── routes/
│   │   ├── auth.routes.js             # Auth endpoints
│   │   ├── healthRecord.routes.js     # Health record endpoints
│   │   ├── accessRequest.routes.js    # Access request endpoints
│   │   ├── activityLog.routes.js     # Activity log endpoints
│   │   └── user.routes.js             # User endpoints
│   ├── scripts/
│   │   └── seed.js                    # Database seeding script
│   ├── utils/
│   │   ├── generateToken.js           # JWT token generation
│   │   └── activityLogger.js          # Activity logging utility
│   ├── uploads/                       # Uploaded files storage
│   ├── server.js                      # Main server file
│   ├── package.json                   # Dependencies
│   └── .env                           # Environment variables
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/             # Dashboard components
│   │   │   ├── layout/                # Layout components
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx        # Authentication context
│   │   │   └── ThemeContext.tsx       # Theme context
│   │   ├── pages/
│   │   │   ├── auth/                  # Login/Signup pages
│   │   │   ├── patient/               # Patient pages
│   │   │   └── doctor/                # Doctor pages
│   │   ├── services/
│   │   │   └── api.ts                 # API service layer
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/                       # Utility functions
│   │   └── App.tsx                    # Main app component
│   ├── package.json                   # Dependencies
│   └── .env                           # Environment variables
│
└── Documentation Files
    ├── README.md
    ├── SETUP.md
    ├── API_DOCUMENTATION.md
    └── PROJECT_DOCUMENTATION.md
```

---

## ✨ Features

### Patient Features
1. **Dashboard**
   - View statistics (total records, active access, recent uploads, pending requests)
   - Recent activity feed
   - Quick actions

2. **Health Records Management**
   - Upload documents (PDF, JPG, PNG)
   - View, download, and delete records
   - Organize by type (lab, prescription, scan, report)
   - Control sharing (private/shared)
   - Search and filter records

3. **Access Control**
   - Review and approve/reject doctor access requests
   - Manage shared access (view who has access)
   - Revoke access at any time
   - Set access conditions (lab-only, recent records, view-only)

4. **Activity Logs**
   - Track all record access
   - View who accessed what and when
   - Filter by action type

### Doctor Features
1. **Dashboard**
   - View practice statistics
   - Recent activity feed
   - Pending requests preview

2. **Request Access**
   - Request access to patient records
   - Specify reason and duration
   - Track request status

3. **Authorized Patients**
   - View list of patients who granted access
   - See access periods and expiration dates
   - Quick access to patient records

4. **Patient Records**
   - View shared health records
   - Filter by patient
   - Download records
   - Search and filter functionality

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- CORS protection
- Activity logging for audit trail

---

## 🗄 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "patient" | "doctor",
  
  // Patient fields
  dateOfBirth: Date,
  phone: String,
  address: String,
  
  // Doctor fields
  licenseNumber: String,
  specialty: String,
  hospital: String,
  
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### HealthRecord Model
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User),
  name: String,
  type: "lab" | "prescription" | "scan" | "report",
  filePath: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  description: String,
  accessStatus: "private" | "shared",
  sharedWith: [{
    doctor: ObjectId (ref: User),
    accessGrantedAt: Date
  }],
  tags: [String],
  metadata: {
    uploadDate: Date,
    lastAccessed: Date,
    accessCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### AccessRequest Model
```javascript
{
  _id: ObjectId,
  doctor: ObjectId (ref: User),
  patient: ObjectId (ref: User),
  reason: String,
  duration: "7 days" | "14 days" | "30 days" | "90 days",
  status: "pending" | "approved" | "rejected" | "expired",
  conditions: "none" | "lab-only" | "recent" | "no-download",
  approvedAt: Date,
  rejectedAt: Date,
  expiresAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityLog Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  action: String,
  entityType: "healthRecord" | "accessRequest" | "user",
  entityId: ObjectId,
  description: String,
  actor: String,
  targetUser: ObjectId (ref: User),
  metadata: Object,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Health Records
- `GET /api/health-records` - Get all records (filtered by role)
- `GET /api/health-records/:id` - Get single record
- `POST /api/health-records` - Create record (patient only)
- `PUT /api/health-records/:id` - Update record (patient only)
- `DELETE /api/health-records/:id` - Delete record (patient only)
- `GET /api/health-records/:id/download` - Download record file

### Access Requests
- `GET /api/access-requests` - Get all requests
- `GET /api/access-requests/:id` - Get single request
- `POST /api/access-requests` - Create request (doctor only)
- `PUT /api/access-requests/:id/approve` - Approve request (patient only)
- `PUT /api/access-requests/:id/reject` - Reject request (patient only)
- `PUT /api/access-requests/:id/revoke` - Revoke access (patient only)

### Activity Logs
- `GET /api/activity-logs` - Get activity logs
- `GET /api/activity-logs/entity/:entityType/:entityId` - Get entity logs

### Users
- `GET /api/users/stats` - Get dashboard statistics
- `GET /api/users/:id` - Get user profile
- `GET /api/users/patients/authorized` - Get authorized patients (doctor only)
- `GET /api/users/doctors/shared` - Get shared doctors (patient only)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/healthconnect
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   FRONTEND_URL=http://localhost:8080
   ```

4. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Default Accounts (from seed)

**Patient:**
- Email: `patient@example.com`
- Password: `password123`

**Doctor:**
- Email: `doctor@example.com`
- Password: `password123`

---

## 📖 Usage Guide

### For Patients

1. **Register/Login**
   - Go to `/signup` to create an account
   - Select "Patient" role
   - Fill in your information
   - Login at `/login`

2. **Upload Health Records**
   - Go to "Health Records" page
   - Click "Upload Document"
   - Select file and document type
   - Upload

3. **Manage Access**
   - Go to "Access Requests" to approve/reject doctor requests
   - Go to "Shared Access" to see who has access and revoke if needed

4. **View Activity**
   - Go to "Activity Logs" to see all access history

### For Doctors

1. **Register/Login**
   - Go to `/signup` to create an account
   - Select "Doctor" role
   - Fill in your information (license, specialty, hospital)
   - Login at `/login`

2. **Request Patient Access**
   - Go to "Request Access" page
   - Enter patient email or ID
   - Specify reason and duration
   - Submit request

3. **View Authorized Patients**
   - Go to "Authorized Patients" page
   - See all patients who granted access
   - Click "View Records" to see their documents

4. **View Patient Records**
   - Go to "Patient Records" page
   - Select a patient from dropdown
   - View, download records you have access to

---

## 🔐 Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with bcrypt (10 rounds)
   - Secure token storage

2. **Authorization**
   - Role-based access control
   - Resource ownership verification
   - Protected routes

3. **File Upload Security**
   - File type validation (PDF, JPG, PNG only)
   - File size limits (10MB default)
   - Secure file storage

4. **Data Protection**
   - CORS configuration
   - Input validation
   - Activity logging for audit trail

---

## 📊 Key Statistics

### Patient Dashboard Stats
- Total Records
- Active Access (doctors with permissions)
- Recent Uploads (last 30 days)
- Pending Requests

### Doctor Dashboard Stats
- Authorized Patients
- Pending Requests
- Records Reviewed (this month)

---

## 🗂 File Upload

### Supported Formats
- PDF documents
- JPEG/JPG images
- PNG images

### File Size Limit
- Default: 10MB (configurable via `MAX_FILE_SIZE`)

### Storage
- Files stored in `Backend/uploads/` directory
- Unique filenames generated to prevent conflicts
- Original filename preserved in database

---

## 🔄 Activity Logging

All user actions are automatically logged:
- Record views
- Record uploads
- Record downloads
- Record deletions
- Access requests
- Access approvals/rejections
- Access revocations

Logs include:
- User who performed action
- Action type
- Target entity
- Timestamp
- Additional metadata

---

## 🌐 API Base URL

**Development:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:8080` or `http://localhost:5173`

**API Endpoints:**
- All API routes prefixed with `/api`

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthconnect
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing the Application

### 1. Test Registration
- Register as patient
- Register as doctor
- Verify accounts created

### 2. Test Login
- Login with credentials
- Verify JWT token received
- Check dashboard access

### 3. Test Health Records
- Upload a document
- View the document
- Download the document
- Delete the document

### 4. Test Access Requests
- Doctor requests access
- Patient approves/rejects
- Verify access granted

### 5. Test Activity Logs
- Perform various actions
- Check activity logs update
- Verify timestamps

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`
   - Verify network connectivity

2. **CORS Errors**
   - Update `FRONTEND_URL` in backend `.env`
   - Ensure frontend URL matches

3. **JWT Errors**
   - Verify `JWT_SECRET` is set and at least 32 characters
   - Check token expiration

4. **File Upload Errors**
   - Check file size (must be under limit)
   - Verify file type is allowed
   - Ensure `uploads/` directory exists

5. **Port Already in Use**
   - Change `PORT` in backend `.env`
   - Or kill process using the port

---

## 📚 Additional Resources

- **Backend README**: `Backend/README.md`
- **Setup Guide**: `Backend/SETUP.md`
- **API Documentation**: `Backend/API_DOCUMENTATION.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`

---

## 👥 User Roles

### Patient
- Can upload, view, delete own records
- Can approve/reject access requests
- Can revoke doctor access
- Can view activity logs

### Doctor
- Can request access to patient records
- Can view shared records
- Can download shared records
- Cannot upload records (patients only)
- Cannot delete records (patients only)

---

## 🔄 Data Flow

1. **User Registration/Login**
   - User provides credentials
   - Backend validates and creates/authenticates
   - JWT token returned
   - Token stored in localStorage

2. **Accessing Protected Routes**
   - Frontend sends token in Authorization header
   - Backend verifies token
   - Access granted/denied based on role

3. **File Upload**
   - File sent as multipart/form-data
   - Backend validates file
   - File saved to uploads directory
   - Record created in database

4. **Access Request Flow**
   - Doctor creates request
   - Patient receives notification (in UI)
   - Patient approves/rejects
   - Access granted/denied
   - Activity logged

---

## 📈 Future Enhancements

Potential features to add:
- Email notifications
- Two-factor authentication
- File encryption at rest
- Advanced analytics
- Mobile app
- Real-time notifications
- Document OCR
- Integration with medical devices

---

## 📄 License

ISC

---

## 👨‍💻 Development

### Running in Development Mode

**Backend:**
```bash
cd Backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd Frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd Backend
npm start
```

**Frontend:**
```bash
cd Frontend
npm run build
npm run preview
```

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check backend logs
4. Check browser console

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Project:** HealthConnect - Digital Health Records Management System

