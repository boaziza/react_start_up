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

export async function createDelivery({ patient_id, drug_name, drug_period }) {

    const existingDelivery = await getDeliveryById(id);
    if (existingDelivery) {
        throw new Error('Delivery already exists');
    }
    
    const { rows } = await pool.query(
        'INSERT INTO deliveries (patient_id, drug_name, drug_period) VALUES ($1, $2, $3) RETURNING *',
        [patient_id, drug_name, drug_period]
    );
    return rows[0];
}