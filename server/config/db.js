const mongoose = require('mongoose');

module.exports = function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/slois';
  return mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error', err));
};
