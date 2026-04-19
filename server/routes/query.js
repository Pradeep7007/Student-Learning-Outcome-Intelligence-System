const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MarkQuery = require('../models/MarkQuery');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const AcademicRecord = require('../models/AcademicRecord');
const User = require('../models/User');

// @route   POST api/query/create
// @desc    Create a new mark discrepancy query
router.post('/create', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { subjectName, issueType, currentMarks, expectedMarks, studentComment } = req.body;

    // Find the record to identify the staff who uploaded it
    const record = await AcademicRecord.findOne({ rollno: student.rollno, semester: student.semester });
    
    const newQuery = new MarkQuery({
      studentId: req.user.id,
      studentName: student.name,
      rollno: student.rollno,
      semester: student.semester,
      subjectName,
      issueType,
      currentMarks,
      expectedMarks,
      studentComment,
      staffName: record ? record.staffName : 'Unknown' // Default or based on record
    });

    await newQuery.save();
    res.json(newQuery);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/query/my-queries
// @desc    Get all queries raised by the student
router.get('/my-queries', auth, async (req, res) => {
  try {
    const queries = await MarkQuery.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/query/staff-queries
// @desc    Get all queries assigned to staff (based on their department or name)
router.get('/staff-queries', auth, async (req, res) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    // For simplicity, we filter by staffName or department. 
    // Usually, queries are for subjects the staff handles.
    // Here we'll show queries for students in their department.
    const studentsInDept = await Student.find({ department: staff.department }).select('userId');
    const studentIds = studentsInDept.map(s => s.userId);

    const queries = await MarkQuery.find({ studentId: { $in: studentIds } }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/query/update/:id
// @desc    Update query status and add staff comment
router.patch('/update/:id', auth, async (req, res) => {
  try {
    const { status, staffComment } = req.body;
    let query = await MarkQuery.findById(req.params.id);

    if (!query) return res.status(404).json({ message: 'Query not found' });

    query.status = status;
    query.staffComment = staffComment;
    const staffUser = await User.findById(req.user.id);
    query.staffName = staffUser ? staffUser.name : 'Unknown Staff';

    await query.save();
    res.json(query);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
