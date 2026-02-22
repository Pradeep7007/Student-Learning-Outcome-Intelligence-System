const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  semester: String,
  department: String,
  rollno: {
    type: String,
    required: true,
    unique: true
  },
  dob: Date
}, { timestamps: true });

// Ensure name is stored in uppercase here too
studentSchema.pre('save', async function() {
  if (this.name) {
    this.name = this.name.toUpperCase();
  }
});

module.exports = mongoose.model('Student', studentSchema);
