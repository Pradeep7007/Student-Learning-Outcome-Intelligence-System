const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

const AcademicRecord = require('../models/AcademicRecord');
const MLPredict = require('../models/MLPredict');

// Standalone prediction logic (Weighted Average)
const calculatePrediction = (academic) => {
  if (!academic || !academic.subjects || academic.subjects.length === 0) return 0;
  
  // Calculate average of current marks (out of 100 per subject)
  const totalMarks = academic.subjects.reduce((sum, sub) => {
    return sum + (sub.internalMark + sub.assignmentMark + sub.practicalMark);
  }, 0);
  
  const currentAvg = totalMarks / academic.subjects.length;
  const currentGPA = (currentAvg / 100) * 10;
  
  // Weighted prediction: 60% current performance, 40% previous CGPA
  const predicted = (currentGPA * 0.6) + (academic.previousSemCGPA * 0.4);
  
  // Return rounded to 2 decimal places, max 10.0
  return Math.min(10.0, Math.round(predicted * 100) / 100);
};

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

    const students = await Student.find({ department: staffProfile.department }).lean();
    
    const rollnos = students.map(s => s.rollno);
    const predictions = await MLPredict.find({ rollno: { $in: rollnos } }).lean();
    const records = await AcademicRecord.find({ rollno: { $in: rollnos } }).lean();

    const enrichedStudents = students.map(student => {
      // Find the prediction matching rollno and semester
      const pred = predictions.find(p => p.rollno === student.rollno && p.semester === student.semester);
      const record = records.find(r => r.rollno === student.rollno && r.semester === student.semester);
      
      return { 
        ...student, 
        predictedCGPA: pred ? pred.predictedCGPA : null,
        academicRecord: record || null
      };
    });

    res.json(enrichedStudents);
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

// @route   GET api/user/my-prediction
// @desc    Get student's ML outcome prediction
router.get('/my-prediction', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const prediction = await MLPredict.findOne({ rollno: student.rollno, semester: student.semester });
    res.json(prediction);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/user/academic-record
// @desc    Save or update student academic record and trigger ML prediction
router.post('/academic-record', auth, async (req, res) => {
  try {
    const { studentName, rollno, email, semester, department, subjects, previousSemCGPA, attendancePercentage } = req.body;

    let record = await AcademicRecord.findOne({ rollno, semester });

    if (record) {
      record.subjects = subjects;
      record.staffName = req.user.name;
      record.studentName = studentName;
      record.email = email;
      record.previousSemCGPA = previousSemCGPA;
      record.attendancePercentage = attendancePercentage;
      await record.save();
    } else {
      record = new AcademicRecord({
        studentName,
        rollno,
        email,
        staffName: req.user.name,
        semester,
        department,
        subjects,
        previousSemCGPA,
        attendancePercentage
      });
      await record.save();
    }

    // TRIGGER ML PREDICTION
    const predictedVal = calculatePrediction(record);
    
    // Save to MLPredict schema
    let prediction = await MLPredict.findOne({ rollno, semester });
    if (prediction) {
      prediction.predictedCGPA = predictedVal;
      prediction.studentName = studentName;
      prediction.email = email;
      await prediction.save();
    } else {
      prediction = new MLPredict({
        studentName,
        email,
        rollno,
        semester,
        predictedCGPA: predictedVal
      });
      await prediction.save();
    }

    res.json({ message: 'Academic record saved and ML prediction updated!', record, prediction });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/student-academic/:rollno
// @desc    Get student academic record and prediction by rollno (Staff/Admin only)
router.get('/student-academic/:rollno', auth, async (req, res) => {
  try {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find student to get their current semester
    const student = await Student.findOne({ rollno: req.params.rollno });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const record = await AcademicRecord.findOne({ rollno: req.params.rollno, semester: student.semester });
    const prediction = await MLPredict.findOne({ rollno: req.params.rollno, semester: student.semester });

    res.json({ student, record, prediction });
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
    const totalStaff = await Staff.countDocuments(filter);
    
    const matchStage = Object.keys(filter).length > 0 ? [{ $match: filter }] : [];
    
    const deptStats = await Student.aggregate([
      ...matchStage,
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);
    
    const staffStats = await Staff.aggregate([
      ...matchStage,
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const merged = {};
    deptStats.forEach(d => merged[d._id] = { _id: d._id || 'Unknown', students: d.count, staff: 0 });
    staffStats.forEach(s => {
      const id = s._id || 'Unknown';
      if (!merged[id]) merged[id] = { _id: id, students: 0, staff: 0 };
      merged[id].staff = s.count;
    });

    res.json({ totalStudents, totalStaff, deptStats: Object.values(merged) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/user/all-users
// @desc    Get all users with their profile data (Admin only)
router.get('/all-users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find().select('-password');
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let profile = null;
      if (user.role === 'student') {
        profile = await Student.findOne({ userId: user._id });
      } else if (user.role === 'staff') {
        profile = await Staff.findOne({ userId: user._id });
      } else if (user.role === 'admin') {
        profile = await Admin.findOne({ userId: user._id });
      }
      return { ...user.toObject(), profile };
    }));

    res.json(enrichedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/update/:id
// @desc    Update user and profile (Admin only)
router.put('/update/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, email, semester, department, rollno, dob } = req.body;
    
    // Find user
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update base user
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    // Update role-specific profile
    if (user.role === 'student') {
      let profile = await Student.findOne({ userId: user._id });
      if (profile) {
        if (name) profile.name = name;
        if (email) profile.email = email;
        if (semester) profile.semester = semester;
        if (department) profile.department = department;
        if (rollno) profile.rollno = rollno;
        if (dob) profile.dob = dob;
        await profile.save();

        // Also update AcademicRecord and MLPredict for consistency
        if (name || email) {
          const updateFields = {};
          if (name) updateFields.studentName = name;
          if (email) updateFields.email = email;
          
          await AcademicRecord.updateMany({ rollno: profile.rollno }, { $set: updateFields });
          await MLPredict.updateMany({ rollno: profile.rollno }, { $set: updateFields });
        }
      }
    } else if (user.role === 'staff') {
      let profile = await Staff.findOne({ userId: user._id });
      if (profile) {
        if (name) profile.name = name;
        if (email) profile.email = email;
        if (department) profile.department = department;
        await profile.save();
      }
    } else if (user.role === 'admin') {
      let profile = await Admin.findOne({ userId: user._id });
      if (profile) {
        if (name) profile.name = name;
        if (email) profile.email = email;
        await profile.save();
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/user/delete/:id
// @desc    Delete user and profile (Admin only)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete role-specific profile
    if (user.role === 'student') {
      await Student.deleteOne({ userId: user._id });
      // Also delete academic records and predictions?
      await AcademicRecord.deleteMany({ email: user.email });
      await MLPredict.deleteMany({ email: user.email });
    } else if (user.role === 'staff') {
      await Staff.deleteOne({ userId: user._id });
    } else if (user.role === 'admin') {
      await Admin.deleteOne({ userId: user._id });
    }

    // Delete base user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/modify-password/:id
// @desc    Modify user password (Admin only)
router.put('/modify-password/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password; // Will be hashed by pre-save hook
    await user.save();

    res.json({ message: 'Password modified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

