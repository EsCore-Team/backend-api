const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'escore-app',
    keyFilename: './FirestoreConfig.json',
});

module.exports = db;