import express from 'express';
import {
  createAccessRequest,
  getAccessRequests,
  getAccessRequest,
  approveAccessRequest,
  rejectAccessRequest,
  revokeAccess
} from '../controllers/accessRequest.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAccessRequests)
  .post(authorize('doctor'), createAccessRequest);

router.get('/:id', getAccessRequest);

router.put('/:id/approve', authorize('patient'), approveAccessRequest);
router.put('/:id/reject', authorize('patient'), rejectAccessRequest);
router.put('/:id/revoke', authorize('patient'), revokeAccess);

export default router;

