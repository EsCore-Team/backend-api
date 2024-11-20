const { nanoid } = require('nanoid');
const db = require('../services/firestore');

exports.addNote = async (req, res) => {
    const { title, tags, body } = req.body;

    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
        title, tags, body, id, createdAt, updatedAt,
    };

    try {
        await db.collection('notes').doc(id).set(newNote);
        return res.status(201).send({ status: 'succes', message: 'Notes has been added!' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'failed', message: 'Internal server error' });
    }
};

exports.getAllNotes = async (req, res) => {
    try {
        const notesSnapshot = await db.collection('notes').get();
        const notes = notesSnapshot.docs.map((doc) => doc.data());
        return res.status(200).send({ status: 'succes', data: { notes } });
    } catch(error) {
        console.error(error);
        return res.status(500).json({ status: 'failed', message: 'Internal Server Error'});
    }
};