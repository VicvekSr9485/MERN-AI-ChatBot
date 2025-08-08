import app from "./app.js";
import { connectToDb } from "./db/connection.js";
import { validateEnvironment } from "./utils/envValidator.js";

// Validate environment variables
validateEnvironment();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
        console.error('Server closed');
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        console.error('Server closed');
        process.exit(1);
    });
});

// Connect to database
connectToDb()
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });