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
                        'days_supply',    deliveries.days_supply,
                        'cycle_start',    deliveries.cycle_start,
                        'cycle_end',      deliveries.cycle_end,
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