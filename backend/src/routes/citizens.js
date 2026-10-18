const express = require('express');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

function parseDependents(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return JSON.parse(value);
}

function toCitizenView(c) {
  return {
    nationalId: c.national_id,
    fullName: c.full_name,
    dob: c.dob,
    gender: c.gender,
    address: c.address,
    district: c.district,
    phone: c.phone,
    maritalStatus: c.marital_status,
    maritalRegime: c.marital_regime,
    dependents: parseDependents(c.dependents),
    status: c.status,
    deceasedDate: c.deceased_date,
    preferredChannel: c.preferred_channel,
    literacyLevel: c.literacy_level,
    updatedAt: c.updated_at,
  };
}

// GET /api/citizens/me - citizen's own profile
router.get('/me', requireAuth, requireRole('citizen'), asyncHandler(async (req, res) => {
  const c = await db.get('SELECT * FROM citizens WHERE national_id = ?', [req.user.nationalId]);
  if (!c) return res.status(404).json({ error: 'Citizen record not found.' });
  res.json({ citizen: toCitizenView(c) });
}));

// GET /api/citizens/:nationalId - staff lookup (any department may view core identity data)
router.get('/:nationalId', requireAuth, requireRole(
  'home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'
), asyncHandler(async (req, res) => {
  const { nationalId } = req.params;
  const c = await db.get('SELECT * FROM citizens WHERE national_id = ?', [nationalId]);
  if (!c) return res.status(404).json({ error: 'No citizen found with that National ID.' });

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'CITIZEN_PROFILE_VIEWED',
    nationalId,
    department: req.user.department,
  });

  res.json({ citizen: toCitizenView(c) });
}));

// PUT /api/citizens/:nationalId - Home Affairs only: update core identity / civil status
router.put('/:nationalId', requireAuth, requireRole('home_affairs', 'admin'), asyncHandler(async (req, res) => {
  const { nationalId } = req.params;
  const existing = await db.get('SELECT * FROM citizens WHERE national_id = ?', [nationalId]);
  if (!existing) return res.status(404).json({ error: 'No citizen found with that National ID.' });

  const {
    fullName, address, district, phone, maritalStatus, maritalRegime,
    dependents, status, deceasedDate,
  } = req.body || {};

  await db.run(`
    UPDATE citizens SET
      full_name = COALESCE(?, full_name),
      address = COALESCE(?, address),
      district = COALESCE(?, district),
      phone = COALESCE(?, phone),
      marital_status = COALESCE(?, marital_status),
      marital_regime = COALESCE(?, marital_regime),
      dependents = COALESCE(?, dependents),
      status = COALESCE(?, status),
      deceased_date = COALESCE(?, deceased_date),
      updated_at = NOW()
    WHERE national_id = ?
  `, [
    fullName || null, address || null, district || null, phone || null,
    maritalStatus || null, maritalRegime || null,
    dependents ? JSON.stringify(dependents) : null,
    status || null, deceasedDate || null, nationalId,
  ]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'CITIZEN_RECORD_UPDATED',
    nationalId,
    department: req.user.department,
    details: req.body,
  });

  // Push pattern: a death registration automatically notifies Pensions.
  if (status === 'deceased' && existing.status !== 'deceased') {
    const { v4: uuidv4 } = require('uuid');
    const updated = await db.get('SELECT * FROM citizens WHERE national_id = ?', [nationalId]);
    await db.run(`
      INSERT INTO notifications (id, source_department, target_department, national_id, type, payload, status, created_at)
      VALUES (?, 'home_affairs', 'pensions', ?, 'death_registered', ?, 'pending', NOW())
    `, [uuidv4(), nationalId, JSON.stringify({
      nationalId,
      fullName: updated.full_name,
      deceasedDate: deceasedDate || updated.deceased_date,
      dependents: parseDependents(updated.dependents),
    })]);

    await writeAudit({
      actorUser: req.user.username,
      actorName: req.user.fullName,
      actorRole: req.user.role,
      action: 'AUTO_NOTIFICATION_SENT',
      nationalId,
      department: req.user.department,
      details: 'Death registered -> notified Pensions',
    });
  }

  const c = await db.get('SELECT * FROM citizens WHERE national_id = ?', [nationalId]);
  res.json({ citizen: toCitizenView(c) });
}));

// GET /api/citizens - Home Affairs staff search/list (paginated)
router.get('/', requireAuth, requireRole('home_affairs', 'admin'), asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = await db.all('SELECT * FROM citizens WHERE national_id LIKE ? OR full_name LIKE ? ORDER BY full_name LIMIT 50', [`%${q}%`, `%${q}%`]);
  } else {
    rows = await db.all('SELECT * FROM citizens ORDER BY full_name LIMIT 50');
  }
  res.json({ citizens: rows.map(toCitizenView) });
}));

module.exports = router;
