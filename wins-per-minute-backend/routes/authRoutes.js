// Dependencies
import express from 'express';
import { body } from 'express-validator';

// Middleware
import { validateRequest } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Controller
import { forgotPassword, login, register, resetPassword } from '../controllers/authController.js';

const router = express.Router();

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

router.post('/register',
    [
        body('username').notEmpty().trim().isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long'),
        body('email').trim().isEmail().withMessage('Invalid email format'),
        body('password').trim().matches(PASSWORD_REGEX).withMessage(
            'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.'),
    ],
    validateRequest,
    register
)

router.post('/login',
    [
        body('email').trim().isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().trim().withMessage('Password is required'),
    ], 
    login
)

router.post('/forgot-password',
    [
        body('email').trim().isEmail().withMessage('Invalid email format'),
    ], 
    forgotPassword
)

router.post('/reset-password',
    [
        body('newPassword').trim().matches(PASSWORD_REGEX).withMessage(
            'Password must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one digit 0-9, and one special character.'),
    ],
    resetPassword 
)

// Protected route examples. This route requires a valid JWT token to access
router.get('/protected',
    authenticateToken,
    (req, res) => {
        return res.status(200).json({ message: 'Protected route accessed', user: req.user });
    }
)

// TODO: implement logout

export default router;