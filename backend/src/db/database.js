const mysql = require('mysql2/promise');
const dbConfig = require('./mysql-config');

const pool = mysql.createPool(dbConfig);

async function get(sql, params = []) {
	const [rows] = await pool.execute(sql, params);
	return rows[0] || null;
}

async function all(sql, params = []) {
	const [rows] = await pool.execute(sql, params);
	return rows;
}

async function run(sql, params = []) {
	const [result] = await pool.execute(sql, params);
	return result;
}

module.exports = { get, all, run, close: () => pool.end() };
