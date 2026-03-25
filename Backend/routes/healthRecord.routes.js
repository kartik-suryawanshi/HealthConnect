import express from 'express';
import {
  getHealthRecords,
  getHealthRecord,
  createHealthRecord,
  downloadHealthRecord,
  verifyHealthRecord
} from '../controllers/healthRecord.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import upload from '../config/multer.config.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getHealthRecords)
  .post(authorize('patient', 'doctor'), upload.single('file'), createHealthRecord);

router.route('/:id')
  .get(getHealthRecord);

router.get('/:id/download', downloadHealthRecord);
router.get('/:id/verify', authorize('patient', 'doctor'), verifyHealthRecord);

export default router;

