const db = require('../services/firestore');

exports.historyPredict = async (req, res) => {
    const email = req.params.email;

    try {
        const userRef = db.collection('users').where('email', '==', email).limit(1);
        const userDocs = await userRef.get();

        if (userDocs.empty) {
            return res.status(404).send({ 
                error: true, 
                message: 'User not found!' 
            });
        }

        // Ambil dokumen pertama
        const userDoc = userDocs.docs[0];
        const predictionsRef = userDoc.ref.collection('predictions');
        const predictionsSnapshot = await predictionsRef.get();

        if (predictionsSnapshot.empty) {
            return res.status(404).send({ 
                error: true, 
                message: 'No predictions found!'
            });
        }

        // Ambil data prediksi
        const predictions = predictionsSnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });

        return res.status(200).send({
            error: false,
            message: 'History predictions retrieved successfully!',
            email: email,
            predictions: predictions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: true,
            message: 'Internal server error!'
        });
    }
};