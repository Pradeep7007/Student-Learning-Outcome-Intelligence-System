const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  studentName: String,
  rollno: {
    type: String,
    required: true
  },
  staffName: String,
  semester: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [
    {
      name: String,
      internalMark: Number,
      assignmentMark: Number,
      practicalMark: Number
    }
  ],
  previousSemCGPA: Number,
  attendancePercentage: Number
}, { timestamps: true });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);
