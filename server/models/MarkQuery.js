const mongoose = require('mongoose');

const markQuerySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: String,
  rollno: String,
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staffName: String,
  semester: String,
  subjectName: {
    type: String,
    required: true
  },
  issueType: {
    type: String,
    enum: ['Internal', 'Assignment', 'Practical'],
    required: true
  },
  currentMarks: Number,
  expectedMarks: Number,
  studentComment: String,
  staffComment: String,
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('MarkQuery', markQuerySchema);
