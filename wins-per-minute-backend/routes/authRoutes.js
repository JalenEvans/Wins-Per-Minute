// Dependencies
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { body } from 'express-validator';

// Models
import { createUser, findUserByEmail } from '../models/userModel.js';

// Utils
import { isPasswordValid } from '../utils/validatePassword.js';
import { sendResetLink } from '../utils/sendEmail.js';
import { SALT_ROUNDS } from '../utils/constants.js';

// Middleware
import { registerLimiter, loginLimiter, forgotPasswordLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/errorHandler.js';

// Database
import pool from '../db/db.js';

const router = express.Router();

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

router.post('/register', 
    registerLimiter,
    [
        body('username').notEmpty().trim().isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long'),
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').matches(PASSWORD_REGEX).withMessage(
            'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.'),
    ],
    validateRequest,
    async (req, res) => {
    const {username, email, password} = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(409).json({ error: 'Email already registered' });

        // If the email is not registered, create a new user
        const user = await createUser(username, email, password);

        // Generate a JWT token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ user, token });
    }
    catch (error) {
        next(error);
    }
})



router.post('/login', 
    loginLimiter,
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required'),
    ], 
    async (req, res) => {
    const {email, password} = req.body;

    try {
        // Check if the email is registered
        const user = await findUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate a JWT token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '2h' });

        return res.status(200).json({ user: {user_id: user.user_id, username: user.username}, token });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Login failed' });
    }
})

router.post('/forgot-password', 
    forgotPasswordLimiter,
    [
        body('email').isEmail().withMessage('Invalid email format'),
    ], 
    async (req, res) => {
    const { email } = req.body;

    try {
        const user = findUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'Email not found' });

        // Generate a password reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
            [token, expiry, user.user_id]
        )

        const resetLink = `https://localhost:3001/reset-password?token=${token}`;

        sendResetLink(email, resetLink);
        return res.status(200).json({ message: 'If an account with this email exist, a reset link has been sent.' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/reset-password',
    [
        body('newPassword').matches(PASSWORD_REGEX).withMessage(
            'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.'),
    ],
    async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );

        const user = result.rows[0];
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

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