import AccessRequest from '../models/AccessRequest.model.js';
import HealthRecord from '../models/HealthRecord.model.js';
import User from '../models/User.model.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Create access request (Doctor)
// @route   POST /api/access-requests
// @access  Private (Doctor only)
export const createAccessRequest = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create access requests'
      });
    }

    const { patientId, reason, duration, conditions } = req.body;

    if (!patientId || !reason || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID, reason, and duration'
      });
    }

    // Find patient by patientId, _id (if valid ObjectId), or email
    const mongoose = (await import('mongoose')).default;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(patientId);
    
    const queryConditions = [
      { patientId: patientId.toUpperCase() },
      { email: patientId },
      { email: patientId.toLowerCase() }
    ];
    
    // Only add _id condition if it's a valid ObjectId
    if (isValidObjectId) {
      queryConditions.push({ _id: patientId });
    }
    
    const patient = await User.findOne({
      $or: queryConditions,
      role: 'patient'
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if request already exists
    const existingRequest = await AccessRequest.findOne({
      doctor: req.user._id,
      patient: patient._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this patient'
      });
    }

    const accessRequest = await AccessRequest.create({
      doctor: req.user._id,
      patient: patient._id,
      reason,
      duration,
      conditions: conditions || 'none',
      status: 'pending'
    });

    const populatedRequest = await AccessRequest.findById(accessRequest._id)
      .populate('doctor', 'name email specialty hospital')
      .populate('patient', 'name email patientId');

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'request',
      entityType: 'accessRequest',
      entityId: accessRequest._id,
      description: `Requested access to ${patient.name}'s records`,
      actor: req.user.name,
      targetUser: patient._id
    });

    res.status(201).json({
      success: true,
      message: 'Access request created successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Create access request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating access request'
    });
  }
};

// @desc    Get access requests
// @route   GET /api/access-requests
// @access  Private
export const getAccessRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await AccessRequest.find(query)
      .populate('doctor', 'name email specialty hospital')
      .populate('patient', 'name email patientId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching access requests'
    });
  }
};

// @desc    Get single access request
// @route   GET /api/access-requests/:id
// @access  Private
export const getAccessRequest = async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id)
      .populate('doctor', 'name email specialty hospital')
      .populate('patient', 'name email patientId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    // Check authorization
    const isOwner = 
      (req.user.role === 'patient' && request.patient._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'doctor' && request.doctor._id.toString() === req.user._id.toString());

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get access request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching access request'
    });
  }
};

// @desc    Approve access request (Patient)
// @route   PUT /api/access-requests/:id/approve
// @access  Private (Patient only)
export const approveAccessRequest = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can approve access requests'
      });
    }

    const request = await AccessRequest.findById(req.params.id)
      .populate('doctor', 'name email specialty hospital')
      .populate('patient', 'name email patientId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (request.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Update request status
    request.status = 'approved';
    request.approvedAt = new Date();
    request.expiresAt = request.calculateExpiration();
    if (req.body.conditions) {
      request.conditions = req.body.conditions;
    }
    await request.save();

    // Grant access to ALL health records (both private and shared)
    const healthRecords = await HealthRecord.find({
      patient: req.user._id
    });

    // Add doctor to sharedWith array for each record and mark as shared
    for (const record of healthRecords) {
      const alreadyShared = record.sharedWith.some(
        share => share.doctor.toString() === request.doctor._id.toString()
      );

      if (!alreadyShared) {
        record.sharedWith.push({
          doctor: request.doctor._id,
          accessGrantedAt: new Date()
        });
        // Mark record as shared so doctor can see it
        record.accessStatus = 'shared';
        await record.save();
      }
    }

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'approve',
      entityType: 'accessRequest',
      entityId: request._id,
      description: `Approved access request from ${request.doctor.name}`,
      actor: req.user.name,
      targetUser: request.doctor._id
    });

    res.json({
      success: true,
      message: 'Access request approved successfully',
      data: request
    });
  } catch (error) {
    console.error('Approve access request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error approving access request'
    });
  }
};

// @desc    Reject access request (Patient)
// @route   PUT /api/access-requests/:id/reject
// @access  Private (Patient only)
export const rejectAccessRequest = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can reject access requests'
      });
    }

    const request = await AccessRequest.findById(req.params.id)
      .populate('doctor', 'name email specialty hospital')
      .populate('patient', 'name email patientId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (request.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not pending'
      });
    }

    // Update request status
    request.status = 'rejected';
    request.rejectedAt = new Date();
    if (req.body.rejectionReason) {
      request.rejectionReason = req.body.rejectionReason;
    }
    await request.save();

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'reject',
      entityType: 'accessRequest',
      entityId: request._id,
      description: `Rejected access request from ${request.doctor.name}`,
      actor: req.user.name,
      targetUser: request.doctor._id
    });

    res.json({
      success: true,
      message: 'Access request rejected',
      data: request
    });
  } catch (error) {
    console.error('Reject access request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting access request'
    });
  }
};

// @desc    Revoke access (Patient)
// @route   PUT /api/access-requests/:id/revoke
// @access  Private (Patient only)
export const revokeAccess = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can revoke access'
      });
    }

    const request = await AccessRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (request.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke this access'
      });
    }

    // Remove doctor from sharedWith in health records
    const healthRecords = await HealthRecord.find({
      patient: req.user._id
    });

    for (const record of healthRecords) {
      record.sharedWith = record.sharedWith.filter(
        share => share.doctor.toString() !== request.doctor.toString()
      );
      await record.save();
    }

    // Update request status
    request.status = 'expired';
    await request.save();

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'access',
      entityType: 'accessRequest',
      entityId: request._id,
      description: 'Revoked doctor access',
      actor: req.user.name,
      targetUser: request.doctor
    });

    res.json({
      success: true,
      message: 'Access revoked successfully'
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error revoking access'
    });
  }
};

