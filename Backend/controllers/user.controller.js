import User from '../models/User.model.js';
import HealthRecord from '../models/HealthRecord.model.js';
import AccessRequest from '../models/AccessRequest.model.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow viewing own profile or if doctor viewing patient they have access to
    if (req.user._id.toString() !== user._id.toString()) {
      if (req.user.role === 'doctor' && user.role === 'patient') {
        // Check if doctor has access to this patient
        const hasAccess = await AccessRequest.findOne({
          doctor: req.user._id,
          patient: user._id,
          status: 'approved'
        });

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to view this profile'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this profile'
        });
      }
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Get authorized patients (Doctor)
// @route   GET /api/users/patients/authorized
// @access  Private (Doctor only)
export const getAuthorizedPatients = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this route'
      });
    }

    const accessRequests = await AccessRequest.find({
      doctor: req.user._id,
      status: 'approved'
    }).populate('patient', 'name email patientId phone dateOfBirth');

    const patients = accessRequests.map(req => req.patient);

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Get authorized patients error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching authorized patients'
    });
  }
};

// @desc    Get shared access (Patient)
// @route   GET /api/users/doctors/shared
// @access  Private (Patient only)
export const getSharedAccess = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access this route'
      });
    }

    const accessRequests = await AccessRequest.find({
      patient: req.user._id,
      status: 'approved'
    }).populate('doctor', 'name email specialty hospital');

    const doctors = accessRequests.map(req => ({
      requestId: req._id,
      doctor: req.doctor,
      accessGrantedAt: req.approvedAt,
      expiresAt: req.expiresAt,
      conditions: req.conditions
    }));

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get shared access error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching shared access'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'patient') {
      const totalRecords = await HealthRecord.countDocuments({ patient: req.user._id });
      const sharedRecords = await HealthRecord.countDocuments({
        patient: req.user._id,
        accessStatus: 'shared'
      });
      const pendingRequests = await AccessRequest.countDocuments({
        patient: req.user._id,
        status: 'pending'
      });
      const activeAccess = await AccessRequest.countDocuments({
        patient: req.user._id,
        status: 'approved'
      });
      
      // Recent uploads in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUploads = await HealthRecord.countDocuments({
        patient: req.user._id,
        createdAt: { $gte: thirtyDaysAgo }
      });

      stats = {
        totalRecords,
        sharedRecords,
        pendingRequests,
        activeAccess,
        recentUploads
      };
    } else if (req.user.role === 'doctor') {
      const authorizedPatients = await AccessRequest.countDocuments({
        doctor: req.user._id,
        status: 'approved'
      });
      const pendingRequests = await AccessRequest.countDocuments({
        doctor: req.user._id,
        status: 'pending'
      });
      
      // Records reviewed this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const recordsReviewed = await HealthRecord.countDocuments({
        'sharedWith.doctor': req.user._id,
        'metadata.lastAccessed': { $gte: startOfMonth }
      });

      stats = {
        authorizedPatients,
        pendingRequests,
        recordsReviewed
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard stats'
    });
  }
};

