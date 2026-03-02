# HealthConnect Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the Backend directory with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/healthconnect

# Or for MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthconnect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

**Option A: Local MongoDB**
- Install MongoDB on your system
- Start MongoDB service
- MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 4. Run the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register a Patient
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "patient@example.com",
    "password": "password123",
    "role": "patient",
    "phone": "+1234567890"
  }'
```

### Register a Doctor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Chen",
    "email": "doctor@example.com",
    "password": "password123",
    "role": "doctor",
    "specialty": "Cardiology",
    "hospital": "City General Hospital",
    "licenseNumber": "MD12345"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### Get Current User (Authenticated)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Integration

### Update Frontend API Base URL

In your frontend, create an API configuration file:

```javascript
// src/config/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export default API_BASE_URL;
```

### Example API Service

```javascript
// src/services/api.js
import API_BASE_URL from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Health Records
  async getHealthRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/health-records?${queryString}`);
  }

  async createHealthRecord(formData) {
    const token = localStorage.getItem('token');
    return fetch(`${this.baseURL}/health-records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  // Access Requests
  async getAccessRequests(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/access-requests${query}`);
  }

  async createAccessRequest(data) {
    return this.request('/access-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveAccessRequest(id, conditions) {
    return this.request(`/access-requests/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ conditions }),
    });
  }

  async rejectAccessRequest(id, reason) {
    return this.request(`/access-requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason: reason }),
    });
  }

  // Activity Logs
  async getActivityLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/activity-logs?${queryString}`);
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/users/stats');
  }
}

export default new ApiService();
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 5000

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure frontend is making requests to the correct backend URL

### File Upload Errors
- Ensure `uploads/` directory exists
- Check file size limits in `MAX_FILE_SIZE`
- Verify file types are allowed (PDF, JPG, PNG)

## Next Steps

1. Connect your frontend to the backend API
2. Test all endpoints
3. Set up error handling in frontend
4. Add loading states
5. Implement proper authentication flow

