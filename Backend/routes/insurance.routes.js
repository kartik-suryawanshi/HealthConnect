import express from 'express';
import {
    addInsurance,
    getMyInsurance,
    getPatientMaskedInsurance
} from '../controllers/insurance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Patient routes
router.post('/', authorize('patient'), addInsurance);
router.get('/my-insurance', authorize('patient'), getMyInsurance);

// Doctor routes
router.get('/patient/:patientId', authorize('doctor'), getPatientMaskedInsurance);

export default router;
