const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const admins = [
  {
    name: 'Primary Admin',
    email: 'admin1@hub.com',
    password: 'adminpassword123',
    role: 'admin',
    department: 'Administration'
  },
  {
    name: 'Secondary Admin',
    email: 'admin2@hub.com',
    password: 'adminpassword123',
    role: 'admin',
    department: 'Registrar'
  }
];

async function initAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-records');
    console.log('Connected to MongoDB for Admin Initialization...');

    // 1. Demote any other user who says they are an admin
    const otherAdmins = await User.find({ 
      role: 'admin', 
      email: { $nin: admins.map(a => a.email) } 
    });
    
    if (otherAdmins.length > 0) {
      console.log(`Demoting ${otherAdmins.length} unauthorized admin accounts to faculty...`);
      await User.updateMany(
        { role: 'admin', email: { $nin: admins.map(a => a.email) } },
        { $set: { role: 'faculty' } }
      );
    }

    // 2. Ensure the two authorized admins exist
    for (const adminData of admins) {
      const existing = await User.findOne({ email: adminData.email });
      if (existing) {
        console.log(`Updating existing admin: ${adminData.email}`);
        existing.role = 'admin';
        // We don't overwrite password here to avoid resetting personal passwords if they were changed
        await existing.save();
      } else {
        console.log(`Creating new admin account: ${adminData.email}`);
        const newAdmin = new User(adminData);
        await newAdmin.save();
      }
    }

    console.log('Admin system strictly enforced. Exactly 2 admins are now authorized.');
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err.message);
    process.exit(1);
  }
}

initAdmins();
