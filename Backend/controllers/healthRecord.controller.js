import HealthRecord from '../models/HealthRecord.model.js';
import AccessRequest from '../models/AccessRequest.model.js';
import { logActivity } from '../utils/activityLogger.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// @desc    Get all health records for a patient
// @route   GET /api/health-records
// @access  Private
export const getHealthRecords = async (req, res) => {
  try {
    const { type, search, status } = req.query;
    const query = {};

    // If user is patient, show only their records
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // If doctor, show records they have access to (where they are in sharedWith array)
      query['sharedWith.doctor'] = req.user._id;
      // Don't require accessStatus to be 'shared' - if doctor is in sharedWith, they can see it
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status && status !== 'all') {
      query.accessStatus = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const records = await HealthRecord.find(query)
      .populate('patient', 'name email')
      .populate('sharedWith.doctor', 'name email specialty hospital')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching health records'
    });
  }
};

// @desc    Get single health record
// @route   GET /api/health-records/:id
// @access  Private
export const getHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('sharedWith.doctor', 'name email specialty hospital');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check access
    const isOwner = record.patient._id.toString() === req.user._id.toString();
    const hasAccess = record.sharedWith.some(
      share => share.doctor._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this record'
      });
    }

    // Update access metadata
    record.metadata.lastAccessed = new Date();
    record.metadata.accessCount += 1;
    await record.save();

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'view',
      entityType: 'healthRecord',
      entityId: record._id,
      description: `Viewed ${record.name}`,
      actor: req.user.name,
      metadata: {
        recordType: record.type,
        fileName: record.fileName
      }
    });

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching health record'
    });
  }
};

// @desc    Create health record
// @route   POST /api/health-records
// @access  Private (Patient only)
export const createHealthRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { name, type, description, tags, patientId } = req.body;

    if (!name || !type) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please provide name and type'
      });
    }

    let targetPatientId = req.user._id;
    if (req.user.role === 'doctor') {
      if (!patientId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Please provide patientId' });
      }
      targetPatientId = patientId;
    }

    // Calculate SHA-256 Hash for Immutability
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Get all approved access requests for this patient
    const approvedRequests = await AccessRequest.find({
      patient: targetPatientId,
      status: 'approved',
      expiresAt: { $gt: new Date() } // Only non-expired requests
    }).select('doctor');

    // Build sharedWith array from approved requests
    const sharedWith = [];
    if (req.user.role === 'patient') {
      approvedRequests.forEach(req => {
        sharedWith.push({
          doctor: req.doctor,
          accessGrantedAt: new Date()
        });
      });
    } else if (req.user.role === 'doctor') {
      // Doctor uploading has access
      sharedWith.push({
        doctor: req.user._id,
        accessGrantedAt: new Date()
      });
    }

    const isDoctor = req.user.role === 'doctor';

    const record = await HealthRecord.create({
      patient: targetPatientId,
      name,
      type,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      accessStatus: sharedWith.length > 0 ? 'shared' : 'private',
      sharedWith: sharedWith,
      hash: hash,
      uploadedBy: req.user._id,
      isImmutable: isDoctor
    });

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'upload',
      entityType: 'healthRecord',
      entityId: record._id,
      description: `Uploaded ${record.name}`,
      actor: req.user.name,
      metadata: {
        recordType: record.type,
        fileName: record.fileName
      }
    });

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating health record'
    });
  }
};

// @desc    Update health record
// @route   PUT /api/health-records/:id
// @access  Private (Patient only)
export const updateHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    if (record.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    if (record.isImmutable && req.user.role === 'patient') {
      return res.status(403).json({
        success: false,
        message: 'This document is immutable because it was uploaded by a doctor. It cannot be modified.'
      });
    }

    const { name, description, tags, accessStatus } = req.body;

    if (name) record.name = name;
    if (description) record.description = description;
    if (tags) record.tags = tags.split(',').map(tag => tag.trim());
    if (accessStatus) record.accessStatus = accessStatus;

    await record.save();

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'access',
      entityType: 'healthRecord',
      entityId: record._id,
      description: `Updated ${record.name}`,
      actor: req.user.name
    });

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating health record'
    });
  }
};

// @desc    Delete health record
// @route   DELETE /api/health-records/:id
// @access  Private (Patient only)
export const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    if (record.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    if (record.isImmutable && req.user.role === 'patient') {
      return res.status(403).json({
        success: false,
        message: 'This document is immutable because it was uploaded by a doctor. It cannot be deleted.'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(record.filePath)) {
      fs.unlinkSync(record.filePath);
    }

    await HealthRecord.findByIdAndDelete(req.params.id);

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'delete',
      entityType: 'healthRecord',
      entityId: record._id,
      description: `Deleted ${record.name}`,
      actor: req.user.name
    });

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting health record'
    });
  }
};

// @desc    Download health record file
// @route   GET /api/health-records/:id/download
// @access  Private
export const downloadHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Check access
    const isOwner = record.patient.toString() === req.user._id.toString();
    const hasAccess = record.sharedWith.some(
      share => share.doctor.toString() === req.user._id.toString()
    );

    if (!isOwner && !hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this record'
      });
    }

    if (!fs.existsSync(record.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Log activity
    await logActivity({
      user: req.user._id,
      action: 'download',
      entityType: 'healthRecord',
      entityId: record._id,
      description: `Downloaded ${record.name}`,
      actor: req.user.name,
      metadata: {
        recordType: record.type,
        fileName: record.fileName
      }
    });

    res.download(record.filePath, record.fileName);
  } catch (error) {
    console.error('Download health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error downloading health record'
    });
  }
};

// @desc    Verify health record integrity
// @route   GET /api/health-records/:id/verify
// @access  Private
export const verifyHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    if (!fs.existsSync(record.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    const fileBuffer = fs.readFileSync(record.filePath);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const isValid = currentHash === record.hash;

    res.json({
      success: true,
      isValid: isValid,
      message: isValid ? 'Document integrity verified.' : 'Document has been tampered with or modified.',
      expectedHash: record.hash || null,
      currentHash: currentHash
    });
  } catch (error) {
    console.error('Verify health record error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying health record'
    });
  }
};
