const express = require('express');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  return JSON.parse(value);
}

function toView(n) {
  return {
    id: n.id,
    sourceDepartment: n.source_department,
    targetDepartment: n.target_department,
    nationalId: n.national_id,
    type: n.type,
    payload: parseJson(n.payload),
    status: n.status,
    createdAt: n.created_at,
    actionedAt: n.actioned_at,
  };
}

// GET /api/notifications - the receiving department's inbox (Push pattern landing screen)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  let rows;
  if (req.user.role === 'admin') {
    rows = await db.all('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
  } else {
    rows = await db.all('SELECT * FROM notifications WHERE target_department = ? ORDER BY created_at DESC', [req.user.department]);
  }
  res.json({ notifications: rows.map(toView) });
}));

// PUT /api/notifications/:id - receiving department actions the notification (e.g. opens a benefit case)
router.put('/:id', requireAuth, requireRole('pensions', 'traffic', 'police', 'passport', 'finance', 'admin'), asyncHandler(async (req, res) => {
  const n = await db.get('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
  if (!n) return res.status(404).json({ error: 'Notification not found.' });
  if (req.user.role !== 'admin' && n.target_department !== req.user.department) {
    return res.status(403).json({ error: 'This notification belongs to another department.' });
  }

  await db.run(`UPDATE notifications SET status = 'actioned', actioned_at = NOW() WHERE id = ?`, [req.params.id]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'NOTIFICATION_ACTIONED',
    nationalId: n.national_id,
    department: req.user.department,
    details: { type: n.type },
  });

  const updated = await db.get('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
  res.json({ notification: toView(updated) });
}));

module.exports = router;
