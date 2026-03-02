# HealthConnect Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",  // or "doctor"
  // Patient fields:
  "dateOfBirth": "1990-01-01",
  "phone": "+1234567890",
  "address": "123 Main St"
  // Doctor fields:
  "licenseNumber": "MD12345",
  "specialty": "Cardiology",
  "hospital": "City General Hospital"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
**GET** `/api/auth/me` (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    ...
  }
}
```

### Update Profile
**PUT** `/api/auth/profile` (Protected)

**Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

---

## Health Records Endpoints

### Get All Health Records
**GET** `/api/health-records` (Protected)

**Query Parameters:**
- `type`: Filter by type (lab, prescription, scan, report, all)
- `search`: Search by name
- `status`: Filter by access status (private, shared, all)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "name": "Blood Test Results",
      "type": "lab",
      "filePath": "uploads/file.pdf",
      "fileName": "blood-test.pdf",
      "fileSize": 245000,
      "accessStatus": "shared",
      "sharedWith": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Health Record
**GET** `/api/health-records/:id` (Protected)

### Create Health Record
**POST** `/api/health-records` (Protected - Patient only)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (PDF, JPG, PNG)
- `name`: Document name
- `type`: Document type (lab, prescription, scan, report)
- `description`: Optional description
- `tags`: Comma-separated tags

### Update Health Record
**PUT** `/api/health-records/:id` (Protected - Patient only)

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "accessStatus": "shared",
  "tags": "tag1, tag2"
}
```

### Delete Health Record
**DELETE** `/api/health-records/:id` (Protected - Patient only)

### Download Health Record
**GET** `/api/health-records/:id/download` (Protected)

Returns the file for download.

---

## Access Request Endpoints

### Get All Access Requests
**GET** `/api/access-requests` (Protected)

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, all)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "doctor": { "name": "Dr. Sarah", ... },
      "patient": { "name": "John", ... },
      "reason": "Follow-up consultation",
      "duration": "30 days",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Access Request
**GET** `/api/access-requests/:id` (Protected)

### Create Access Request
**POST** `/api/access-requests` (Protected - Doctor only)

**Body:**
```json
{
  "patientId": "patient@example.com",  // or patient ID
  "reason": "Follow-up consultation for annual physical",
  "duration": "30 days",  // 7 days, 14 days, 30 days, 90 days
  "conditions": "none"  // none, lab-only, recent, no-download
}
```

### Approve Access Request
**PUT** `/api/access-requests/:id/approve` (Protected - Patient only)

**Body:**
```json
{
  "conditions": "lab-only"  // Optional: none, lab-only, recent, no-download
}
```

### Reject Access Request
**PUT** `/api/access-requests/:id/reject` (Protected - Patient only)

**Body:**
```json
{
  "rejectionReason": "Optional reason for rejection"
}
```

### Revoke Access
**PUT** `/api/access-requests/:id/revoke` (Protected - Patient only)

---

## Activity Log Endpoints

### Get Activity Logs
**GET** `/api/activity-logs` (Protected)

**Query Parameters:**
- `action`: Filter by action (view, upload, download, delete, share, access, approve, reject, request)
- `entityType`: Filter by entity type (healthRecord, accessRequest, user)
- `limit`: Limit results (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "_id": "...",
      "action": "view",
      "entityType": "healthRecord",
      "description": "Viewed Blood Test Results",
      "actor": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Entity Activity Logs
**GET** `/api/activity-logs/entity/:entityType/:entityId` (Protected)

---

## User Endpoints

### Get Dashboard Stats
**GET** `/api/users/stats` (Protected)

**Response (Patient):**
```json
{
  "success": true,
  "data": {
    "totalRecords": 24,
    "sharedRecords": 10,
    "pendingRequests": 2,
    "activeAccess": 3
  }
}
```

**Response (Doctor):**
```json
{
  "success": true,
  "data": {
    "authorizedPatients": 12,
    "pendingRequests": 3,
    "recordsReviewed": 47
  }
}
```

### Get User Profile
**GET** `/api/users/:id` (Protected)

### Get Authorized Patients
**GET** `/api/users/patients/authorized` (Protected - Doctor only)

### Get Shared Access Doctors
**GET** `/api/users/doctors/shared` (Protected - Patient only)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
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
  createdAt: Date,
  updatedAt: Date
}
```

### HealthRecord
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

### AccessRequest
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

### ActivityLog
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

## Notes

1. **File Uploads**: Health records use `multipart/form-data` for file uploads
2. **Token Expiration**: JWT tokens expire in 7 days (configurable)
3. **File Size Limit**: Default 10MB (configurable via `MAX_FILE_SIZE`)
4. **Allowed File Types**: PDF, JPEG, JPG, PNG
5. **Activity Logging**: All user actions are automatically logged
6. **Access Control**: Patients own their records, doctors need approval to access

