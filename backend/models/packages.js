import pool from '../db.js';

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
