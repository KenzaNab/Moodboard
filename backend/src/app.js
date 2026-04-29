require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { initDB } = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/boards', require('./routes/boards'));
app.use('/api/items', require('./routes/items'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'MoodBoard' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

initDB();
app.listen(PORT, () => console.log(`MoodBoard API on http://localhost:${PORT}`));
module.exports = app;
