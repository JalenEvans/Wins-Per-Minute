// Limit up to 3 register attempts to prevent brute-force attacks
export const registerLimiter = ratelimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        error: 'Too many register attempts from this IP, please try again after 30 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Limit up to 5 login attempts to prevent brute-force attacks
export const loginLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Limit up to 3 forgot-password attempts to prevent brute-force attacks
export const forgotPasswordLimiter = ratelimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        error: 'Too many password reset attempts from this IP, please try again after 30 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});