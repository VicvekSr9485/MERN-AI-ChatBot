import rateLimit from 'express-rate-limit';

export const createRateLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        message,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
};

export const apiLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // Limit each IP to 100 requests per window
    'Too many API requests, please try again later'
);

export const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // Limit each IP to 5 auth requests per window
    'Too many authentication attempts, please try again later'
);