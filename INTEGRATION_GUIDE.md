# Frontend-Backend Integration Guide

## Quick Setup

### 1. Backend Setup

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
   MONGODB_URI=mongodb://localhost:27017/healthconnect
   JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   MAX_FILE_SIZE=10485760
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   - Make sure MongoDB is running locally, OR
   - Use MongoDB Atlas and update `MONGODB_URI` in `.env`

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### 2. Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   If you don't create this file, it will default to `http://localhost:5000/api`

4. **Start the frontend:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Testing the Integration

### 1. Test Registration

1. Go to `http://localhost:5173`
2. Click "Create Account" or go to `/signup`
3. Fill in the form:
   - Select role (Patient or Doctor)
   - Enter name, email, password
   - Fill optional fields
4. Submit the form
5. You should be redirected to the appropriate dashboard

### 2. Test Login

1. Go to `http://localhost:5173/login`
2. Enter your email and password
3. Click "Sign in"
4. You should be redirected to your dashboard

### 3. Test Protected Routes

- Try accessing `/patient` or `/doctor` without logging in
- You should be redirected to `/login`
- After logging in, you should be able to access your dashboard

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Health Records
- `GET /api/health-records` - Get all records
- `POST /api/health-records` - Create record (with file upload)
- `GET /api/health-records/:id` - Get single record
- `PUT /api/health-records/:id` - Update record
- `DELETE /api/health-records/:id` - Delete record
- `GET /api/health-records/:id/download` - Download record

### Access Requests
- `GET /api/access-requests` - Get all requests
- `POST /api/access-requests` - Create request (doctor only)
- `PUT /api/access-requests/:id/approve` - Approve request (patient only)
- `PUT /api/access-requests/:id/reject` - Reject request (patient only)

### Activity Logs
- `GET /api/activity-logs` - Get activity logs

### Users
- `GET /api/users/stats` - Get dashboard statistics

## Troubleshooting

### Backend not connecting
- Check if backend is running on port 5000
- Verify MongoDB is running
- Check `.env` file in Backend directory
- Check console for CORS errors

### Frontend not connecting to backend
- Verify `VITE_API_URL` in Frontend `.env` file
- Check browser console for network errors
- Ensure backend CORS allows frontend URL

### Authentication issues
- Check if token is stored in localStorage
- Verify JWT_SECRET in backend `.env`
- Check backend logs for authentication errors

### File upload issues
- Check `MAX_FILE_SIZE` in backend `.env`
- Verify `uploads/` directory exists in Backend
- Check file type restrictions (PDF, JPG, PNG only)

## Next Steps

1. **Connect all dashboard pages to backend:**
   - Update PatientDashboard to fetch real stats
   - Update HealthRecords to fetch real records
   - Update AccessRequests to fetch real requests
   - Update all other pages similarly

2. **Add error handling:**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Add loading states

3. **Add form validation:**
   - Client-side validation
   - Better error messages
   - Form field validation

4. **Enhance user experience:**
   - Add loading spinners
   - Add success/error toasts
   - Add optimistic updates

## File Structure

```
HealthConnect/
├── Backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── .env
├── Frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts          # API service
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Auth context
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Signup.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   └── .env
└── INTEGRATION_GUIDE.md
```

## Support

If you encounter any issues:
1. Check backend logs
2. Check browser console
3. Verify environment variables
4. Ensure MongoDB is running
5. Check network tab in browser DevTools

