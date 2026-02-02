const express = require('express');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filtering and sorting
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { includeInactive, category, sortBy = 'name', sortOrder = 'asc' } = req.query;

        let query = {};
        if (includeInactive !== 'true') {
            query.isActive = true;
        }
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        // Build sort object
        const sortObj = {};
        if (sortBy === 'commission') {
            sortObj.commissionRate = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'price') {
            sortObj.basePrice = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const services = await Service.find(query).sort(sortObj);
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/services/categories
// @desc    Get all service categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await Service.distinct('category', { isActive: true });
        res.json(categories.sort());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/services/rate-card
// @desc    Get services formatted as rate card with filtering
// @access  Private
router.get('/rate-card', protect, async (req, res) => {
    try {
        const { category, search, sortBy = 'category', sortOrder = 'asc' } = req.query;

        let query = { isActive: true };
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortObj = {};
        if (sortBy === 'commission') {
            sortObj.commissionRate = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'price') {
            sortObj.basePrice = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const services = await Service.find(query).sort(sortObj);

        // Group by category for better presentation
        const groupedServices = services.reduce((acc, service) => {
            const category = service.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {});

        res.json({
            services,
            groupedServices,
            totalServices: services.length,
            categories: Object.keys(groupedServices).sort()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/services
// @desc    Create new service (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, description, category, basePrice, commissionRate } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Service name and category are required' });
        }

        // Check if service exists
        const existing = await Service.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        if (existing) {
            return res.status(400).json({ message: 'Service with this name already exists' });
        }

        const service = await Service.create({
            name: name.trim(),
            description: description?.trim(),
            category: category.trim(),
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
        const { name, description, category, basePrice, commissionRate, isActive } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (category !== undefined) updateData.category = category.trim();
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