import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { forgotPasswordLimiter, loginLimiter, registerLimiter } from './middleware/rateLimiters.js';

dotenv.config();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use('/api/auth/register', registerLimiter)
    app.use('/api/auth/login', loginLimiter)
    app.use('/api/auth/forgot-password', forgotPasswordLimiter)
}
// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API is running'));

// Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
        console.log(`Server is using environment: ${process.env.NODE_ENV}`);
        console.log(`Database URL is: ${process.env.TEST_DATABASE_URL}`)
    });
}

export default app;