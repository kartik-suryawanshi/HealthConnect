import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['lab', 'prescription', 'scan', 'report'],
    required: [true, 'Document type is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  hash: {
    type: String, // SHA-256 hash
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isImmutable: {
    type: Boolean,
    default: false
  },
  accessStatus: {
    type: String,
    enum: ['private', 'shared'],
    default: 'private'
  },
  sharedWith: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessGrantedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    uploadDate: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date
    },
    accessCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
healthRecordSchema.index({ patient: 1, createdAt: -1 });
healthRecordSchema.index({ type: 1 });
healthRecordSchema.index({ accessStatus: 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

export default HealthRecord;

