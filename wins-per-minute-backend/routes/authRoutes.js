import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import ratelimit from 'express-rate-limit';
import crypto from 'crypto';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { isPasswordValid } from '../utils/validatePassword.js';
import { sendResetLink } from '../utils/sendEmail.js';
import { SALT_ROUNDS } from '../utils/constants.js';
import pool from '../db/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;

    // Validate password
    if (!isPasswordValid(password)) {
        return res.status(400).json({ error: 'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.' });
    }

    findUserByEmail(email)
        // Check if the email is already registered
        .then(user => {
            if (user) {
                return res.status(409).json({ error: 'Email already registered' });
            }
            // If the email is not registered, create a new user
            return createUser(username, email, password)
        })
        .then(user => {
            const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(201).json({ user, token });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        });
})

// Limit up to 5 login attempts to prevent brute-force attacks
const loginLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/login', loginLimiter, (req, res) => {
    const {email, password} = req.body;
    findUserByEmail(email)
        // Check if the email is registered
        .then(user => {
            // Check if the password is correct
            return bcrypt.compare(password, user.password_hash)
                .then(_ => {
                    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
                    return res.status(200).json({ user: {id: user.user_id, username: user.username}, token });
                })
                .catch(_ => {
                    return res.status(401).json({ error: 'Invalid credentials' });
                })
        })
        // If the email is not registered, return an error
        .catch(error => {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({ error: error.message });
            }
            else{
                return res.status(500).json({ error: error.message });
            }
        })
})

// TODO: implement rate limiting for forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = findUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'Email not found' });

        // Generate a password reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
            [token, expiry, user.user_id]
        )

        const resetLink = `https://localhost:5173/reset-password?token=${token}`;

        sendResetLink(email, resetLink);
        return res.status(200).json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        const user = result.rows[0];
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        // Validate password
        if (!isPasswordValid(newPassword)) {
            return res.status(400).json({ error: 'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, user.user_id]
        );

        return res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

// TODO: implement logout

export default router;