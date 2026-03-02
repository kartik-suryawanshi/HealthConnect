# Environment Variables Setup Guide

## Backend .env File

Create a `.env` file in the `Backend/` directory with the following variables:

### Required Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/healthconnect

# Option 2: MongoDB Atlas (Cloud) - Replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthconnect?retryWrites=true&w=majority

# JWT Configuration
# IMPORTANT: Generate a secure random string (at least 32 characters)
# You can generate one using Node.js:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Variable Explanations

#### PORT
- **Default**: `5000`
- **Description**: Port number where the backend server will run
- **Example**: `PORT=5000`

#### NODE_ENV
- **Options**: `development` | `production`
- **Description**: Environment mode
- **Example**: `NODE_ENV=development`

#### MONGODB_URI
- **Description**: MongoDB connection string
- **Local MongoDB**: `mongodb://localhost:27017/healthconnect`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/healthconnect?retryWrites=true&w=majority`
- **How to get Atlas URI**:
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free cluster
  3. Click "Connect" → "Connect your application"
  4. Copy the connection string
  5. Replace `<password>` with your database password
  6. Replace `<dbname>` with `healthconnect`

#### JWT_SECRET
- **Description**: Secret key for signing JWT tokens
- **IMPORTANT**: Must be at least 32 characters long
- **Generate a secure secret**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: `JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### JWT_EXPIRE
- **Description**: Token expiration time
- **Format**: Number + unit (d=days, h=hours, m=minutes)
- **Examples**: 
  - `7d` = 7 days
  - `24h` = 24 hours
  - `30m` = 30 minutes

#### MAX_FILE_SIZE
- **Description**: Maximum file upload size in bytes
- **Default**: `10485760` (10 MB)
- **Examples**:
  - `10485760` = 10 MB
  - `5242880` = 5 MB
  - `20971520` = 20 MB

#### UPLOAD_PATH
- **Description**: Directory where uploaded files will be stored
- **Default**: `./uploads`
- **Note**: This directory is created automatically

#### FRONTEND_URL
- **Description**: URL of your frontend application (for CORS)
- **Default**: `http://localhost:5173`
- **Update if**: Your frontend runs on a different port or domain

---

## Frontend .env File

Create a `.env` file in the `Frontend/` directory with the following variable:

### Required Variable

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### Variable Explanation

#### VITE_API_URL
- **Description**: Base URL for the backend API
- **Default**: `http://localhost:5000/api`
- **Format**: `http://localhost:PORT/api` or `https://your-domain.com/api`
- **Note**: Must start with `VITE_` for Vite to expose it to the frontend

---

## Quick Setup Steps

### 1. Backend Setup

1. Navigate to Backend directory:
   ```bash
   cd Backend
   ```

2. Create `.env` file:
   ```bash
   # On Windows (PowerShell)
   New-Item -ItemType File -Path ".env"
   
   # On Mac/Linux
   touch .env
   ```

3. Copy the backend .env content above into the file

4. **IMPORTANT**: Generate a secure JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and replace `JWT_SECRET` value

5. Update `MONGODB_URI`:
   - For local MongoDB: Keep as is
   - For MongoDB Atlas: Replace with your connection string

### 2. Frontend Setup

1. Navigate to Frontend directory:
   ```bash
   cd Frontend
   ```

2. Create `.env` file:
   ```bash
   # On Windows (PowerShell)
   New-Item -ItemType File -Path ".env"
   
   # On Mac/Linux
   touch .env
   ```

3. Copy the frontend .env content above into the file

4. Update `VITE_API_URL` if your backend runs on a different port

---

## Example .env Files

### Backend/.env (Local MongoDB)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthconnect
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:5173
```

### Backend/.env (MongoDB Atlas)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/healthconnect?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:5173
```

### Frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Security Notes

1. **Never commit .env files to Git** - They're already in `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 random characters
3. **Keep secrets secure** - Don't share your .env files
4. **Use different secrets** - Use different JWT_SECRET for development and production
5. **MongoDB Atlas** - Keep your database password secure

---

## Troubleshooting

### Backend can't connect to MongoDB
- Check if MongoDB is running: `mongod` or check MongoDB service
- Verify `MONGODB_URI` is correct
- For Atlas: Check IP whitelist and credentials

### CORS errors
- Verify `FRONTEND_URL` matches your frontend URL
- Check if frontend is running on the correct port

### JWT errors
- Ensure `JWT_SECRET` is set and is at least 32 characters
- Don't use common words or phrases

### File upload errors
- Check `MAX_FILE_SIZE` is sufficient
- Ensure `uploads/` directory exists (created automatically)

---

## Need Help?

If you're having issues:
1. Check that all required variables are set
2. Verify no typos in variable names
3. Ensure MongoDB is running (for local)
4. Check backend logs for specific errors

