const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Record stock movement
router.post('/', (req, res) => {
    const { item_id, movement_type, date, quantity, reference, notes } = req.body;

    if (!item_id || !movement_type || !date || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start transaction
    db.serialize(() => {
        // Insert movement record
        const sql = `
            INSERT INTO stock_movements (item_id, movement_type, date, quantity, reference, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [item_id, movement_type, date, quantity, reference || null, notes || null], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Update inventory quantity
            const updateSql = movement_type === 'Inward'
                ? 'UPDATE inventory SET quantity = quantity + ? WHERE id = ?'
                : 'UPDATE inventory SET quantity = quantity - ? WHERE id = ?';

            db.run(updateSql, [quantity, item_id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ error: updateErr.message });
                }
                res.status(201).json({ message: 'Stock movement recorded successfully' });
            });
        });
    });
});

// Get all movements
router.get('/', (req, res) => {
    const sql = `
        SELECT sm.*, i.code, i.name, i.type, i.unit
        FROM stock_movements sm
        JOIN inventory i ON sm.item_id = i.id
        ORDER BY sm.date DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get movements for item
router.get('/item/:item_id', (req, res) => {
    const { item_id } = req.params;

    const sql = `
        SELECT sm.*, i.code, i.name, i.type
        FROM stock_movements sm
        JOIN inventory i ON sm.item_id = i.id
        WHERE sm.item_id = ?
        ORDER BY sm.date DESC
    `;

    db.all(sql, [item_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get movements for period
router.get('/period/:start_date/:end_date', (req, res) => {
    const { start_date, end_date } = req.params;

    const sql = `
        SELECT sm.*, i.code, i.name, i.type, i.unit
        FROM stock_movements sm
        JOIN inventory i ON sm.item_id = i.id
        WHERE sm.date BETWEEN ? AND ?
        ORDER BY sm.date DESC
    `;

    db.all(sql, [start_date, end_date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get inward movements
router.get('/type/inward', (req, res) => {
    const sql = `
        SELECT sm.*, i.code, i.name
        FROM stock_movements sm
        JOIN inventory i ON sm.item_id = i.id
        WHERE sm.movement_type = 'Inward'
        ORDER BY sm.date DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get outward movements
router.get('/type/outward', (req, res) => {
    const sql = `
        SELECT sm.*, i.code, i.name
        FROM stock_movements sm
        JOIN inventory i ON sm.item_id = i.id
        WHERE sm.movement_type = 'Outward'
        ORDER BY sm.date DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Delete movement record
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // First get the movement details
    db.get('SELECT * FROM stock_movements WHERE id = ?', [id], (err, movement) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!movement) {
            return res.status(404).json({ error: 'Movement not found' });
        }

        // Reverse the quantity change
        const reverseSql = movement.movement_type === 'Inward'
            ? 'UPDATE inventory SET quantity = quantity - ? WHERE id = ?'
            : 'UPDATE inventory SET quantity = quantity + ? WHERE id = ?';

        db.run(reverseSql, [movement.quantity, movement.item_id], (reverseErr) => {
            if (reverseErr) {
                return res.status(500).json({ error: reverseErr.message });
            }

            // Delete movement record
            db.run('DELETE FROM stock_movements WHERE id = ?', [id], (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({ error: deleteErr.message });
                }
                res.json({ message: 'Movement record deleted' });
            });
        });
    });
});

module.exports = router;
