const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const Worker = require('../models/Worker');

// Get all workers
router.get('/', (req, res) => {
    db.all('SELECT * FROM workers WHERE status = ?', ['active'], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get worker by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM workers WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(row);
    });
});

// Add new worker
router.post('/', (req, res) => {
    const { code, name, role, contact, daily_wage, shift_wage } = req.body;

    const worker = new Worker(code, name, role, contact, daily_wage, shift_wage);
    const validation = Worker.validate(worker);

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    const sql = `
        INSERT INTO workers (code, name, role, contact, daily_wage, shift_wage)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [code, name, role, contact, daily_wage, shift_wage], (err) => {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Worker code already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: 'Worker added successfully',
            code: code
        });
    });
});

// Update worker
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, role, contact, daily_wage, shift_wage } = req.body;

    const sql = `
        UPDATE workers
        SET name = ?, role = ?, contact = ?, daily_wage = ?, shift_wage = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(sql, [name, role, contact, daily_wage, shift_wage, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Worker updated successfully' });
    });
});

// Soft delete worker
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'UPDATE workers SET status = ? WHERE id = ?';

    db.run(sql, ['inactive', id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Worker deleted successfully' });
    });
});

// Get worker statistics
router.get('/stats/summary', (req, res) => {
    db.all(`
        SELECT 
            COUNT(*) as total_workers,
            AVG(daily_wage) as avg_daily_wage,
            SUM(daily_wage) as total_daily_wages
        FROM workers
        WHERE status = ?
    `, ['active'], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows[0]);
    });
});

module.exports = router;
