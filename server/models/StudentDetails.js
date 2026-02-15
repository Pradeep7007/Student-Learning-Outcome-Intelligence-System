const mongoose = require('mongoose');

const StudentDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true, collection: 'student_details' }
);

module.exports = mongoose.model('StudentDetails', StudentDetailsSchema);
