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

        // Check if the user already exists
        if (userDoc.exists) {
            return res.status(400).send({ status: 'failed', message: 'Username already exists!' });
        }

        // Save user to Firestore
        const hashedPassword = await bcrypt.hash(password, 10);
        await userRef.set({
            fullName,
            email,
            username,
            password: hashedPassword,
        });

        return res.status(201).send({ status: 'succes', message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'failed', message: 'Internal server error!' });
    }
};

// Login
exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Retrieve user from Firestore
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userDoc.exists) {
            return res.status(401).send({ status: 'failed', message: 'Username and password does not match!' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).send({ status: 'failed', message: 'Username and password does not match!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).send(
            {
                status: 'succes',
                message: 'Login successful!',
                token
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 'failed', message: 'Internal server error' });
    }
};
