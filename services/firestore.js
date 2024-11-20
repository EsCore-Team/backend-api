const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'rich-suprstate-440012-g3',
    keyFilename: './FirestoreConfig.json',
});

module.exports = db;