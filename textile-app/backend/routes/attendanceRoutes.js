const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Record attendance
router.post('/', (req, res) => {
    const { worker_id, date, status, notes } = req.body;

    if (!worker_id || !date || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
        INSERT INTO attendance (worker_id, date, status, notes)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [worker_id, date, status, notes || null], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Attendance recorded successfully' });
    });
});

// Get attendance by date
router.get('/date/:date', (req, res) => {
    const { date } = req.params;

    const sql = `
        SELECT a.*, w.code, w.name, w.role
        FROM attendance a
        JOIN workers w ON a.worker_id = w.id
        WHERE a.date = ?
        ORDER BY w.name
    `;

    db.all(sql, [date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get attendance for worker
router.get('/worker/:worker_id', (req, res) => {
    const { worker_id } = req.params;

    const sql = `
        SELECT * FROM attendance
        WHERE worker_id = ?
        ORDER BY date DESC
    `;

    db.all(sql, [worker_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get attendance report for period
router.get('/report/:start_date/:end_date', (req, res) => {
    const { start_date, end_date } = req.params;

    const sql = `
        SELECT 
            w.id, w.code, w.name, w.role,
            COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_days,
            COUNT(CASE WHEN a.status = 'Half Day' THEN 1 END) as half_days,
            COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_days,
            COUNT(CASE WHEN a.status = 'Leave' THEN 1 END) as leave_days,
            COUNT(a.id) as total_days
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
        res.json(rows);
    });
});

// Delete attendance record
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM attendance WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Attendance record deleted' });
    });
});

module.exports = router;
