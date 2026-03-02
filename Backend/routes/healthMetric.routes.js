import express from 'express';
import {
    addHealthMetric,
    getPatientMetrics
} from '../controllers/healthMetric.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('patient', 'doctor'), addHealthMetric);
router.get('/patient/:patientId', authorize('patient', 'doctor'), getPatientMetrics);

export default router;
