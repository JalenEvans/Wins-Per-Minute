import pool from "../db/db.js";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constants.js";

export async function createUser (username, email, password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const res = await pool.query(
        'INSERT INTO users (username, email, password_hash, created_at, rank) VALUES ($1, $2, $3, NOW(), 0) RETURNING user_id, username',
        [username, email, hashedPassword],
    )
    return res.rows[0]
}

export async function findUserByEmail (email) {
    const res = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
    )
    return res.rows[0]
}