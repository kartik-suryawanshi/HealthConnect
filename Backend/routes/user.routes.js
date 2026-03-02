import express from 'express';
import {
  getUserProfile,
  getAuthorizedPatients,
  getSharedAccess,
  getDashboardStats
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/:id', getUserProfile);
router.get('/patients/authorized', authorize('doctor'), getAuthorizedPatients);
router.get('/doctors/shared', authorize('patient'), getSharedAccess);

export default router;

