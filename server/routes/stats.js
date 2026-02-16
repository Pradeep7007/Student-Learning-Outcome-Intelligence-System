const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentDetails = require('../models/StudentDetails');

// Get total student count
router.get('/students/count', async (req, res) => {
  try {
    const count = await StudentDetails.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department-wise student count
router.get('/students/department-count', async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ];
    const result = await StudentDetails.aggregate(pipeline);
    res.json({ departments: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
