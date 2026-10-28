/*
 * Run from backend/: npm run migrate
 * Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in .env if
 * the local MySQL server does not use root with an empty password.
 */
const mysql = require('mysql2/promise');
const dbConfig = require('../src/db/mysql-config');

const schema = [
  `CREATE TABLE IF NOT EXISTS citizens (
    national_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    dob DATE NULL,
    gender VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    district VARCHAR(80) NULL,
    phone VARCHAR(30) NULL,
    marital_status VARCHAR(40) NULL,
    marital_regime VARCHAR(60) NULL,
    dependents JSON NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    deceased_date DATE NULL,
    preferred_channel VARCHAR(30) NOT NULL DEFAULT 'web',
    literacy_level VARCHAR(30) NOT NULL DEFAULT 'standard',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    department VARCHAR(30) NULL,
    national_id VARCHAR(20) NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    large_text TINYINT(1) NOT NULL DEFAULT 0,
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS applications (
    id CHAR(36) PRIMARY KEY,
    national_id VARCHAR(20) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    department VARCHAR(30) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',
    channel VARCHAR(30) NOT NULL DEFAULT 'web',
    application_variant VARCHAR(30) NULL,
    notes TEXT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS citizen_documents (
    id CHAR(36) PRIMARY KEY,
    national_id VARCHAR(20) NOT NULL,
    document_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(80) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'valid',
    issued_at DATE NULL,
    expires_at DATE NULL,
    issuing_department VARCHAR(30) NOT NULL DEFAULT 'home_affairs',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE,
    INDEX idx_documents_citizen_type (national_id, document_type)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS verification_requests (
    id CHAR(36) PRIMARY KEY,
    requester_department VARCHAR(30) NOT NULL,
    requester_user VARCHAR(100) NULL,
    national_id VARCHAR(20) NOT NULL,
    purpose TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'completed',
    data_shared JSON NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    CONSTRAINT fk_verification_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    source_department VARCHAR(30) NOT NULL,
    target_department VARCHAR(30) NOT NULL,
    national_id VARCHAR(20) NOT NULL,
    type VARCHAR(60) NOT NULL,
    payload JSON NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'unread',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actioned_at DATETIME NULL,
    CONSTRAINT fk_notifications_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS police_flags (
    id CHAR(36) PRIMARY KEY,
    national_id VARCHAR(20) NOT NULL,
    flag_type VARCHAR(60) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    notes TEXT NULL,
    visible_flag_only TINYINT(1) NOT NULL DEFAULT 1,
    created_by VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_police_flags_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS flag_requests (
    id CHAR(36) PRIMARY KEY,
    requesting_department VARCHAR(30) NOT NULL,
    requesting_user VARCHAR(100) NULL,
    national_id VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    responded_by VARCHAR(100) NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    CONSTRAINT fk_flag_requests_citizen FOREIGN KEY (national_id) REFERENCES citizens (national_id) ON DELETE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id CHAR(36) PRIMARY KEY,
    actor_user VARCHAR(100) NULL,
    actor_name VARCHAR(150) NULL,
    actor_role VARCHAR(30) NULL,
    action VARCHAR(80) NOT NULL,
    national_id VARCHAR(20) NULL,
    department VARCHAR(30) NULL,
    details TEXT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_log_national_id_timestamp (national_id, timestamp)
  ) ENGINE=InnoDB`,
];

async function main() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    for (const statement of schema) await connection.execute(statement);
    try {
      await connection.execute('ALTER TABLE applications ADD COLUMN application_variant VARCHAR(30) NULL');
    } catch (error) {
      if (!/duplicate column/i.test(error.message)) throw error;
    }
    console.log(`Migrated MySQL schema in database '${dbConfig.database}'.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`MySQL migration failed: ${error.message}`);
  process.exitCode = 1;
});
