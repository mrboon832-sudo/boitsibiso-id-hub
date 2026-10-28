const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

// POST /api/police-flags - Police adds a flag to a citizen record
router.post('/', requireAuth, requireRole('police'), asyncHandler(async (req, res) => {
  const { nationalId, flagType, severity, notes } = req.body || {};
  if (!nationalId || !flagType) {
    return res.status(400).json({ error: 'nationalId and flagType are required.' });
  }
  const id = uuidv4();
  await db.run(`
    INSERT INTO police_flags (id, national_id, flag_type, severity, notes, visible_flag_only, created_by, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), 1)
  `, [id, nationalId, flagType, severity || 'medium', notes || null, req.user.username]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'POLICE_FLAG_ADDED',
    nationalId,
    department: req.user.department,
    details: { flagType, severity },
  });

  const created = await db.get('SELECT * FROM police_flags WHERE id = ?', [id]);
  res.status(201).json({ flag: created });
}));

// --- Flag requests (a department formally asks Police whether a flag exists) ---

router.get('/requests/list', requireAuth, requireRole('police', 'passport', 'traffic', 'admin'), asyncHandler(async (req, res) => {
  let rows;
  if (req.user.role === 'police' || req.user.role === 'admin') {
    rows = await db.all('SELECT * FROM flag_requests ORDER BY requested_at DESC');
  } else {
    rows = await db.all('SELECT * FROM flag_requests WHERE requesting_department = ? ORDER BY requested_at DESC', [req.user.department]);
  }
  res.json({ requests: rows });
}));

router.post('/requests', requireAuth, requireRole('passport', 'traffic', 'finance'), asyncHandler(async (req, res) => {
  const { nationalId } = req.body || {};
  if (!nationalId) return res.status(400).json({ error: 'nationalId is required.' });
  const id = uuidv4();
  await db.run(`
    INSERT INTO flag_requests (id, requesting_department, requesting_user, national_id, status, requested_at)
    VALUES (?, ?, ?, ?, 'pending', NOW())
  `, [id, req.user.department, req.user.username, nationalId]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'POLICE_FLAG_CHECK_REQUESTED',
    nationalId,
    department: req.user.department,
  });

  const created = await db.get('SELECT * FROM flag_requests WHERE id = ?', [id]);
  res.status(201).json({ request: created });
}));

router.put('/requests/:id', requireAuth, requireRole('police', 'admin'), asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const fr = await db.get('SELECT * FROM flag_requests WHERE id = ?', [req.params.id]);
  if (!fr) return res.status(404).json({ error: 'Flag request not found.' });

  await db.run(`UPDATE flag_requests SET status = ?, responded_by = ?, responded_at = NOW() WHERE id = ?`, [status || 'approved', req.user.username, req.params.id]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'POLICE_FLAG_CHECK_RESPONDED',
    nationalId: fr.national_id,
    department: req.user.department,
    details: { status },
  });

  const updated = await db.get('SELECT * FROM flag_requests WHERE id = ?', [req.params.id]);
  res.json({ request: updated });
}));

// GET /api/police-flags/:nationalId
// Keep this parameterised route after the literal /requests/list route above.
// Otherwise Express treats "requests" as a National ID and the queue cannot load.
// Police see the full flag. Every other department only ever learns whether a flag EXISTS
// (restricted-disclosure principle) - never the case notes/severity.
router.get('/:nationalId', requireAuth, requireRole(
  'police', 'passport', 'traffic', 'home_affairs', 'pensions', 'finance', 'admin'
), asyncHandler(async (req, res) => {
  const { nationalId } = req.params;
  const flag = await db.get('SELECT * FROM police_flags WHERE national_id = ? AND is_active = 1', [nationalId]);

  if (!flag) return res.json({ flag: null });

  if (req.user.role === 'police' || req.user.role === 'admin') {
    return res.json({
      flag: {
        id: flag.id,
        nationalId: flag.national_id,
        flagType: flag.flag_type,
        severity: flag.severity,
        notes: flag.notes,
        createdBy: flag.created_by,
        createdAt: flag.created_at,
      },
    });
  }

  // Other departments: flag-only visibility, no case details.
  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'POLICE_FLAG_STATUS_CHECKED',
    nationalId,
    department: req.user.department,
  });
  res.json({ flag: { exists: true, visibleFlagOnly: true } });
}));

module.exports = router;
