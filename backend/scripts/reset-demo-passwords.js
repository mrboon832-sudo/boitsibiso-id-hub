// One-time utility: sets known, demo-friendly passwords for all seeded accounts.
// Citizens log in with their National ID as both username and password.
// Staff/admin log in with username + the shared demo password below.
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dbConfig = require('../src/db/mysql-config');

const STAFF_PASSWORD = 'Password123!';

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute('SELECT id, username, role, national_id FROM users');
    for (const user of users) {
      const plain = user.role === 'citizen' ? user.national_id : STAFF_PASSWORD;
      const hash = bcrypt.hashSync(plain, 10);
      await connection.execute('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?', [hash, user.id]);
    }
    await connection.commit();

    console.log(`Reset passwords for ${users.length} accounts.`);
    console.log('Citizens: password = their National ID');
    console.log(`Staff/Admin: password = ${STAFF_PASSWORD}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Password reset failed: ${error.message}`);
  process.exitCode = 1;
});
