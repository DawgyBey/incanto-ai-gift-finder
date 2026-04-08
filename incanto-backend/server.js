// server.js - Main entry point for INCANTO Backend

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const giftRoutes = require('./routes/gifts');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');

// Import database connection
const connectDB = require('./config/database');

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP (Explained for beginners)
// ============================================

// 1. Helmet - Adds security headers to protect against common attacks
app.use(helmet());

// 2. CORS - Allows your frontend to communicate with this backend
//    (Different ports need permission to talk to each other)
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

// 3. Morgan - Logs all incoming requests (helps with debugging)
app.use(morgan('dev'));

// 4. Express JSON - Automatically parses JSON request bodies
app.use(express.json({ limit: '10mb' }));

// 5. Express URL Encoded - Parses form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// ROUTES (API Endpoints)
// ============================================

// Health check endpoint - Test if server is running
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'INCANTO API is running!',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/gifts', giftRoutes);      // Gift-related endpoints
app.use('/api/ai', aiRoutes);           // AI recommendation endpoints
app.use('/api/user', userRoutes);       // User preferences endpoints

// 404 handler - For routes that don't exist
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Cannot find ${req.originalUrl} on this server`
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

// Connect to database first, then start server
const startServer = async () => {
    try {
        // Connect to MongoDB (optional - you can skip for now)
        // await connectDB();
        // console.log('✅ Database connected successfully');
        
        console.log('⚠️  Running without database (using mock data)');
        console.log('   To enable database, uncomment the database connection');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ✨ INCANTO Backend Server Started! ✨               ║
║                                                       ║
║   📍 Server running on: http://localhost:${PORT}      ║
║   🧪 Health check: http://localhost:${PORT}/api/health║
║   🤖 AI API ready for gift recommendations            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();