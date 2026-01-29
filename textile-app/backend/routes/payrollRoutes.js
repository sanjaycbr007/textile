const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Calculate payroll for period
router.post('/calculate', (req, res) => {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const sql = `
        SELECT 
            w.id, w.code, w.name, w.role, w.daily_wage, w.shift_wage,
            COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as days_worked,
            COUNT(CASE WHEN a.status = 'Half Day' THEN 1 END) as half_days,
            ROUND(
                COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * w.daily_wage +
                COUNT(CASE WHEN a.status = 'Half Day' THEN 1 END) * (w.daily_wage / 2),
                2
            ) as total_wages
        FROM workers w
        LEFT JOIN attendance a ON w.id = a.worker_id AND a.date BETWEEN ? AND ?
        WHERE w.status = 'active'
        GROUP BY w.id
        ORDER BY w.name
    `;

    db.all(sql, [start_date, end_date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Save payroll records
        const insertSql = `
            INSERT INTO payroll (worker_id, period_start, period_end, days_worked, wage_amount)
            VALUES (?, ?, ?, ?, ?)
        `;

        rows.forEach(row => {
            if (row.days_worked > 0 || row.half_days > 0) {
                db.run(insertSql, [
                    row.id,
                    start_date,
                    end_date,
                    row.days_worked + (row.half_days * 0.5),
                    row.total_wages || 0
                ]);
            }
        });

        const summary = {
            period_start: start_date,
            period_end: end_date,
            total_workers: rows.length,
            total_payroll: rows.reduce((sum, r) => sum + (r.total_wages || 0), 0),
            workers: rows
        };

        res.status(201).json(summary);
    });
});

// Get payroll records
router.get('/', (req, res) => {
    const sql = `
        SELECT p.*, w.code, w.name, w.role
        FROM payroll p
        JOIN workers w ON p.worker_id = w.id
        ORDER BY p.created_at DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get payroll for specific period
router.get('/period/:start_date/:end_date', (req, res) => {
    const { start_date, end_date } = req.params;

    const sql = `
        SELECT p.*, w.code, w.name, w.role, w.daily_wage
        FROM payroll p
        JOIN workers w ON p.worker_id = w.id
        WHERE p.period_start = ? AND p.period_end = ?
        ORDER BY w.name
    `;

    db.all(sql, [start_date, end_date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const summary = {
            total_workers: rows.length,
            total_payroll: rows.reduce((sum, r) => sum + r.wage_amount, 0),
            average_wage: rows.length > 0 ? rows.reduce((sum, r) => sum + r.wage_amount, 0) / rows.length : 0,
            records: rows
        };

        res.json(summary);
    });
});

// Get payroll for worker
router.get('/worker/:worker_id', (req, res) => {
    const { worker_id } = req.params;

    const sql = `
        SELECT p.*, w.code, w.name
        FROM payroll p
        JOIN workers w ON p.worker_id = w.id
        WHERE p.worker_id = ?
        ORDER BY p.period_start DESC
    `;

    db.all(sql, [worker_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
