const express = require('express');
const router = express.Router();
const AdminRequest = require('./AdminRequest'); // new model
const authMiddleware = require('./middleware/auth');

// GET all requests (Super Admin)
router.get('/admin-requests', authMiddleware, async (req, res) => {
    if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const requests = await AdminRequest.find({}).populate('admin');
    res.json(requests);
});

// POST a request (Admin)
router.post('/admin-requests', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { actionType, reason } = req.body;
    if (!actionType || !reason) return res.status(400).json({ error: 'All fields are required' });

    const newRequest = new AdminRequest({ admin: req.user._id, actionType, reason });
    await newRequest.save();
    res.json(newRequest);
});

// PATCH approve/deny (Super Admin)
router.patch('/admin-requests/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const { status } = req.body; // "Approved" or "Denied"
    const request = await AdminRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    request.status = status;
    await request.save();
    res.json(request);
});

module.exports = router;
