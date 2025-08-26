const express = require('express');
const router = express.Router();
const AdminRequest = require('./adminRequestModel'); // lowercase
const authMiddleware = require('./middleware/auth');

// Create request
router.post('/', authMiddleware, async (req, res) => {
    const { type, reason, requestedBy } = req.body;
    const request = await AdminRequest.create({ type, reason, requestedBy });
    res.json(request);
});

// Get all requests
router.get('/', authMiddleware, async (req, res) => {
    const requests = await AdminRequest.find().populate('requestedBy', 'fullName role');
    res.json(requests);
});

module.exports = router;
