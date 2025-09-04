const express = require('express');
const router = express.Router();
const User = require('./user');
const authMiddleware = require('./middleware/auth');

// GET all users (Super Admin only)
router.get('/users', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const users = await User.find({});
    res.json(users);
});

// Suspend user
router.patch('/users/:id/suspend', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ error: 'User not found' });
    user.isSuspended = true;
    await user.save();
    res.json({ message: 'User suspended' });
});

// Delete user
router.delete('/users/:id', authMiddleware, async (req, res) => {
    if(req.user.role !== 'super-admin') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted permanently' });
});

module.exports = router;
