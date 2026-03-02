import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import HealthRecord from '../models/HealthRecord.model.js';
import AccessRequest from '../models/AccessRequest.model.js';
import ActivityLog from '../models/ActivityLog.model.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthconnect');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await HealthRecord.deleteMany({});
    await AccessRequest.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Cleared existing data');

    // Create sample patients
    const patient1 = await User.create({
      name: 'John Smith',
      email: 'patient@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'patient',
      patientId: 'P-12345',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-15'),
      address: '123 Main St, City, State',
    });

    const patient2 = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'patient',
      patientId: 'P-23456',
      phone: '+1234567891',
      dateOfBirth: new Date('1985-05-20'),
      address: '456 Oak Ave, City, State',
    });

    // Create sample doctors
    const doctor1 = await User.create({
      name: 'Dr. Sarah Chen',
      email: 'doctor@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialty: 'Cardiology',
      hospital: 'City General Hospital',
      licenseNumber: 'MD12345',
    });

    const doctor2 = await User.create({
      name: 'Dr. Michael Lee',
      email: 'michael@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'doctor',
      specialty: 'Internal Medicine',
      hospital: 'Metro Health Center',
      licenseNumber: 'MD67890',
    });

    console.log('Created users');

    // Create sample health records for patient1
    const record1 = await HealthRecord.create({
      patient: patient1._id,
      name: 'Complete Blood Count (CBC)',
      type: 'lab',
      filePath: 'uploads/sample-cbc.pdf',
      fileName: 'cbc-report.pdf',
      fileSize: 245000,
      mimeType: 'application/pdf',
      description: 'Complete blood count test results',
      accessStatus: 'shared',
      sharedWith: [{
        doctor: doctor1._id,
        accessGrantedAt: new Date(),
      }],
      tags: ['lab', 'blood test'],
    });

    const record2 = await HealthRecord.create({
      patient: patient1._id,
      name: 'Blood Pressure Medication',
      type: 'prescription',
      filePath: 'uploads/sample-prescription.pdf',
      fileName: 'prescription.pdf',
      fileSize: 128000,
      mimeType: 'application/pdf',
      description: 'Blood pressure medication prescription',
      accessStatus: 'shared',
      sharedWith: [{
        doctor: doctor1._id,
        accessGrantedAt: new Date(),
      }],
      tags: ['prescription', 'medication'],
    });

    const record3 = await HealthRecord.create({
      patient: patient1._id,
      name: 'Chest X-Ray',
      type: 'scan',
      filePath: 'uploads/sample-xray.jpg',
      fileName: 'chest-xray.jpg',
      fileSize: 2400000,
      mimeType: 'image/jpeg',
      description: 'Chest X-Ray scan',
      accessStatus: 'private',
      tags: ['scan', 'xray'],
    });

    const record4 = await HealthRecord.create({
      patient: patient1._id,
      name: 'Annual Physical Exam',
      type: 'report',
      filePath: 'uploads/sample-physical.pdf',
      fileName: 'physical-exam.pdf',
      fileSize: 512000,
      mimeType: 'application/pdf',
      description: 'Annual physical examination report',
      accessStatus: 'shared',
      sharedWith: [
        {
          doctor: doctor1._id,
          accessGrantedAt: new Date(),
        },
        {
          doctor: doctor2._id,
          accessGrantedAt: new Date(),
        },
      ],
      tags: ['report', 'physical'],
      metadata: {
        uploadDate: new Date(),
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        accessCount: 2
      }
    });

    // Create records for patient2
    await HealthRecord.create({
      patient: patient2._id,
      name: 'Blood Glucose Test',
      type: 'lab',
      filePath: 'uploads/sample-glucose.pdf',
      fileName: 'glucose-test.pdf',
      fileSize: 180000,
      mimeType: 'application/pdf',
      description: 'Blood glucose test results',
      accessStatus: 'shared',
      sharedWith: [{
        doctor: doctor1._id,
        accessGrantedAt: new Date(),
      }],
      tags: ['lab', 'diabetes'],
    });

    // Create more recent records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 15);

    await HealthRecord.create({
      patient: patient1._id,
      name: 'Lipid Panel',
      type: 'lab',
      filePath: 'uploads/sample-lipid.pdf',
      fileName: 'lipid-panel.pdf',
      fileSize: 180000,
      mimeType: 'application/pdf',
      description: 'Lipid panel test results',
      accessStatus: 'private',
      tags: ['lab'],
      createdAt: thirtyDaysAgo,
    });

    console.log('Created health records');

    // Create access requests
    const accessRequest1 = await AccessRequest.create({
      doctor: doctor2._id,
      patient: patient1._id,
      reason: 'Follow-up consultation for annual physical examination results',
      duration: '30 days',
      status: 'pending',
    });

    const accessRequest2 = await AccessRequest.create({
      doctor: doctor1._id,
      patient: patient1._id,
      reason: 'Routine cardiac checkup and ECG review',
      duration: '7 days',
      status: 'approved',
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Create more access requests for doctor1
    const accessRequest3 = await AccessRequest.create({
      doctor: doctor1._id,
      patient: patient2._id,
      reason: 'Diabetes management consultation',
      duration: '30 days',
      status: 'approved',
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    });

    console.log('Created access requests');

    // Create activity logs
    await ActivityLog.create({
      user: patient1._id,
      action: 'view',
      entityType: 'healthRecord',
      entityId: record1._id,
      description: 'Blood Test Results viewed',
      actor: 'Dr. Sarah Chen',
      targetUser: doctor1._id,
      metadata: {
        recordType: 'lab',
        fileName: 'cbc-report.pdf',
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    await ActivityLog.create({
      user: patient1._id,
      action: 'upload',
      entityType: 'healthRecord',
      entityId: record3._id,
      description: 'X-Ray Report uploaded',
      actor: patient1.name,
      metadata: {
        recordType: 'scan',
        fileName: 'chest-xray.jpg',
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    });

    await ActivityLog.create({
      user: patient1._id,
      action: 'approve',
      entityType: 'accessRequest',
      entityId: accessRequest2._id,
      description: 'Access granted by John Smith',
      actor: 'Patient Approval',
      targetUser: doctor1._id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    });

    await ActivityLog.create({
      user: patient1._id,
      action: 'view',
      entityType: 'healthRecord',
      entityId: record4._id,
      description: "Reviewed John Smith's MRI scan",
      actor: 'You',
      targetUser: doctor1._id,
      metadata: {
        recordType: 'report',
        fileName: 'physical-exam.pdf',
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    // Add activity log for doctor viewing records
    await ActivityLog.create({
      user: doctor1._id,
      action: 'view',
      entityType: 'healthRecord',
      entityId: record1._id,
      description: "Viewed John Smith's lab results",
      actor: 'You',
      metadata: {
        recordType: 'lab',
        fileName: 'cbc-report.pdf',
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    console.log('Created activity logs');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Patient: patient@example.com / password123');
    console.log('Doctor: doctor@example.com / password123');
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => {
  seedDatabase();
});

