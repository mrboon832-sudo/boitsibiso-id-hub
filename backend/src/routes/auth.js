const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { signToken } = require('../utils/jwt');
const { writeAudit } = require('../middleware/audit');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

function sanitizeUser(u) {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    department: u.department,
    nationalId: u.national_id,
    fullName: u.full_name,
    phone: u.phone,
    language: u.language,
    largeText: !!u.large_text,
    mustChangePassword: !!u.must_change_password,
  };
}

// POST /api/auth/login - used by both the web app and the USSD simulator
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await db.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username.trim()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    await writeAudit({
      actorUser: username,
      actorName: username,
      actorRole: 'unknown',
      action: 'LOGIN_FAILED',
      details: { reason: 'invalid credentials' },
    });
    return res.status(401).json({ error: 'Incorrect ID/username or password.' });
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role,
    department: user.department,
    nationalId: user.national_id,
    fullName: user.full_name,
  });

  await writeAudit({
    actorUser: user.username,
    actorName: user.full_name,
    actorRole: user.role,
    action: 'LOGIN_SUCCESS',
    nationalId: user.national_id,
    department: user.department,
  });

  res.json({ token, user: sanitizeUser(user) });
}));

// GET /api/auth/me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: sanitizeUser(user) });
}));

// PUT /api/auth/preferences - accessibility settings (language, large text)
router.put('/preferences', requireAuth, asyncHandler(async (req, res) => {
  const { language, largeText } = req.body || {};
  await db.run('UPDATE users SET language = COALESCE(?, language), large_text = ? WHERE id = ?', [language || null, largeText ? 1 : 0, req.user.id]);
  const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: sanitizeUser(user) });
}));

module.exports = router;
