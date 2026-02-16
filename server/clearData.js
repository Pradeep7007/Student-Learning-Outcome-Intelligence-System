const mongoose = require('mongoose');
require('dotenv').config();
const connect = require('./config/db');
const StaffStudentInfo = require('./models/StaffStudentInfo');

const clearData = async () => {
  await connect();
  try {
    await StaffStudentInfo.deleteMany({});
    console.log('Cleared old StaffStudentInfo data');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearData();
