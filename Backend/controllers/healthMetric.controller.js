import HealthMetric from '../models/HealthMetric.model.js';
import User from '../models/User.model.js';
import AccessRequest from '../models/AccessRequest.model.js';

// @desc    Add a new health metric reading or event
// @route   POST /api/metrics
// @access  Private (Patient or Doctor)
export const addHealthMetric = async (req, res) => {
    try {
        const { patientId, metricType, value, severity, contextReason, recordedAt } = req.body;

        let targetPatientId = req.user._id;

        if (req.user.role === 'doctor') {
            if (!patientId) {
                return res.status(400).json({ success: false, message: 'Please provide patientId' });
            }

            // Verify doctor access
            const hasAccess = await AccessRequest.findOne({
                patient: patientId,
                doctor: req.user._id,
                status: 'approved',
                expiresAt: { $gt: new Date() }
            });

            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'No active access grant for this patient' });
            }
            targetPatientId = patientId;
        }

        const metric = await HealthMetric.create({
            patient: targetPatientId,
            recordedBy: req.user._id,
            metricType,
            value,
            severity: severity || 'Normal',
            contextReason,
            recordedAt: recordedAt || new Date()
        });

        res.status(201).json({
            success: true,
            data: metric
        });
    } catch (error) {
        console.error('Add health metric error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding health metric'
        });
    }
};

// @desc    Get patient's health metrics
// @route   GET /api/metrics/patient/:patientId
// @access  Private
export const getPatientMetrics = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { metricType } = req.query;

        if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these metrics' });
        }

        if (req.user.role === 'doctor') {
            const hasAccess = await AccessRequest.findOne({
                patient: patientId,
                doctor: req.user._id,
                status: 'approved',
                expiresAt: { $gt: new Date() }
            });

            if (!hasAccess) {
                return res.status(403).json({ success: false, message: 'No active access grant for this patient' });
            }
        }

        const query = { patient: patientId };
        if (metricType && metricType !== 'all') {
            query.metricType = metricType;
        }

        const metrics = await HealthMetric.find(query)
            .populate('recordedBy', 'name role')
            .sort({ recordedAt: 1 }); // Sort chronologically for charting

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Get health metrics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching health metrics'
        });
    }
};
