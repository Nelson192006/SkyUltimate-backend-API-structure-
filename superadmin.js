const express = require('express');
const router = express.Router();
const User = require('./User');

// GET /check-for-super-admin
router.get('/check-for-super-admin', async (req, res) => {
    try {
        const superAdmin = await User.findOne({ role: 'super-admin' });
        res.json({ exists: !!superAdmin });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
