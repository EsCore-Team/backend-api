const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const db = require('../services/firestore');

const generateUserId = () => {
    const randomString = crypto.randomBytes(8).toString('base64url');
    return `user-${randomString}`;
}

exports.userRegister = async (req, res) => {
    const { fullName, email, password } = req.body;
    const userId = generateUserId();

    // Validasi request
    if (!email || !password || !fullName) {
        return res.status(400).send({
            error: true,
            message: 'All fields are required!',
        });
    }

    if (!email.includes('@')) {
        return res.status(400).send({
            error: true,
            message: 'Email must contain @!',
        });
    }

    if (password.length < 8) {
        return res.status(400).send({
            error: true,
            message: 'Password must be at least 8 characters long!',
        });
    }

    try {
        const usersCollection = db.collection('users');
        const query = usersCollection.where('email', '==', email);
        const snapshot = await query.get();
        console.log(snapshot.empty);

        if (!snapshot.empty) {
            return res.status(400).send({
                error: true,
                message: 'Email already registered!',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        await usersCollection.doc(userId).set({
            fullName,
            email,
            password: hashedPassword,
            createdAt,
            updatedAt
        });

        return res.status(201).send({ 
            error: false, 
            message: 'User registered successfully!',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ 
            error: true,
            message: 'Internal server error!' 
        });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validasi request
    if (!email || !password) {
        return res.status(400).send({
            error: true,
            message: 'All fields are required!',
        });
    }

    if (!email.includes('@')) {
        return res.status(400).send({
            error: true,
            message: 'Email must contain @!',
        });
    }

    if (password.length < 8) {
        return res.status(400).send({
            error: true,
            message: 'Password must be at least 8 characters long!',
        });
    }

    try {
        const usersCollection = db.collection('users');
        const query = usersCollection.where('email', '==', email);
        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.status(400).send({ 
                error: true,
                message: 'Email and password do not match!'
            });
        }

        // Ambil dokumen pertama dari snapshot
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                error: true,
                message: 'Email and password do not match!',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: userDoc.id, email: userData.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).send({
            error: false,
            message: 'Success logged in!',
            loginResult: {
                userId: userData.id,
                email: userData.email,
                fullName: userData.fullName,
                token,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: true,
            message: 'Internal server error!'
        });
    }
};
