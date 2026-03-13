const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, logout, getProfile, updateHandles } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);
router.put('/profile/handles', auth, updateHandles);

module.exports = router;
