const express = require('express');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/audit-log
// - Staff/admin: full transparency log (optionally filtered by nationalId)
// - Citizens: only entries about their own record (the "data-sharing feed" on their dashboard)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { nationalId } = req.query;
  let rows;

  if (req.user.role === 'citizen') {
    rows = await db.all('SELECT * FROM audit_log WHERE national_id = ? ORDER BY timestamp DESC LIMIT 100', [req.user.nationalId]);
  } else if (nationalId) {
    rows = await db.all('SELECT * FROM audit_log WHERE national_id = ? ORDER BY timestamp DESC LIMIT 200', [nationalId]);
  } else {
    rows = await db.all('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 200');
  }

  res.json({
    entries: rows.map((r) => ({
      id: r.id,
      actorUser: r.actor_user,
      actorName: r.actor_name,
      actorRole: r.actor_role,
      action: r.action,
      nationalId: r.national_id,
      department: r.department,
      details: r.details,
      timestamp: r.timestamp,
    })),
  });
}));

module.exports = router;
