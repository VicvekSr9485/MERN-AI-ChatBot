export const validateEnvironment = () => {
    const requiredEnvVars = [
        'MONGODB_URL',
        'JWT_SECRET',
        'OPEN_AI_SECRET',
        'COOKIE_SECRET'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
        console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
        process.exit(1);
    }
    
    // Validate optional environment variables
    if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
        console.warn('FRONTEND_URL is recommended in production for CORS configuration');
    }
};