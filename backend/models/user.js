import pool from '../db.js';

export async function getAllUsers() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
}

export async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

export async function getUserByEmail(email) {

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
    
}

export async function createUser({ username, email, password }) {

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }
    
    const { rows } = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, password]
    );
    return rows[0];
}