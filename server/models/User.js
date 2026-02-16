const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    year: { type: String }, // Only for students
    department: { type: String }, // Only for students
    rollno: { type: String }, // Only for students
    resetToken: { type: String },
    resetExpires: { type: Date }
  },
  { timestamps: true }
);

// Pre-save hook to enforce uppercase
UserSchema.pre('save', function(next) {
  if (this.name) this.name = this.name.toUpperCase();
  if (this.email) this.email = this.email.toUpperCase();
  next();
});

module.exports = mongoose.model('User', UserSchema);
