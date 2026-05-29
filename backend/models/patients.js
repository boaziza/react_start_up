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
    const {
        next_delivery_date,
        default_drug_period,
        name,
        gender,
        phone_number,
        email,
        hospital_id,
    } = fields
    const { rows } = await pool.query(
        `UPDATE patients
         SET next_delivery_date  = COALESCE($1, next_delivery_date),
             default_drug_period = COALESCE($2, default_drug_period),
             name                = COALESCE($3, name),
             gender              = COALESCE($4, gender),
             phone_number        = COALESCE($5, phone_number),
             email               = COALESCE($6, email),
             hospital_id         = COALESCE($7, hospital_id)
         WHERE id = $8
         RETURNING *`,
        [
            next_delivery_date ?? null,
            default_drug_period ?? null,
            name ?? null,
            gender ?? null,
            phone_number ?? null,
            email ?? null,
            hospital_id ?? null,
            id,
        ]
    )
    return rows[0]
}

export async function createPatient({ name, hospital_id, phone_number, gender, email, location, address, default_drug_period, next_delivery_date }) {
    const { rows } = await pool.query(
        `INSERT INTO patients (name, hospital_id, phone_number, gender, email, location, address, default_drug_period, next_delivery_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
            name,
            hospital_id,
            phone_number,
            gender ?? null,
            email ?? null,
            location ?? null,
            address ?? null,
            default_drug_period ? Number(default_drug_period) : 30,
            next_delivery_date ?? null,
        ]
    );
    return rows[0];
}