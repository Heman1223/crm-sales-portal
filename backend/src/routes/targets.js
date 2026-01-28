const express = require('express');
const Target = require('../models/Target');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/targets
// @desc    Get targets (admin: all, seller: own)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { month, year, seller } = req.query;

        let query = {};

        // Sellers can only see their own targets
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        } else if (seller) {
            query.seller = seller;
        }

        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        const targets = await Target.find(query)
            .populate('seller', 'name email city')
            .sort({ year: -1, month: -1 });

        res.json(targets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/targets/current
// @desc    Get current month target
// @access  Private
router.get('/current', protect, async (req, res) => {
    try {
        const now = new Date();
        let query = {
            month: now.getMonth() + 1,
            year: now.getFullYear()
        };

        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const targets = await Target.find(query)
            .populate('seller', 'name email city');

        res.json(targets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/targets/:id
// @desc    Get target by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const target = await Target.findById(req.params.id)
            .populate('seller', 'name email city');

        if (!target) {
            return res.status(404).json({ message: 'Target not found' });
        }

        // Sellers can only view their own targets
        if (req.user.role === 'seller' && target.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(target);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/targets
// @desc    Create or update target (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { seller, month, year, targetAmount, targetClients, targetPremiumSales } = req.body;

        // Check if target already exists for this seller/month/year
        let target = await Target.findOne({ seller, month, year });

        if (target) {
            // Update existing target
            target.targetAmount = targetAmount;
            target.targetClients = targetClients || target.targetClients;
            target.targetPremiumSales = targetPremiumSales || target.targetPremiumSales;
            await target.save();
        } else {
            // Create new target
            target = await Target.create({
                seller,
                month,
                year,
                targetAmount,
                targetClients: targetClients || 10,
                targetPremiumSales: targetPremiumSales || 3
            });
        }

        const populatedTarget = await Target.findById(target._id)
            .populate('seller', 'name email city');

        res.status(201).json(populatedTarget);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/targets/:id
// @desc    Update target (admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { targetAmount, targetClients, targetPremiumSales, achievedAmount, achievedClients, achievedPremiumSales } = req.body;

        const target = await Target.findByIdAndUpdate(
            req.params.id,
            {
                targetAmount,
                targetClients,
                targetPremiumSales,
                achievedAmount,
                achievedClients,
                achievedPremiumSales
            },
            { new: true, runValidators: true }
        ).populate('seller', 'name email city');

        if (!target) {
            return res.status(404).json({ message: 'Target not found' });
        }

        res.json(target);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/targets/:id
// @desc    Delete target (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const target = await Target.findByIdAndDelete(req.params.id);

        if (!target) {
            return res.status(404).json({ message: 'Target not found' });
        }

        res.json({ message: 'Target deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
