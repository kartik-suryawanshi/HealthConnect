import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthMetric from './models/HealthMetric.model.js';
import User from './models/User.model.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthconnect');
        console.log('MongoDB Connected');

        const patient = await User.findOne({ role: 'patient' });
        if (!patient) {
            console.log('No patient found in the database to seed metrics for.');
            process.exit(1);
        }

        const doctor = await User.findOne({ role: 'doctor' });
        const recorder = doctor ? doctor._id : patient._id;

        const dummyMetrics = [];
        const now = new Date();

        // Generate Blood Pressure Data (past 30 days)
        for (let i = 30; i >= 0; i -= 2) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const systolic = Math.floor(Math.random() * (140 - 110 + 1) + 110);
            const diastolic = Math.floor(Math.random() * (90 - 70 + 1) + 70);
            const severity = systolic > 130 || diastolic > 85 ? 'Elevated' : 'Normal';

            dummyMetrics.push({
                patient: patient._id,
                recordedBy: recorder,
                metricType: 'Blood Pressure',
                value: `${systolic}/${diastolic}`,
                severity: severity,
                contextReason: severity !== 'Normal' ? 'Routine checkup. Slightly high.' : 'Routine checkup',
                recordedAt: date
            });
        }

        // Generate Blood Sugar Data
        for (let i = 30; i >= 0; i -= 3) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const sugar = Math.floor(Math.random() * (120 - 80 + 1) + 80);
            const severity = sugar > 110 ? 'Elevated' : 'Normal';

            dummyMetrics.push({
                patient: patient._id,
                recordedBy: recorder,
                metricType: 'Blood Sugar',
                value: sugar.toString(),
                severity: severity,
                contextReason: 'Fasting blood sugar',
                recordedAt: date
            });
        }

        // Generate Heart Rate Data
        for (let i = 30; i >= 0; i -= 1) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const hr = Math.floor(Math.random() * (100 - 60 + 1) + 60);

            dummyMetrics.push({
                patient: patient._id,
                recordedBy: recorder,
                metricType: 'Heart Rate',
                value: hr.toString(),
                severity: hr > 95 ? 'Elevated' : 'Normal',
                recordedAt: date
            });
        }

        // Insert to DB
        await HealthMetric.deleteMany({ patient: patient._id }); // cleanup old tests if any
        await HealthMetric.insertMany(dummyMetrics);

        console.log(`Seeded ${dummyMetrics.length} health metrics for patient ${patient.name}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
