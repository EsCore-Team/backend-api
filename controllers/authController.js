const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const db = require('../services/firestore');

exports.userRegister = async (req, res) => {
    const { fullName, email, username, password } = req.body;

    try {
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).send({ 
                status: 'failed', 
                message: 'Username already exists!' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        await userRef.set({
            fullName,
            username,
            email,
            password: hashedPassword,
            createdAt,
            updatedAt
        });

        return res.status(201).send({ 
            status: 'succes', 
            message: 'User registered successfully!' 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ 
            status: 'failed', 
            message: 'Internal server error!' 
        });
    }
};

// Login
exports.userLogin = async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        let userRef;
        let userDoc;

        // Periksa apakah input adalah email
        if (usernameOrEmail.includes('@')) {
            userRef = db.collection('users').where('email', '==', usernameOrEmail);
        } else {
            userRef = db.collection('users').where('username', '==', usernameOrEmail);
        }

        // Ambil data user dari Firestore
        const querySnapshot = await userRef.get();

        if (querySnapshot.empty) {
            return res.status(401).send({
                status: 'failed',
                message: 'Username or email and password do not match!',
            });
        }

        // Ambil dokumen pertama (karena Firestore mengembalikan query snapshot)
        userDoc = querySnapshot.docs[0].data();

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, userDoc.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                status: 'failed',
                message: 'Username or email and password do not match!',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: userDoc.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).send({
            status: 'success',
            message: 'Login successful!',
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: 'failed',
            message: 'Internal server error'
        });
    }
};
