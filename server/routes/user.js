const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

const AcademicRecord = require('../models/AcademicRecord');

// @route   GET api/user/profile
// @desc    Get current user profile details
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ userId: user.id });
    } else if (user.role === 'staff') {
      profileData = await Staff.findOne({ userId: user.id });
    } else if (user.role === 'admin') {
      profileData = await Admin.findOne({ userId: user.id });
    }

    res.json({ user, profile: profileData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/students-in-dept
// @desc    Get all students in specific department
router.get('/students-in-dept', auth, async (req, res) => {
  try {
    const staffProfile = await Staff.findOne({ userId: req.user.id });
    if (!staffProfile) return res.status(404).json({ message: 'Staff profile not found' });

    const students = await Student.find({ department: staffProfile.department });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/my-academic-record
// @desc    Get student's own academic record
router.get('/my-academic-record', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const record = await AcademicRecord.findOne({ rollno: student.rollno, semester: student.semester });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/user/academic-record
// @desc    Save or update student academic record
router.post('/academic-record', auth, async (req, res) => {
  try {
    const { studentName, rollno, semester, department, subjects, previousSemCGPA, attendancePercentage } = req.body;

    let record = await AcademicRecord.findOne({ rollno, semester });

    if (record) {
      record.subjects = subjects;
      record.staffName = req.user.name;
      record.studentName = studentName;
      record.previousSemCGPA = previousSemCGPA;
      record.attendancePercentage = attendancePercentage;
      await record.save();
    } else {
      record = new AcademicRecord({
        studentName,
        rollno,
        staffName: req.user.name,
        semester,
        department,
        subjects,
        previousSemCGPA,
        attendancePercentage
      });
      await record.save();
    }

    res.json({ message: 'Academic record saved successfully', record });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/stats
// @desc    Get stats (filtered by department for staff, global for admin)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let filter = {};

    // If staff, filter by their own department
    if (req.user.role === 'staff') {
      const staffProfile = await Staff.findOne({ userId: req.user.id });
      if (staffProfile && staffProfile.department) {
        filter.department = staffProfile.department;
      } else {
        // If no department found (shouldn't happen with valid data), return empty stats
        return res.json({ totalStudents: 0, deptStats: [] });
      }
    }

    const totalStudents = await Student.countDocuments(filter);
    
    // Aggregate students by department with filter
    const matchStage = Object.keys(filter).length > 0 ? [{ $match: filter }] : [];
    const deptStats = await Student.aggregate([
      ...matchStage,
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    res.json({ totalStudents, deptStats });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
