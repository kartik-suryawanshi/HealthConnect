import express from 'express';
import {
  getActivityLogs,
  getEntityActivityLogs
} from '../controllers/activityLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getActivityLogs);
router.get('/entity/:entityType/:entityId', getEntityActivityLogs);

export default router;

