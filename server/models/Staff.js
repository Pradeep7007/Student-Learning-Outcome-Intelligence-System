const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
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
  password: String,
  department: String, // Staff might also have a department
  staffId: String
}, { timestamps: true });

staffSchema.pre('save', async function() {
  if (this.name) {
    this.name = this.name.toUpperCase();
  }
});

module.exports = mongoose.model('Staff', staffSchema);
