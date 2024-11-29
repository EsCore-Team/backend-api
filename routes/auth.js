const express = require('express');
const router = express.Router();
const { userRegister, userLogin } = require("../controllers/authController.js");
const { historyPredict } = require('../controllers/historyController.js');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/history/:email', historyPredict);

module.exports = router;