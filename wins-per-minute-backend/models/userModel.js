import pool from "../db/db.js";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../utils/constants.js";

export function createUser (username, email, password) {
    return new Promise (async (resolve, reject) => {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        pool.query(
            'INSERT INTO users (username, email, password_hash, created_at, rank) VALUES ($1, $2, $3, NOW(), 0) RETURNING user_id, username',
            [username, email, hashedPassword],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.rows[0]);
                }
            }
        )
    })
}

export function findUserByEmail (email) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email],
            (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results && results.rows) {
                    resolve(results.rows[0]);
                }
                else {
                    reject(new Error('Invalid credentials'));
                }
            }
        )
    })
}