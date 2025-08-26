const express = require('express');
const router = express.Router();
const adminRequestModel = require('./adminRequest');
const authMiddleware = require('./auth');

router.post('/', authMiddleware, async (req, res) => {
    const { type, reason, requestedBy } = req.body;
    const request = await adminRequestModel.create({ type, reason, requestedBy });
    res.json(request);
});

router.get('/', authMiddleware, async (req, res) => {
    const requests = await adminRequestModel.find().populate('requestedBy', 'fullName role');
    res.json(requests);
});

module.exports = router;
