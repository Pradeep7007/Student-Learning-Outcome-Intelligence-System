const mongoose = require('mongoose');

const StaffStudentInfoSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentDetails', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // optional
  rollNo: { type: String },
  department: { type: String },

  totalDaysPresent: { type: Number, default: 0 },
  leaveDaysCount: { type: Number, default: 0 },

  subjects: [
    {
      name: { type: String, required: true },
      code: { type: String },
      attendanceHours: { type: Number, default: 0 },
      internalMarks: { type: Number, default: 0 },
      assignmentMarks: { type: Number, default: 0 },
      predictedGrade: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StaffStudentInfo', StaffStudentInfoSchema);
