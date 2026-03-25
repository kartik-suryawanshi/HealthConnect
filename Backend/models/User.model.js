import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: [true, 'Please specify a role']
  },
  // Patient specific fields
  patientId: {
    type: String,
    unique: true,
    sparse: true
  },
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  // Doctor specific fields
  licenseNumber: {
    type: String
  },
  specialty: {
    type: String
  },
  hospital: {
    type: String
  },
  // Common fields
  profilePicture: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate patient ID before saving (for patients only)
userSchema.pre('save', async function(next) {
  if (this.role === 'patient' && !this.patientId) {
    let patientId;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate format: P-XXXXX (5 random digits)
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      patientId = `P-${randomNum}`;
      
      const UserModel = mongoose.model('User');
      const existing = await UserModel.findOne({ patientId });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.patientId = patientId;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Virtual for lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model('User', userSchema);

export default User;

