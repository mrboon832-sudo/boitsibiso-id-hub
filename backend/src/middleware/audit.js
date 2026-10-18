const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

/**
 * Writes an entry to the audit_log table. Every pull/push data share,
 * profile update, and sensitive action in the system must call this,
 * so the Access & Audit Log stays the trust backbone of the prototype.
 */
async function writeAudit({ actorUser, actorName, actorRole, action, nationalId = null, department = null, details = null }) {
  await db.run(`
    INSERT INTO audit_log (id, actor_user, actor_name, actor_role, action, national_id, department, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [
    uuidv4(),
    actorUser || null,
    actorName || null,
    actorRole || null,
    action,
    nationalId,
    department,
    details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
  ]);
}

module.exports = { writeAudit };
