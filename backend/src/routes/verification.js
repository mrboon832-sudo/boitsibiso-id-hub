const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

function toView(v) {
  return {
    id: v.id,
    requesterDepartment: v.requester_department,
    requesterUser: v.requester_user,
    nationalId: v.national_id,
    purpose: v.purpose,
    status: v.status,
    dataShared: v.data_shared ? JSON.parse(v.data_shared) : null,
    requestedAt: v.requested_at,
    respondedAt: v.responded_at,
  };
}

// GET /api/verification-requests - own department's pull history, or citizen's own share feed
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  let rows;
  if (req.user.role === 'citizen') {
    rows = await db.all('SELECT * FROM verification_requests WHERE national_id = ? ORDER BY requested_at DESC', [req.user.nationalId]);
  } else if (req.user.role === 'admin') {
    rows = await db.all('SELECT * FROM verification_requests ORDER BY requested_at DESC LIMIT 100');
  } else {
    rows = await db.all('SELECT * FROM verification_requests WHERE requester_department = ? ORDER BY requested_at DESC', [req.user.department]);
  }
  res.json({ requests: rows.map(toView) });
}));

// POST /api/verification-requests - a department PULLs Core Identity Data from Home Affairs
// Simulated as an instant response (Home Affairs system is always available in this prototype).
router.post('/', requireAuth, requireRole('traffic', 'pensions', 'police', 'passport', 'finance', 'admin'), asyncHandler(async (req, res) => {
  const { nationalId, purpose } = req.body || {};
  if (!nationalId || !purpose) {
    return res.status(400).json({ error: 'nationalId and purpose are required.' });
  }
  const citizen = await db.get('SELECT * FROM citizens WHERE national_id = ?', [nationalId]);
  if (!citizen) return res.status(404).json({ error: 'No citizen found with that National ID.' });

  const dataShared = {
    nationalId: citizen.national_id,
    fullName: citizen.full_name,
    dob: citizen.dob,
    gender: citizen.gender,
    address: citizen.address,
    district: citizen.district,
    phone: citizen.phone,
    status: citizen.status,
  };

  const id = uuidv4();
  await db.run(`
    INSERT INTO verification_requests (id, requester_department, requester_user, national_id, purpose, status, data_shared, requested_at, responded_at)
    VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW(), NOW())
  `, [id, req.user.department, req.user.username, nationalId, purpose, JSON.stringify(dataShared)]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'VERIFICATION_REQUEST_PULL',
    nationalId,
    department: req.user.department,
    details: { purpose },
  });

  const created = await db.get('SELECT * FROM verification_requests WHERE id = ?', [id]);
  res.status(201).json({ request: toView(created) });
}));

module.exports = router;
