const express = require('express');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { includeInactive } = req.query;

        let query = {};
        if (includeInactive !== 'true') {
            query.isActive = true;
        }

        const services = await Service.find(query).sort({ name: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/services
// @desc    Create new service (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, basePrice, commissionRate } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Service name is required' });
        }

        // Check if service exists
        const existing = await Service.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        if (existing) {
            return res.status(400).json({ message: 'Service with this name already exists' });
        }

        const service = await Service.create({
            name,
            description,
            basePrice: basePrice || 0,
            commissionRate: commissionRate || 10
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/services/:id
// @desc    Update service (admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, basePrice, commissionRate, isActive } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (basePrice !== undefined) updateData.basePrice = basePrice;
        if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
        if (isActive !== undefined) updateData.isActive = isActive;

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/services/:id
// @desc    Deactivate service (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json({ message: 'Service deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
