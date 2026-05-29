import pool from '../db.js';

export async function getAllPackages() {
    const { rows } = await pool.query(
        `SELECT * FROM packages ORDER BY created_at DESC`
    );
    return rows;
}

export async function createPackage({ package_code, qr_code }) {
    const { rows } = await pool.query(
        `INSERT INTO packages (package_code, qr_code) VALUES ($1, $2) RETURNING *`,
        [package_code, qr_code]
    );
    return rows[0];
}

export async function getPackageByQrCode(qr_code) {
    const { rows } = await pool.query(
        `SELECT * FROM packages WHERE qr_code = $1`,
        [qr_code]
    );
    return rows[0];
}

export async function getPackageByCode(package_code) {
    const { rows } = await pool.query(
        `SELECT * FROM packages WHERE package_code = $1`,
        [package_code]
    );
    return rows[0];
}

export async function markPackageScanned(id) {
    const { rows } = await pool.query(
        `UPDATE packages SET scanned = TRUE WHERE id = $1 RETURNING *`,
        [id]
    );
    return rows[0];
}
