const mongoose = require('mongoose');

const AdminDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true, collection: 'admin_details' }
);

module.exports = mongoose.model('AdminDetails', AdminDetailsSchema);
