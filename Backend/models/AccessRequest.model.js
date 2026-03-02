import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for access is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Access duration is required'],
    enum: ['7 days', '14 days', '30 days', '90 days']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  conditions: {
    type: String,
    enum: ['none', 'lab-only', 'recent', 'no-download'],
    default: 'none'
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
accessRequestSchema.index({ doctor: 1, status: 1 });
accessRequestSchema.index({ patient: 1, status: 1 });
accessRequestSchema.index({ status: 1, createdAt: -1 });

// Method to calculate expiration date
accessRequestSchema.methods.calculateExpiration = function() {
  const days = parseInt(this.duration);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
};

// Pre-save hook to set expiration date when approved
accessRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.expiresAt) {
    this.expiresAt = this.calculateExpiration();
    this.approvedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'rejected' && !this.rejectedAt) {
    this.rejectedAt = new Date();
  }
  next();
});

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);

export default AccessRequest;

