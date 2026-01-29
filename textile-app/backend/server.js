const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Database initialization
const db = require('./config/db');
db.initDatabase();

// Routes
const workerRoutes = require('./routes/workerRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const movementRoutes = require('./routes/movementRoutes');

// API Routes
app.use('/api/workers', workerRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/movements', movementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Serve the main HTML file for any route (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   CBR TEXTILES MANAGEMENT SYSTEM              ║
    ║   Server running on http://localhost:${PORT}     ║
    ╚═══════════════════════════════════════════════╝
    `);
});
