const mongoose = require('mongoose');

const MLPredictSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  rollno: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  predictedCGPA: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MLPredict', MLPredictSchema);
