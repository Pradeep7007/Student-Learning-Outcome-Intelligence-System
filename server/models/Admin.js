const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
  permissions: [String]
}, { timestamps: true });

adminSchema.pre('save', async function() {
  if (this.name) {
    this.name = this.name.toUpperCase();
  }
});

module.exports = mongoose.model('Admin', adminSchema);
