const express = require('express');
const router = express.Router();
const { addNote, getAllNotes } = require('../controllers/notesController.js');

router.post('/notes', addNote);
router.get('/notes', getAllNotes)

module.exports = router;