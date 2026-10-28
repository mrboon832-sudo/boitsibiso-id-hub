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

async function transaction(callback) {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const result = await callback(connection);
		await connection.commit();
		return result;
	} catch (error) {
		await connection.rollback();
		throw error;
	} finally {
		connection.release();
	}
}

module.exports = { get, all, run, transaction, close: () => pool.end() };
