const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const db = require('../services/firestore');

exports.userRegister = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).send({ 
                status: 'failed', 
                message: 'Email already registered!' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        await userRef.set({
            fullName,
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

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();
        console.log(userDoc);

        // Periksa apakah input adalah email
        if (!userDoc.exists) {
            return res.status(400).send({ 
                status: 'failed', 
                message: 'Email and password do not match!' 
            });
        }

        // Ambil dokumen pertama (karena Firestore mengembalikan query snapshot)
        const userData = userDoc.data();
        console.log(userData);

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                status: 'failed',
                message: 'Email and password do not match!',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { username: email },
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
            message: 'Internal server error!'
        });
    }
};
