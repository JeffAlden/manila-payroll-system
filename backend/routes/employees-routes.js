// routes/employees-routes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Updated to import from db.js

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.query(sql, (err, results) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const employee = req.body;
  const currentTime = new Date().toISOString();
  employee.last_updated = `ADMIN IP:192.168.1.1 DateTime:${currentTime}`;
  const sql = 'INSERT INTO employees SET ?';
  db.query(sql, employee, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: result.insertId, ...employee });
  });
});

router.put('/:empId', (req, res) => {
  const { empId } = req.params;
  const employee = req.body;
  const currentTime = new Date().toISOString();
  employee.last_updated = `ADMIN IP:192.168.1.1 DateTime:${currentTime}`;
  const sql = 'UPDATE employees SET ? WHERE emp_id = ?';
  db.query(sql, [employee, empId], (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Updated successfully', ...employee });
  });
});

router.delete('/:empId', (req, res) => {
  const { empId } = req.params;
  const sql = 'DELETE FROM employees WHERE emp_id = ?';
  db.query(sql, [empId], (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Deleted successfully' });
  });
});

module.exports = router;