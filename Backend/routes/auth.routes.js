import express from 'express';
import { register, login, getMe, updateProfile, refreshToken } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
