const express = require('express');
const router = express.Router();
const StaffStudentInfo = require('../models/StaffStudentInfo');

// GET all staff-student records (with student info populated)
router.get('/', async (req, res) => {
  try {
    const records = await StaffStudentInfo.find()
      .populate('studentId', 'name rollno department')
      .exec();

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST insert new staff-student record
router.post('/', async (req, res) => {
  try {
    const { studentId, rollNo, department, subjects } = req.body;

    const newRecord = new StaffStudentInfo({
      studentId,
      rollNo,
      department,
      subjects
    });

    await newRecord.save();

    // populate student info for response
    const populatedRecord = await newRecord.populate('studentId', 'name rollno department');

    res.status(201).json(populatedRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
