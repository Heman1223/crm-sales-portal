const express = require('express');
const Sale = require('../models/Sale');
const User = require('../models/User');
const Target = require('../models/Target');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/sales
// @desc    Get sales (admin: all, seller: own)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log('Sales GET - User:', req.user?.name, 'Role:', req.user?.role);
        const { status, city, startDate, endDate, limit = 50, service } = req.query;

        let query = {};

        // Sellers can only see their own sales
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        if (status) query.status = status;
        if (city) query.city = { $regex: city, $options: 'i' };
        if (service) query.service = service;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        console.log('Sales GET - Query:', JSON.stringify(query));

        const sales = await Sale.find(query)
            .populate('seller', 'name email city commissionRate')
            .sort({ date: -1 })
            .limit(parseInt(limit));

        console.log('Sales GET - Found:', sales.length, 'sales');
        res.json(sales);
    } catch (error) {
        console.error('Sales GET Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/sales/stats
// @desc    Get sales statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        let matchQuery = {};

        // Sellers only see their own stats
        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

        // Overall stats
        const overallStats = await Sale.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    totalSales: { $sum: 1 },
                    completedSales: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Monthly revenue (last 12 months)
        const monthlyRevenue = await Sale.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    revenue: { $sum: '$amount' },
                    commission: { $sum: '$commission' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        res.json({
            overall: overallStats[0] || { totalRevenue: 0, totalCommission: 0, totalSales: 0, completedSales: 0 },
            monthly: monthlyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('seller', 'name email city');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Sellers can only view their own sales
        if (req.user.role === 'seller' && sale.seller._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('Sales POST - User:', req.user?.name, 'Role:', req.user?.role);
        console.log('Sales POST - Body:', JSON.stringify(req.body));

        const { client, service, amount, city, notes, commissionRate } = req.body;

        // Validate required fields
        if (!client || !service || !amount) {
            return res.status(400).json({ message: 'Client, service, and amount are required' });
        }

        // Determine seller
        let sellerId = req.user._id;
        let sellerCommissionRate = req.user.commissionRate || 10;

        // Admin can create sales for any seller
        if (req.user.role === 'admin' && req.body.seller) {
            sellerId = req.body.seller;
            // Get seller's commission rate
            const seller = await User.findById(sellerId);
            if (seller) {
                sellerCommissionRate = seller.commissionRate || 10;
            }
        }

        const saleData = {
            seller: sellerId,
            client,
            service,
            amount,
            city: city || req.user.city || 'Unknown',
            notes,
            commissionRate: commissionRate || sellerCommissionRate
        };
        console.log('Sales POST - Creating sale with data:', JSON.stringify(saleData));

        const sale = await Sale.create(saleData);
        console.log('Sales POST - Sale created:', sale._id);

        // Update target achieved amount
        const now = new Date();
        const isPremium = ['Premium CRM Package', 'Enterprise Suite'].includes(service);

        await Target.findOneAndUpdate(
            {
                seller: sellerId,
                month: now.getMonth() + 1,
                year: now.getFullYear()
            },
            {
                $inc: {
                    achievedAmount: amount,
                    achievedClients: 1,
                    achievedPremiumSales: isPremium ? 1 : 0
                }
            }
        );
        console.log('Sales POST - Target updated');

        const populatedSale = await Sale.findById(sale._id).populate('seller', 'name email city');

        res.status(201).json(populatedSale);
    } catch (error) {
        console.error('Sales POST Error:', error.message);
        console.error('Sales POST Error Stack:', error.stack);
        if (error.errors) {
            console.error('Validation errors:', JSON.stringify(error.errors));
        }
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            validationErrors: error.errors ? Object.keys(error.errors) : null
        });
    }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Sellers can only update their own pending sales
        if (req.user.role === 'seller') {
            if (sale.seller.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
            if (sale.status !== 'Pending') {
                return res.status(400).json({ message: 'Can only edit pending sales' });
            }
        }

        const { client, service, amount, status, city, notes } = req.body;

        // Update fields
        if (client !== undefined) sale.client = client;
        if (service !== undefined) sale.service = service;
        if (amount !== undefined) {
            sale.amount = amount;
            // Recalculate commission
            sale.commission = amount * (sale.commissionRate / 100);
        }
        if (status !== undefined && req.user.role === 'admin') sale.status = status;
        if (city !== undefined) sale.city = city;
        if (notes !== undefined) sale.notes = notes;

        await sale.save();

        const updatedSale = await Sale.findById(req.params.id)
            .populate('seller', 'name email city');

        res.json(updatedSale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
