import HealthRecord from '../models/HealthRecord.model.js';
import AccessRequest from '../models/AccessRequest.model.js';
import { logActivity } from '../utils/activityLogger.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import forge from 'node-forge';
import Tesseract from 'tesseract.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

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

    // 1) AI Fraud Detection check
    try {
       // Just a rough estimation of recent uploads by this user
       const recentCount = await HealthRecord.countDocuments({ uploadedBy: req.user._id, createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) } });
       const reqFraud = await fetch('http://localhost:8000/fraud-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_recent_uploads: recentCount })
       });
       if (reqFraud.ok) {
          const fraudData = await reqFraud.json();
          if (fraudData.is_fraud_suspected) {
             console.warn('AI Alert: Potentially abnormal upload patterns from user', req.user._id);
          }
       }
    } catch (e) { console.log('Fraud detection skipped (AI service may be down)'); }

    // 2) Run OCR
    let extractedText = '';
    try {
      if (req.file.mimetype.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
        extractedText = text;
      }
    } catch(err) {
      console.error('OCR Error:', err);
    }

    // 3) AI Document Classification
    if (extractedText) {
      try {
        const classRes = await fetch('http://localhost:8000/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: extractedText.substring(0, 1000) }) // Send up to 1000 chars
        });
        if (classRes.ok) {
           const classData = await classRes.json();
           console.log('AI Automatic Classification:', classData);
        }
      } catch (err) { console.log('Classification skipped (AI service may be down)'); }
    }

    // 4) Upload file to Cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
       return res.status(500).json({ success: false, message: 'Error uploading file to storage provider' });
    }
    const finalFilePath = cloudinaryResponse.secure_url;

    let finalSignature = null;
    if (isDoctor) {
      // Mocking doctor's private key generation for signing
      const { privateKey } = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
      const md = forge.md.sha256.create();
      md.update(hash, 'utf8');
      finalSignature = forge.util.encode64(privateKey.sign(md));
    }

    const record = await HealthRecord.create({
      patient: targetPatientId,
      name,
      type,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filePath: finalFilePath,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      accessStatus: sharedWith.length > 0 ? 'shared' : 'private',
      sharedWith: sharedWith,
      hash: hash,
      extractedText: extractedText,
      uploadedBy: req.user._id,
      isImmutable: isDoctor,
      isLocked: isDoctor, // Lock verified records immediately
      versions: [{
        filePath: finalFilePath,
        fileHash: hash,
        uploadedBy: req.user._id,
        createdAt: new Date(),
        isVerified: isDoctor,
        verifiedBy: isDoctor ? req.user._id : null,
        signature: finalSignature
      }]
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

    const isValidHash = currentHash === record.hash;
    const isSigned = record.versions && record.versions[0] && record.versions[0].signature;
    const isVerified = record.isLocked && isSigned;

    res.json({
      success: true,
      isValid: isValidHash && isVerified,
      message: (isValidHash && isVerified) ? 'Document integrity and signature verified.' : 'Document failed verification or hasn\'t been signed by a doctor.',
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
