import Insurance from '../models/Insurance.model.js';
import User from '../models/User.model.js';
import AccessRequest from '../models/AccessRequest.model.js';

// @desc    Add new insurance details
// @route   POST /api/insurance
// @access  Private (Patient only)
export const addInsurance = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Only patients can add insurance details' });
        }

        const { insuranceCompany, policyNumber, groupNumber, validUpto, status } = req.body;

        const insurance = await Insurance.create({
            patient: req.user._id,
            insuranceCompany,
            policyNumber,
            groupNumber,
            validUpto,
            status: status || 'Active'
        });

        res.status(201).json({
            success: true,
            data: insurance
        });
    } catch (error) {
        console.error('Add insurance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding insurance details'
        });
    }
};

// @desc    Get patient's full insurance list
// @route   GET /api/insurance/my-insurance
// @access  Private (Patient only)
export const getMyInsurance = async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({ success: false, message: 'Only patients can view their raw insurance records' });
        }

        const insurances = await Insurance.find({ patient: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: insurances
        });
    } catch (error) {
        console.error('Get my insurance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching insurance details'
        });
    }
};

// @desc    Get patient's masked insurance details
// @route   GET /api/insurance/patient/:patientId
// @access  Private (Doctor only)
export const getPatientMaskedInsurance = async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Only doctors can access this route' });
        }

        const { patientId } = req.params;

        // Optional: check if doctor has approved access request for this patient
        const hasAccess = await AccessRequest.findOne({
            patient: patientId,
            doctor: req.user._id,
            status: 'approved',
            expiresAt: { $gt: new Date() }
        });

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'No active access grant for this patient'
            });
        }

        const insurances = await Insurance.find({ patient: patientId }).sort({ createdAt: -1 });

        // Mask policy details to prevent malpractice/fraud
        const maskedInsurances = insurances.map((ins) => {
            const policyLen = ins.policyNumber.length;
            let maskedPolicy = '***';
            if (policyLen > 4) {
                maskedPolicy = `***-***-${ins.policyNumber.substring(policyLen - 4)}`;
            }

            return {
                _id: ins._id,
                insuranceCompany: ins.insuranceCompany,
                status: ins.status,
                validUpto: ins.validUpto,
                maskedPolicyNumber: maskedPolicy
            };
        });

        res.json({
            success: true,
            data: maskedInsurances
        });
    } catch (error) {
        console.error('Get patient masked insurance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching masked insurance details'
        });
    }
};
