const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { writeAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

// In-memory USSD session store — mirrors how a feature-phone gateway keeps
// short-lived session state between each menu "press" on a real network.
const sessions = new Map();
const SESSION_TTL_MS = 5 * 60 * 1000;

function newSession(language = 'en') {
  const id = uuidv4();
  sessions.set(id, { step: 'ENTER_ID', language: language === 'st' ? 'st' : 'en', createdAt: Date.now() });
  return id;
}

function getSession(id) {
  const s = sessions.get(id);
  if (!s || Date.now() - s.createdAt > SESSION_TTL_MS) {
    sessions.delete(id);
    return null;
  }
  return s;
}

const SERVICE_MENU = {
  1: { serviceType: 'id_renewal', label: 'National ID renewal' },
  2: { serviceType: 'license_renewal', label: "Driver's license renewal" },
  3: { serviceType: 'pension_claim', label: 'Pension claim' },
  4: { serviceType: 'passport_application', label: 'Passport application' },
  5: { serviceType: 'death_registration', label: 'Register a death' },
};

function mainMenuText(fullName, language = 'en') {
  if (language === 'st') {
    return 'CON Rea u amohelehile, ' + fullName + '\n1. Likopo tsa ka\n2. Kopa tšebeletso\n3. Tlaleho ea data ea ka\n4. Fetola puo\n0. Tsoa';
  }
  return 'CON Welcome, ' + fullName + '\n1. My applications\n2. Request a service\n3. My data-sharing log\n4. Change language\n0. Exit';
}

function serviceMenuText(language = 'en') {
  if (language === 'st') {
    return 'CON Khetha tšebeletso:\n1. Nchafatsa ID\n2. Nchafatsa laesense\n3. Kopo ea penshene\n4. Kopo ea phasepoto\n5. Ngolisa lefu';
  }
  return 'CON Choose a service:\n1. ID renewal\n2. License renewal\n3. Pension claim\n4. Passport application\n5. Register a death';
}

// POST /api/ussd/start - dial the USSD code, get session id + first screen
router.post('/start', (req, res) => {
  const id = newSession(req.body?.language);
  res.json({
    sessionId: id,
    text: 'CON Boitsibiso National ID Hub\nEnter your National ID number:',
  });
});

// POST /api/ussd/input - send the next key press / text for a session
router.post('/input', asyncHandler(async (req, res) => {
  const { sessionId, text } = req.body || {};
  const session = getSession(sessionId);
  if (!session) {
    return res.json({ text: 'END Session expired. Please dial in again.', ended: true });
  }
  const input = (text || '').trim();

  if (session.step === 'ENTER_ID') {
    const citizen = await db.get('SELECT * FROM citizens WHERE national_id = ?', [input]);
    if (!citizen) {
      return res.json({ sessionId, text: 'END National ID not found. Please dial in again.', ended: true });
    }
    session.nationalId = input;
    session.step = 'ENTER_PIN';
    return res.json({ sessionId, text: 'CON Enter your PIN:' });
  }

  if (session.step === 'ENTER_PIN') {
    const user = await db.get('SELECT * FROM users WHERE national_id = ? AND role = ?', [session.nationalId, 'citizen']);
    if (!user || !bcrypt.compareSync(input, user.password_hash)) {
      await writeAudit({ actorUser: session.nationalId, actorRole: 'citizen', action: 'USSD_LOGIN_FAILED', nationalId: session.nationalId, department: null });
      return res.json({ sessionId, text: 'END Incorrect PIN. Please dial in again.', ended: true });
    }
    session.step = 'MAIN_MENU';
    session.user = user;
    await writeAudit({
      actorUser: user.username,
      actorName: user.full_name,
      actorRole: 'citizen',
      action: 'USSD_LOGIN_SUCCESS',
      nationalId: user.national_id,
      details: 'Logged in via USSD',
    });
    return res.json({ sessionId, text: mainMenuText(user.full_name, session.language) });
  }

  if (session.step === 'MAIN_MENU') {
    if (input === '1') {
      const apps = await db.all('SELECT * FROM applications WHERE national_id = ? ORDER BY submitted_at DESC LIMIT 5', [session.nationalId]);
      if (!apps.length) {
        session.step = 'MAIN_MENU';
        return res.json({ sessionId, text: `CON No applications on file.\n0. Back to menu` });
      }
      const lines = apps.map((a, i) => `${i + 1}. ${a.service_type.replace('_', ' ')}: ${a.status}`).join('\n');
      session.step = 'MAIN_MENU';
      return res.json({ sessionId, text: `CON Your applications:\n${lines}\n0. Back to menu` });
    }
    if (input === '2') {
      session.step = 'REQUEST_SERVICE';
      return res.json({
        sessionId,
        text: serviceMenuText(session.language),
      });
    }
    if (input === '4') {
      session.step = 'LANGUAGE';
      return res.json({ sessionId, text: 'CON Choose language / Khetha puo:\n1. English\n2. Sesotho' });
    }
    if (input === '3') {
      const log = await db.all('SELECT * FROM audit_log WHERE national_id = ? ORDER BY timestamp DESC LIMIT 5', [session.nationalId]);
      if (!log.length) {
        return res.json({ sessionId, text: `CON No data-sharing activity yet.\n0. Back to menu` });
      }
      const lines = log.map((l) => `- ${l.department || 'system'}: ${l.action.replace(/_/g, ' ').toLowerCase()}`).join('\n');
      return res.json({ sessionId, text: `CON Recent data-sharing activity:\n${lines}\n0. Back to menu` });
    }
    if (input === '0') {
      sessions.delete(sessionId);
      return res.json({ sessionId, text: 'END Thank you for using Boitsibiso.', ended: true });
    }
    return res.json({ sessionId, text: mainMenuText(session.user.full_name, session.language) });
  }

  if (session.step === 'LANGUAGE') {
    if (input === '1') session.language = 'en';
    else if (input === '2') session.language = 'st';
    else return res.json({ sessionId, text: 'CON Choose 1 for English or 2 for Sesotho.\n1. English\n2. Sesotho' });
    session.step = 'MAIN_MENU';
    return res.json({ sessionId, text: mainMenuText(session.user.full_name, session.language) });
  }

  if (session.step === 'REQUEST_SERVICE') {
    if (input === '0') {
      session.step = 'MAIN_MENU';
      return res.json({ sessionId, text: mainMenuText(session.user.full_name, session.language) });
    }
    const choice = SERVICE_MENU[input];
    if (!choice) {
      return res.json({ sessionId, text: 'END Invalid option. Please dial in again.', ended: true });
    }
    const deptMap = { id_renewal: 'home_affairs', death_registration: 'home_affairs', license_renewal: 'traffic', pension_claim: 'pensions', passport_application: 'passport' };
    await db.run(`
      INSERT INTO applications (id, national_id, service_type, department, status, channel, notes, submitted_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', 'ussd', NULL, NOW(), NOW())
    `, [uuidv4(), session.nationalId, choice.serviceType, deptMap[choice.serviceType]]);

    await writeAudit({
      actorUser: session.user.username,
      actorName: session.user.full_name,
      actorRole: 'citizen',
      action: 'SERVICE_REQUEST_SUBMITTED',
      nationalId: session.nationalId,
      department: deptMap[choice.serviceType],
      details: { serviceType: choice.serviceType, channel: 'ussd' },
    });

    sessions.delete(sessionId);
    return res.json({ sessionId, text: `END Your request for "${choice.label}" was submitted. You will be notified of progress.`, ended: true });
  }

  return res.json({ sessionId, text: 'END Session error. Please dial in again.', ended: true });
}));

module.exports = router;
