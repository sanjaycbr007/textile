const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Get all inventory items
router.get('/', (req, res) => {
    db.all('SELECT * FROM inventory ORDER BY code', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get inventory item by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM inventory WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(row);
    });
});

// Add new inventory item
router.post('/', (req, res) => {
    const { code, name, type, unit, quantity, unit_cost, description } = req.body;

    if (!code || !name || !type || !unit || quantity === undefined || !unit_cost) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
        INSERT INTO inventory (code, name, type, unit, quantity, unit_cost, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [code, name, type, unit, quantity, unit_cost, description || null], (err) => {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Item code already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Inventory item added successfully' });
    });
});

// Update inventory item
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, unit, quantity, unit_cost, description } = req.body;

    const sql = `
        UPDATE inventory
        SET name = ?, type = ?, unit = ?, quantity = ?, unit_cost = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(sql, [name, type, unit, quantity, unit_cost, description || null, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Item updated successfully' });
    });
});

// Delete inventory item
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM inventory WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Item deleted successfully' });
    });
});

// Get low stock items (below threshold)
router.get('/low-stock/:threshold', (req, res) => {
    const { threshold } = req.params;

    db.all('SELECT * FROM inventory WHERE quantity <= ? ORDER BY quantity', [threshold], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get inventory summary
router.get('/summary/all', (req, res) => {
    db.all(`
        SELECT 
            COUNT(*) as total_items,
            SUM(quantity) as total_quantity,
            ROUND(SUM(quantity * unit_cost), 2) as total_value,
            AVG(unit_cost) as avg_unit_cost,
            COUNT(DISTINCT type) as total_types
        FROM inventory
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows[0]);
    });
});

module.exports = router;
