const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-records');
  console.log('Connected to DB...');

  const students = await User.find({ role: 'student' });
  const faculty = await User.find({ role: 'faculty' });

  console.log(`Found ${students.length} students and ${faculty.length} faculty members.`);

  for (const student of students) {
    if (student.mentor) continue; // Skip if already assigned

    const mentor = faculty.find(f => f.department === student.department);
    if (mentor) {
      student.mentor = mentor._id;
      await student.save();
      console.log(`Assigned Student ${student.name} to Mentor ${mentor.name} (${student.department})`);
    } else {
      console.log(`No mentor found for Student ${student.name} in department ${student.department}`);
    }
  }

  console.log('Seeding complete.');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
