const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).send({ message: 'Access denied!' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).send({ message: 'Invalid token!' });
    }
};

module.exports = authenticate;
