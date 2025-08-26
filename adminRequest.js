const express = require('express');
const router = express.Router();
const adminRequestModel = require('./adminRequest'); // lowercase
const authMiddleware = require('./middleware/auth');

// Create admin request
router.post('/', authMiddleware, async (req, res) => {
    const { type, reason, requestedBy } = req.body;
    const request = await adminRequestModel.create({ type, reason, requestedBy });
    res.json(request);
});

// Get all admin requests
router.get('/', authMiddleware, async (req, res) => {
    const requests = await adminRequestModel.find().populate('requestedBy', 'fullName role');
    res.json(requests);
});

module.exports = router;
