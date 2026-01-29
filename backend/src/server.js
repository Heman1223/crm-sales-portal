const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const salesRoutes = require('./routes/sales');
const analyticsRoutes = require('./routes/analytics');
const targetRoutes = require('./routes/targets');
const serviceRoutes = require('./routes/services');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increased for base64 images

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CRM API is running' });
});

// Path to frontend build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const indexHtmlPath = path.join(frontendDistPath, 'index.html');

// Check if frontend build exists
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
    // Serve static files from the React frontend build
    app.use(express.static(frontendDistPath));

    // Catch-all handler: For any request that doesn't match an API route,
    // send back the React app's index.html file (for SPA routing)
    // Using '{*splat}' syntax for Express 5 compatibility
    app.get('/{*splat}', (req, res) => {
        res.sendFile(indexHtmlPath);
    });
} else {
    // Frontend not built yet - show helpful message
    app.get('/', (req, res) => {
        res.json({
            message: 'API is running. Frontend build not found.',
            hint: 'Run "npm run build:frontend" to build the frontend.',
            frontendPath: frontendDistPath
        });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
