import pool from '../db.js';

export async function getAllRiders() {
    const { rows } = await pool.query(`
        SELECT
            riders.*,
            COUNT(deliveries.id)::int AS delivery_count
        FROM riders
        LEFT JOIN deliveries ON deliveries.rider_id = riders.id
        GROUP BY riders.id
        ORDER BY riders.name
    `);
    return rows;
}

export async function getRiderById(id) {
    const { rows } = await pool.query(`
        SELECT
            riders.*,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id',           deliveries.id,
                        'package_code', deliveries.package_code,
                        'drug_name',    deliveries.drug_name,
                        'date',         deliveries.date,
                        'status',       deliveries.status,
                        'patient_name', patients.name
                    )
                ) FILTER (WHERE deliveries.id IS NOT NULL),
                '[]'
            ) AS deliveries
        FROM riders
        LEFT JOIN deliveries ON deliveries.rider_id = riders.id
        LEFT JOIN patients   ON patients.id = deliveries.patient_id
        WHERE riders.id = $1
        GROUP BY riders.id
    `, [id]);
    return rows[0];
}

export async function createRider({ name, area, phone_number }) {

    const existingRider = await getRiderById(id);
    if (existingRider) {
        throw new Error('Rider already exists');
    }
    
    const { rows } = await pool.query(
        'INSERT INTO riders (name, area, phone_number) VALUES ($1, $2, $3) RETURNING *',
        [name, area, phone_number]
    );
    return rows[0];
}