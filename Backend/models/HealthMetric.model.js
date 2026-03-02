import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metricType: {
        type: String,
        enum: ['Blood Pressure', 'Blood Sugar', 'Heart Rate', 'Medical Event'],
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    severity: {
        type: String,
        enum: ['Normal', 'Elevated', 'Critical'],
        default: 'Normal'
    },
    contextReason: {
        type: String,
        trim: true
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

healthMetricSchema.index({ patient: 1, metricType: 1, recordedAt: -1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

export default HealthMetric;
