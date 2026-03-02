import mongoose from 'mongoose';

const insuranceSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    insuranceCompany: {
        type: String,
        required: [true, 'Insurance Company Name is required'],
        trim: true
    },
    policyNumber: {
        type: String,
        required: [true, 'Policy Number is required'],
        trim: true
    },
    groupNumber: {
        type: String,
        trim: true
    },
    validUpto: {
        type: Date,
        required: [true, 'Valid Upto Date is required']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

insuranceSchema.index({ patient: 1 });

const Insurance = mongoose.model('Insurance', insuranceSchema);

export default Insurance;
