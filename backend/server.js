require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const citizenRoutes = require('./src/routes/citizens');
const applicationRoutes = require('./src/routes/applications');
const verificationRoutes = require('./src/routes/verification');
const notificationRoutes = require('./src/routes/notifications');
const policeFlagRoutes = require('./src/routes/policeFlags');
const auditLogRoutes = require('./src/routes/auditLog');
const ussdRoutes = require('./src/routes/ussd');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Boitsibiso National ID Hub API' }));

app.use('/api/auth', authRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/verification-requests', verificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/police-flags', policeFlagRoutes);
app.use('/api/audit-log', auditLogRoutes);
app.use('/api/ussd', ussdRoutes);

// Basic centralized error handler so unexpected exceptions don't leak stack traces.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Boitsibiso National ID Hub API listening on http://localhost:${PORT}`);
});
