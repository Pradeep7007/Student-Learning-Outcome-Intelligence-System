const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

// @route   POST api/auth/signup
// @desc    Register user and specific role details
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, semester, department, rollno, dob } = req.body;

    // 1. Check if user already exists in User collection
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create the base User record
    user = new User({
      name, // Uppercased by model pre-save hook
      email,
      password, // Hashed by model pre-save hook
      role
    });

    const savedUser = await user.save();

    // 3. Create role-specific record
    if (role === 'student') {
      const student = new Student({
        userId: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        semester,
        department,
        rollno,
        dob
      });
      await student.save();
    } else if (role === 'staff') {
      const staff = new Staff({
        userId: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        department
      });
      await staff.save();
    } else if (role === 'admin') {
      const admin = new Admin({
        userId: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      });
      await admin.save();
    }

    res.status(201).json({ 
      message: 'User and role-specific details registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Role check
    if (role && user.role !== role) {
      return res.status(400).json({ message: `Role mismatch. This account is registered as ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          message: 'Login successful'
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    res.json({ message: 'Token generated', token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password; 
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
