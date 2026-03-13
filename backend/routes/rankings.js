const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRankings, refreshMyStats } = require('../controllers/rankingsController');

router.get('/:platform', auth, getRankings);
router.post('/refresh', auth, refreshMyStats);

module.exports = router;
