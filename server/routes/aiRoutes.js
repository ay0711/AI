const express = require('express');
const router = express.Router();
const { generateContent, listModels } = require('../controller/aiController');

router.post('/generate', generateContent);
router.get('/models', listModels);

module.exports = router;
