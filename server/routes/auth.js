const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentDetails = require('../models/StudentDetails');
const StaffDetails = require('../models/StaffDetails');
const AdminDetails = require('../models/AdminDetails');
const crypto = require('crypto');

// Signup - directly save credentials (no bcrypt as requested)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists.' });

    const user = new User({ name, email, role, password });
    await user.save();

    // also save into role-specific collection
    try {
      if (role === 'student') {
        const s = new StudentDetails({ name, email, password });
        await s.save();
      } else if (role === 'staff') {
        const s = new StaffDetails({ name, email, password });
        await s.save();
      } else if (role === 'admin') {
        const s = new AdminDetails({ name, email, password });
        await s.save();
      }
    } catch (e) {
      console.error('Role-specific save failed', e);
    }

    return res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login - direct password comparison
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'All fields are required.' });

    // check role-specific collection first
    let found = null;
    if (role === 'student') found = await StudentDetails.findOne({ email });
    else if (role === 'staff') found = await StaffDetails.findOne({ email });
    else if (role === 'admin') found = await AdminDetails.findOne({ email });

    // fallback to general User
    if (!found) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
      if (user.password !== password) return res.status(400).json({ message: 'Invalid credentials.' });
      return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    if (found.password !== password) return res.status(400).json({ message: 'Invalid credentials.' });

    return res.json({ message: 'Login successful', user: { id: found._id, name: found.name, email: found.email, role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - generate token and return it (no email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No user with that email.' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Return token to client (insecure but per request)
    return res.json({ message: 'Reset token generated', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'All fields are required.' });

    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

