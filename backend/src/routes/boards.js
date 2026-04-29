const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../services/dbService');
const router = express.Router();

router.get('/', (req, res) => {
  const boards = getDB().prepare('SELECT * FROM boards ORDER BY created_at DESC').all();
  res.json(boards);
});

router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required.' });
  const id = uuidv4();
  getDB().prepare('INSERT INTO boards (id,title,description) VALUES (?,?,?)').run(id, title, description || null);
  res.status(201).json({ id, title, description });
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Board not found.' });
  const items = db.prepare('SELECT * FROM items WHERE board_id = ? ORDER BY created_at DESC').all(req.params.id)
    .map(i => ({ ...i, tags: JSON.parse(i.tags || '[]') }));
  res.json({ ...board, items });
});

router.delete('/:id', (req, res) => {
  const info = getDB().prepare('DELETE FROM boards WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found.' });
  res.status(204).send();
});

module.exports = router;
