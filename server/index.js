require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connect = require('./config/db');


const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors());
app.use(express.json());

// connect to DB
connect();


app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/staff', require('./routes/staff'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
