const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Send response with token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            phone: user.phone,
            avatar: user.avatar,
            commissionRate: user.commissionRate,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register new user (admin creates sellers, or first admin)
// @access  Public for first admin, then Admin only
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, city, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Check if this is the first user (make them admin)
        const userCount = await User.countDocuments();
        const userRole = userCount === 0 ? 'admin' : (role || 'seller');

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            city,
            phone
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            phone: user.phone,
            avatar: user.avatar,
            commissionRate: user.commissionRate,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, city } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, city },
            { new: true, runValidators: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/avatar
// @desc    Upload avatar (base64)
// @access  Private
router.post('/avatar', protect, async (req, res) => {
    try {
        // For simple implementation, accept base64 directly in JSON
        // The frontend will convert the file to base64
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({ message: 'No avatar provided' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar },
            { new: true }
        );

        res.json({ avatar: user.avatar });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
