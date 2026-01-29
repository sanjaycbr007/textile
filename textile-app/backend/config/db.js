const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../textile_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database tables
const initDatabase = () => {
    db.serialize(() => {
        // Workers table
        db.run(`
            CREATE TABLE IF NOT EXISTS workers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                contact TEXT,
                daily_wage REAL NOT NULL,
                shift_wage REAL DEFAULT 0,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Attendance table
        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER NOT NULL,
                date DATE NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(worker_id) REFERENCES workers(id)
            )
        `);

        // Inventory table
        db.run(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                unit TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit_cost REAL NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Stock movements table
        db.run(`
            CREATE TABLE IF NOT EXISTS stock_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                movement_type TEXT NOT NULL,
                date DATE NOT NULL,
                quantity REAL NOT NULL,
                reference TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(item_id) REFERENCES inventory(id)
            )
        `);

        // Payroll table
        db.run(`
            CREATE TABLE IF NOT EXISTS payroll (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER NOT NULL,
                period_start DATE NOT NULL,
                period_end DATE NOT NULL,
                days_worked INTEGER NOT NULL,
                wage_amount REAL NOT NULL,
                status TEXT DEFAULT 'calculated',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(worker_id) REFERENCES workers(id)
            )
        `);

        console.log('Database tables initialized successfully');
    });
};

module.exports = {
    db,
    initDatabase
};
