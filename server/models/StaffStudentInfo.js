const mongoose = require('mongoose');

const StaffStudentInfoSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, to track who entered it
  rollNo: { type: String },
  department: { type: String },
  
  // Attendance and academic details
  totalDaysPresent: { type: Number, default: 0 },
  leaveDaysCount: { type: Number, default: 0 },
  
  // Array of subjects with specific details
  subjects: [
    {
      name: { type: String, required: true }, // e.g., "Fundamentals of Computing"
      code: { type: String }, // Optional subject code
      attendanceHours: { type: Number, default: 0 }, // Max 120
      internalMarks: { type: Number, default: 0 }, // Max 100 usually, or 20/40
      assignmentMarks: { type: Number, default: 0 },
      predictedGrade: { type: String } // stored from ML model
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StaffStudentInfo', StaffStudentInfoSchema);
