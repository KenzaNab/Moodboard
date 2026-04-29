const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../services/dbService');
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Images only.'), false);
}});

router.post('/', upload.single('image'), (req, res) => {
  const { board_id, type, content, url, note, tags } = req.body;
  if (!board_id || !type) return res.status(400).json({ error: 'board_id and type required.' });
  const id = uuidv4();
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  const parsedTags = JSON.stringify(tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : []);
  getDB().prepare('INSERT INTO items (id,board_id,type,content,url,file_path,tags,note) VALUES (?,?,?,?,?,?,?,?)').run(id, board_id, type, content||null, url||null, file_path, parsedTags, note||null);
  res.status(201).json({ id, board_id, type, content, url, file_path, tags: JSON.parse(parsedTags), note });
});

router.delete('/:id', (req, res) => {
  const item = getDB().prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found.' });
  if (item.file_path) {
    const full = path.join(__dirname, '..', '..', item.file_path);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  getDB().prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
