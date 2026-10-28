const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { signToken } = require('../utils/jwt');
const { writeAudit } = require('../middleware/audit');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/auth/register - public citizen registration
router.post('/register', asyncHandler(async (req, res) => {
  const { nationalId, fullName, password, dob, gender, phone, language } = req.body || {};
  const normalizedNationalId = String(nationalId || '').trim();
  const normalizedName = String(fullName || '').trim().replace(/\s+/g, ' ');
  const normalizedLanguage = language === 'st' ? 'st' : 'en';

  if (!/^\d{13}$/.test(normalizedNationalId)) {
    return res.status(400).json({ error: 'National ID must contain exactly 13 digits.' });
  }
  if (normalizedName.length < 2 || normalizedName.length > 150) {
    return res.status(400).json({ error: 'Full name must be between 2 and 150 characters.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
  }
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return res.status(400).json({ error: 'Date of birth must use YYYY-MM-DD format.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = uuidv4();
  try {
    await db.transaction(async (connection) => {
      const [existing] = await connection.execute(
        'SELECT national_id FROM citizens WHERE national_id = ? UNION SELECT national_id FROM users WHERE national_id = ?',
        [normalizedNationalId, normalizedNationalId],
      );
      if (existing.length) {
        const error = new Error('A citizen account already exists for this National ID.');
        error.code = 'DUPLICATE_CITIZEN';
        throw error;
      }
      await connection.execute(`
        INSERT INTO citizens (national_id, full_name, dob, gender, phone, status, preferred_channel, literacy_level)
        VALUES (?, ?, ?, ?, ?, 'active', 'web', 'standard')
      `, [normalizedNationalId, normalizedName, dob || null, gender || null, phone || null]);
      await connection.execute(`
        INSERT INTO users (id, username, password_hash, role, department, national_id, full_name, phone, language, must_change_password, is_active)
        VALUES (?, ?, ?, 'citizen', NULL, ?, ?, ?, ?, 0, 1)
      `, [userId, normalizedNationalId, passwordHash, normalizedNationalId, normalizedName, phone || null, normalizedLanguage]);
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_CITIZEN' || error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A citizen account already exists for this National ID.' });
    }
    throw error;
  }

  await writeAudit({
    actorUser: normalizedNationalId,
    actorName: normalizedName,
    actorRole: 'citizen',
    action: 'CITIZEN_REGISTERED',
    nationalId: normalizedNationalId,
    details: { channel: 'web', language: normalizedLanguage },
  });
  res.status(201).json({ message: 'Citizen account created. You can now sign in.' });
}));

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
