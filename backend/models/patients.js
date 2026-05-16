import pool from '../db.js';

export async function getAllPatients() {
    const { rows } = await pool.query('SELECT * FROM patients');
    return rows;
}

export async function getPatientById(id) {
  const { rows } = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
  return rows[0];
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