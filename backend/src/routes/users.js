const express = require('express');
const User = require('../models/User');
const Sale = require('../models/Sale');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all sellers (admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const { city, search, includeInactive } = req.query;

        let query = { role: 'seller' };

        // By default, only show active users unless includeInactive is true
        if (includeInactive !== 'true') {
            query.isActive = true;
        }

        if (city) query.city = city;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        // Get sales stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const stats = await Sale.aggregate([
                { $match: { seller: user._id, status: 'Approved' } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$amount' },
                        totalCommission: { $sum: '$commission' },
                        salesCount: { $sum: 1 }
                    }
                }
            ]);

            return {
                ...user.toObject(),
                stats: stats[0] || { totalSales: 0, totalCommission: 0, salesCount: 0 }
            };
        }));

        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/users/cities/list
// @desc    Get list of unique cities
// @access  Private
router.get('/cities/list', protect, async (req, res) => {
    try {
        const cities = await User.distinct('city', { city: { $exists: true, $ne: null, $ne: '' } });
        res.json(cities.filter(c => c));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin or Self
router.get('/:id', protect, async (req, res) => {
    try {
        // Allow admin or self
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user stats - only approved sales
        const stats = await Sale.aggregate([
            { $match: { seller: user._id, status: 'Approved' } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    salesCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            ...user.toObject(),
            stats: stats[0] || { totalSales: 0, totalCommission: 0, salesCount: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/users
// @desc    Create new seller (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, city, phone, commissionRate } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'seller',
            city,
            phone,
            commissionRate: commissionRate || 10
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            phone: user.phone,
            commissionRate: user.commissionRate,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, city, phone, isActive, commissionRate, password } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (city !== undefined) updateData.city = city;
        if (phone !== undefined) updateData.phone = phone;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (commissionRate !== undefined) updateData.commissionRate = commissionRate;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle password update separately (needs to go through pre-save hook)
        if (password && password.length >= 6) {
            user.password = password;
            Object.assign(user, updateData);
            await user.save();
        } else {
            user = await User.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
