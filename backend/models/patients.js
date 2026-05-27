import pool from '../db.js';

export async function getAllPatients() {
    const { rows } = await pool.query('SELECT * FROM patients');
    return rows;
}

export async function getPatientById(id) {
    const { rows } = await pool.query(`
        SELECT
            patients.*,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id',             deliveries.id,
                        'drug_name',      deliveries.drug_name,
                        'drug_period',    deliveries.drug_period,
                        'payment_status', deliveries.payment_status,
                        'package_code',   deliveries.package_code,
                        'date',           deliveries.date,
                        'area',           deliveries.area,
                        'address',        deliveries.address,
                        'next_date',      deliveries.next_date
                    )
                ) FILTER (WHERE deliveries.id IS NOT NULL),
                '[]'
            ) AS deliveries
        FROM patients
        LEFT JOIN deliveries ON deliveries.patient_id = patients.id
        WHERE patients.id = $1
        GROUP BY patients.id
    `, [id])

    return rows[0]
}


export async function updatePatient(id, fields) {
    const { next_delivery_date, default_drug_period } = fields
    const { rows } = await pool.query(
        `UPDATE patients
         SET next_delivery_date  = COALESCE($1, next_delivery_date),
             default_drug_period = COALESCE($2, default_drug_period)
         WHERE id = $3
         RETURNING *`,
        [next_delivery_date ?? null, default_drug_period ?? null, id]
    )
    return rows[0]
}

export async function createPatient({ name, hospital_id, phone_number }) {

    const existingPatient = await getPatientById(id);
    if (existingPatient) {
        throw new Error('Patient already exists');
    }
    
    const { rows } = await pool.query(
        'INSERT INTO users (name, hospital_id, phone_number) VALUES ($1, $2, $3) RETURNING *',
        [name, hospital_id, phone_number]
    );
    return rows[0];
}