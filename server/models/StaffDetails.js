const mongoose = require('mongoose');

const StaffDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true, collection: 'staff_details' }
);

module.exports = mongoose.model('StaffDetails', StaffDetailsSchema);
