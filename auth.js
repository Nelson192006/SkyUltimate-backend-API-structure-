const express = require('express');
const router = express.Router();
const User = require('./User'); // your User model
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ error: 'User not found' });

        // Generate token (valid for 1 hour)
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email (example)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: { user: 'YOUR_EMAIL@gmail.com', pass: 'YOUR_EMAIL_PASSWORD' }
        });
        const mailOptions = {
            to: user.email,
            from: 'no-reply@skyultimate.com',
            subject: 'Password Reset',
            text: `Use this link to reset your password: http://yourfrontend.com/reset-password/${token}`
        };
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Reset link sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if(!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = password; // hash in your existing logic
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
