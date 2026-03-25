import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshTokenString } from '../utils/generateToken.js';
import RefreshToken from '../models/RefreshToken.model.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalFields } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      ...(role === 'patient' && {
        dateOfBirth: additionalFields.dateOfBirth,
        phone: additionalFields.phone,
        address: additionalFields.address
      }),
      ...(role === 'doctor' && {
        licenseNumber: additionalFields.licenseNumber,
        specialty: additionalFields.specialty,
        hospital: additionalFields.hospital
      })
    };

    const user = await User.create(userData);

    // Log activity
    await logActivity({
      user: user._id,
      action: 'request',
      entityType: 'user',
      entityId: user._id,
      description: `${user.role} account created`,
      actor: user.name
    });

    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshTokenString = generateRefreshTokenString();
    
    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await RefreshToken.create({
      user: user._id,
      token: refreshTokenString,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
        refreshToken: refreshTokenString
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user and password
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15); // lock for 15 mins
        user.lockUntil = lockTime;
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await logActivity({
      user: user._id,
      action: 'access',
      entityType: 'user',
      entityId: user._id,
      description: 'User logged in',
      actor: user.name
    });

    // Generate tokens
    const token = generateAccessToken(user._id);
    const refreshTokenString = generateRefreshTokenString();
    
    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await RefreshToken.create({
      user: user._id,
      token: refreshTokenString,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        refreshToken: refreshTokenString
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'phone', 'address', 'specialty', 'hospital'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Please provide a refresh token' });
    }

    const savedToken = await RefreshToken.findOne({ token }).populate('user');
    
    if (!savedToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (savedToken.expiresAt < new Date()) {
      await RefreshToken.findByIdAndDelete(savedToken._id);
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.' });
    }

    const user = savedToken.user;
    if (!user || !user.isActive || user.isLocked) {
      return res.status(401).json({ success: false, message: 'User account is invalid or locked' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshTokenString = generateRefreshTokenString();

    // delete old token, save new
    await RefreshToken.findByIdAndDelete(savedToken._id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      user: user._id,
      token: newRefreshTokenString,
      expiresAt
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newAccessToken,
        refreshToken: newRefreshTokenString
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Error refreshing token' });
  }
};

