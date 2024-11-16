const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const db = require('../db/firestore');

// Register
exports.userRegister = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user already exists
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).send({ message: 'User already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to Firestore
        await userRef.set({
            username,
            password: hashedPassword,
        });

        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// Login
exports.userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Retrieve user from Firestore
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(401).send({ message: 'Invalid credentials!' });
        }

        const userData = userDoc.data();

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid credentials!' });
        }

        // Generate JWT token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};