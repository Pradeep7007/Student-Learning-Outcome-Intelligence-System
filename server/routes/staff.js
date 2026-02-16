const express = require('express');
const router = express.Router();
const StaffStudentInfo = require('../models/StaffStudentInfo');
const { predictGrade } = require('../utils/gradePredictor');

// POST: Insert or Update Student Data (BULK 6 Subjects)
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      rollNo,
      department,
      subjects // Array of objects
    } = req.body;

    if (!studentId || !subjects || subjects.length !== 6) {
      return res.status(400).json({ message: 'All 6 subjects are mandatory.' });
    }

    // Calculate aggregated totals
    // Fixed totals as per requirement: 120 days, 720 hours
    const FIXED_TOTAL_DAYS = 120;
    
    // Process subjects to add prediction
    const processedSubjects = subjects.map(sub => {
        // Simple ML logic integration
        const prediction = predictGrade(sub.attendanceHours, sub.internalMarks, sub.assignmentMarks);
        return {
            ...sub,
            predictedGrade: prediction
        };
    });

    // Calculate total present days based on average attendance across subjects (simplified logic)
    // Or requirement says "Total Days = 120". Let's stick to fixed total.
    // We can sum attendance hours and divide by 6 hours/day maybe?
    // "Total Hours = 720".
    
    const totalHoursPresent = processedSubjects.reduce((acc, curr) => acc + (parseInt(curr.attendanceHours) || 0), 0);
    const totalDaysPresent = Math.round(totalHoursPresent / 6); // Assuming 6 hours per day
    const leaveDaysCount = FIXED_TOTAL_DAYS - totalDaysPresent;

    let record = await StaffStudentInfo.findOne({ studentId });

    if (!record) {
      record = new StaffStudentInfo({
        studentId,
        rollNo,
        department,
        totalDaysPresent,
        leaveDaysCount,
        subjects: processedSubjects
      });
    } else {
        record.rollNo = rollNo;
        record.department = department;
        record.totalDaysPresent = totalDaysPresent;
        record.leaveDaysCount = leaveDaysCount;
        record.subjects = processedSubjects;
    }

    await record.save();
    return res.json({ message: 'Academic data saved successfully', record });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET: Retrieve specific student record
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const record = await StaffStudentInfo.findOne({ studentId }).populate('studentId', 'name email rollno department');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Retrieve all student records (Sorted by Department)
router.get('/', async (req, res) => {
    try {
        const records = await StaffStudentInfo.find()
            .populate('studentId', 'name email rollno department')
            .sort({ department: 1, rollNo: 1 }); // Sort by Dept ASC, then RollNo ASC
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
