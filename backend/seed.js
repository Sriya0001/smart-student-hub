const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const bcrypt = require('bcrypt');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Success! Clearing existing records...');

        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Admin.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('Seeding student...');
        await Student.create({
            studentId: "S101",
            name: "Alex Dev",
            email: "student@app.com",
            password: hashedPassword,
            college: "Tech University",
            department: "Computer Science",
            year: 3,
            semester: 6,
            rollNumber: "CS-2026-001",
            cgpa: 8.94
        });

        console.log('Seeding teacher...');
        await Teacher.create({
            teacherId: "T101",
            name: "Dr. Smith",
            email: "faculty@app.com",
            password: hashedPassword,
            department: "Computer Science",
            college: "Tech University",
            designation: "Associate Professor",
            experience: 8
        });

        console.log('Seeding admin...');
        await Admin.create({
            adminId: "A101",
            name: "Principal Jones",
            email: "admin@app.com",
            password: hashedPassword,
            role: "admin",
            institution: "Tech University",
            department: "Management"
        });

        console.log('✅ SEEDED SUCCESSFULLY!');
        process.exit(0);

    } catch (err) {
        console.error('CRASH:', err.stack);
        process.exit(1);
    }
};

seedDB();
