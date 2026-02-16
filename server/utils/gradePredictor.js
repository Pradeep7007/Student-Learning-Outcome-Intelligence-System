/**
 * Grade Predictor Utility
 */
const calculateScore = (attendanceHours, internalMarks, assignmentMarks) => {
    // 1. Attendance (20% weight)
    // Input is hours out of 120.
    const attPct = Math.min((attendanceHours / 120) * 100, 100);

    // 2. Internal Marks (40% weight)
    // Input assumed 0-100
    const intPct = parseFloat(internalMarks) || 0; 

    // 3. Assignment Marks (40% weight)
    // Input assumed 0-100
    const assPct = parseFloat(assignmentMarks) || 0;

    // Weighted Score
    return (attPct * 0.2) + (intPct * 0.4) + (assPct * 0.4);
};

const predictGrade = (attendanceHours, internalMarks, assignmentMarks) => {
    const score = calculateScore(attendanceHours, internalMarks, assignmentMarks);

    if (score >= 90) return 'O';
    if (score >= 80) return 'A+';
    if (score >= 70) return 'A';
    if (score >= 60) return 'B+';
    if (score >= 50) return 'B';
    return 'RA';
};

module.exports = { predictGrade };
