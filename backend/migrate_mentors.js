const mongoose = require('mongoose');

// Mini-migration script to assign mentors to existing students
async function migrate() {
  try {
    const MONGODB_URI = 'mongodb+srv://studentrecords:records123@cluster0.p7102.mongodb.net/records?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database.');

    // Define inline schemas to avoid dependency issues
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      role: String,
      department: String,
      mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }));

    const students = await User.find({ role: 'student' });
    const faculty = await User.find({ role: 'faculty' });

    console.log(`Found ${students.length} students and ${faculty.length} faculty.`);

    for (const student of students) {
      if (student.mentor) {
        console.log(`Student ${student.name} already has a mentor.`);
        continue;
      }

      const mentor = faculty.find(f => f.department === student.department);
      if (mentor) {
        await User.findByIdAndUpdate(student._id, { $set: { mentor: mentor._id } });
        console.log(`Successfully assigned Student ${student.name} to Mentor ${mentor.name} in department ${student.department}`);
      } else {
        console.log(`No mentor available for Student ${student.name} in department ${student.department}`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
