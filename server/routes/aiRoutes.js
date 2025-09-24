const express = require('express');
const router = express.Router();
const { generateContent } = require('../controller/aiController');

router.post('/generate', generateContent);

module.exports = router;
