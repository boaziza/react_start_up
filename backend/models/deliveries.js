import pool from '../db.js';

export async function getAllDeliveries() {
    const { rows } = await pool.query(`
        SELECT
            deliveries.*,
            patients.name         AS patient_name,
            patients.phone_number AS phone_number,
            patients.hospital_id  AS hospital_id,
            patients.location         AS location
        FROM deliveries
        LEFT JOIN patients ON patients.id = deliveries.patient_id
        ORDER BY deliveries.id DESC
    `);
    return rows;
}

export async function getDeliveryById(id) {
    const { rows } = await pool.query(`
        SELECT
            deliveries.*,
            patients.name         AS patient_name,
            patients.phone_number AS patient_phone,
            patients.hospital_id  AS patient_hospital_id,
            patients.location     AS patient_location,
            riders.name           AS rider_name,
            riders.area           AS rider_area,
            riders.phone_number   AS rider_phone
        FROM deliveries
        LEFT JOIN patients ON patients.id = deliveries.patient_id
        LEFT JOIN riders   ON riders.id   = deliveries.rider_id
        WHERE deliveries.id = $1
    `, [id])
    return rows[0];
}

export async function assignRiderToDelivery(deliveryId, riderId) {
    const { rows } = await pool.query(
        `UPDATE deliveries SET rider_id = $1, status = 'pending' WHERE id = $2 RETURNING *`,
        [riderId, deliveryId]
    );
    await pool.query(
        `UPDATE riders SET number_of_deliveries = number_of_deliveries + 1 WHERE id = $1`,
        [riderId]
    );
    return rows[0];
}

export async function confirmDelivery(deliveryId) {
    const { rows } = await pool.query(
        `UPDATE deliveries SET status = 'pending' WHERE id = $1 RETURNING *`,
        [deliveryId]
    );
    return rows[0];
}

export async function updateDelivery(id, { date, drug_period, package_code, status }) {
    const { rows } = await pool.query(
        `UPDATE deliveries
         SET date         = COALESCE($1, date),
             drug_period  = COALESCE($2, drug_period),
             package_code = COALESCE($3, package_code),
             status       = COALESCE($4, status)
         WHERE id = $5
         RETURNING *`,
        [date ?? null, drug_period ?? null, package_code ?? null, status ?? null, id]
    )
    return rows[0]
}

export async function createDelivery({ patient_id, rider_id, package_code, date, drug_period, area, address }) {
    const { rows } = await pool.query(
        `INSERT INTO deliveries (patient_id, rider_id, package_code, date, drug_period, area, address, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'dispatched')
         RETURNING *`,
        [patient_id, rider_id, package_code, date, drug_period, area ?? null, address ?? null]
    );
    await pool.query(
        `UPDATE riders SET number_of_deliveries = number_of_deliveries + 1 WHERE id = $1`,
        [rider_id]
    );
    return rows[0];
}