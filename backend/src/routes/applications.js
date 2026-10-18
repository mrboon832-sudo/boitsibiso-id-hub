const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

function toView(a) {
  return {
    id: a.id,
    nationalId: a.national_id,
    serviceType: a.service_type,
    department: a.department,
    status: a.status,
    channel: a.channel,
    notes: a.notes,
    submittedAt: a.submitted_at,
    updatedAt: a.updated_at,
  };
}

const SERVICE_DEPARTMENTS = {
  id_renewal: 'home_affairs',
  death_registration: 'home_affairs',
  license_renewal: 'traffic',
  vehicle_registration: 'traffic',
  pension_claim: 'pensions',
  passport_application: 'passport',
};

// GET /api/applications - citizens see their own; staff see their department's queue
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  let rows;
  if (req.user.role === 'citizen') {
    rows = await db.all('SELECT * FROM applications WHERE national_id = ? ORDER BY submitted_at DESC', [req.user.nationalId]);
  } else if (req.user.role === 'admin') {
    rows = await db.all('SELECT * FROM applications ORDER BY submitted_at DESC LIMIT 100');
  } else {
    rows = await db.all('SELECT * FROM applications WHERE department = ? ORDER BY submitted_at DESC', [req.user.department]);
  }
  res.json({ applications: rows.map(toView) });
}));

// POST /api/applications - citizen (web/USSD) or staff-assisted request for a service
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { serviceType, channel, notes, nationalId: bodyNationalId } = req.body || {};
  const nationalId = req.user.role === 'citizen' ? req.user.nationalId : bodyNationalId;
  if (!serviceType || !nationalId) {
    return res.status(400).json({ error: 'serviceType and nationalId are required.' });
  }
  const department = SERVICE_DEPARTMENTS[serviceType];
  if (!department) {
    return res.status(400).json({ error: 'Unknown service type.' });
  }
  const id = uuidv4();
  await db.run(`
    INSERT INTO applications (id, national_id, service_type, department, status, channel, notes, submitted_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())
  `, [id, nationalId, serviceType, department, channel || 'web', notes || null]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'SERVICE_REQUEST_SUBMITTED',
    nationalId,
    department,
    details: { serviceType, channel: channel || 'web' },
  });

  const created = await db.get('SELECT * FROM applications WHERE id = ?', [id]);
  res.status(201).json({ application: toView(created) });
}));

// PUT /api/applications/:id - staff updates status (confirmed/in_review/completed/rejected)
router.put('/:id', requireAuth, requireRole(
  'home_affairs', 'traffic', 'pensions', 'police', 'passport', 'finance', 'admin'
), asyncHandler(async (req, res) => {
  const { status, notes } = req.body || {};
  const app = await db.get('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Application not found.' });
  if (req.user.role !== 'admin' && app.department !== req.user.department) {
    return res.status(403).json({ error: 'This application belongs to another department.' });
  }

  await db.run(`UPDATE applications SET status = COALESCE(?, status), notes = COALESCE(?, notes), updated_at = NOW() WHERE id = ?`, [status || null, notes || null, req.params.id]);

  await writeAudit({
    actorUser: req.user.username,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'APPLICATION_STATUS_UPDATED',
    nationalId: app.national_id,
    department: app.department,
    details: { status, notes },
  });

  const updated = await db.get('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  res.json({ application: toView(updated) });
}));

module.exports = router;
