const mongoose = require('mongoose');

const StaffStudentInfoSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  // Attendance and hours per subject
  subjects: [
    {
      name: { type: String, required: true },
      totalDaysPresent: { type: Number, default: 0 },
      leaveDays: { type: Number, default: 0 },
      totalHoursPresent: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StaffStudentInfo', StaffStudentInfoSchema);
