const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  role: { type: String, default: 'staff' },
  // Add more staff-specific fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
