const { Firestore } = require('@google-cloud/firestore');
// Inisialisasi Firestore dengan kunci service account
const db = new Firestore({
    projectId: 'rich-suprstate-440012-g3',
    keyFilename: '../FirestoreConfig.json', // Path ke file JSON service account
});

module.exports = db;