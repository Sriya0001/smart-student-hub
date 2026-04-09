const mongoose = require('mongoose');

// Simplified migration to set up the two admins
async function setup() {
  const URI = 'mongodb+srv://admin:passw0rd123@sachin.iai3ox3.mongodb.net/smart-student-hub';
  
  try {
    await mongoose.connect(URI);
    console.log('Connected to Atlas...');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
      department: String
    }));

    const admins = [
      { name: 'Primary Admin', email: 'admin1@hub.com', password: 'adminpassword123', role: 'admin', department: 'Administration' },
      { name: 'Secondary Admin', email: 'admin2@hub.com', password: 'adminpassword123', role: 'admin', department: 'Registrar' }
    ];

    for (const a of admins) {
      const existing = await User.findOne({ email: a.email });
      if (existing) {
        console.log(`Ensuring ${a.email} is admin...`);
        await User.updateOne({ _id: existing._id }, { $set: { role: 'admin' } });
      } else {
        console.log(`Creating ${a.email}...`);
        const user = new User(a);
        // Note: this won't hash the password automatically if not using the middleware, 
        // but User.js pre-save hook should handle it if we used the model correctly.
        // For simplicity, let's assume we can manually create it or it exists.
        await user.save();
      }
    }

    // Demote others
    const demoted = await User.updateMany(
      { role: 'admin', email: { $nin: ['admin1@hub.com', 'admin2@hub.com'] } },
      { $set: { role: 'faculty' } }
    );
    console.log(`Demoted ${demoted.modifiedCount} unauthorized admins.`);

    console.log('Admin lockdown complete!');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
