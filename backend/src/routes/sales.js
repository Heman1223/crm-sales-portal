const express = require('express');
const Sale = require('../models/Sale');
const User = require('../models/User');
const Target = require('../models/Target');
const Notification = require('../models/Notification');
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
        if (service) query.serviceName = { $regex: service, $options: 'i' };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                // Parse as local date to avoid UTC timezone offset issues
                const [sy, sm, sd] = startDate.split('-').map(Number);
                query.date.$gte = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
            }
            if (endDate) {
                // Parse as local date and set to end of day
                const [ey, em, ed] = endDate.split('-').map(Number);
                query.date.$lte = new Date(ey, em - 1, ed, 23, 59, 59, 999);
            }
        }

        console.log('Sales GET - Query:', JSON.stringify(query));

        const sales = await Sale.find(query)
            .populate('seller', 'name email city commissionRate')
            .populate('service', 'name category commissionRate basePrice')
            .populate('approvedBy', 'name')
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
// @desc    Get sales statistics (ONLY APPROVED SALES + PENDING REVENUE)
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        let matchQuery = {};

        // Sellers only see their own stats
        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

        // Approved sales stats
        const approvedStats = await Sale.aggregate([
            { $match: { ...matchQuery, status: 'Approved' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    totalSales: { $sum: 1 },
                    approvedSales: { $sum: 1 }
                }
            }
        ]);

        // Pending sales stats (pipeline revenue)
        const pendingStats = await Sale.aggregate([
            { $match: { ...matchQuery, status: 'Pending' } },
            {
                $group: {
                    _id: null,
                    pendingRevenue: { $sum: '$amount' },
                    pendingSales: { $sum: 1 }
                }
            }
        ]);

        // Monthly revenue (last 12 months) - only approved sales
        const monthlyRevenue = await Sale.aggregate([
            { $match: { ...matchQuery, status: 'Approved' } },
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

        const approved = approvedStats[0] || { totalRevenue: 0, totalCommission: 0, totalSales: 0, approvedSales: 0 };
        const pending = pendingStats[0] || { pendingRevenue: 0, pendingSales: 0 };

        res.json({
            overall: {
                ...approved,
                pendingRevenue: pending.pendingRevenue,
                pendingSales: pending.pendingSales
            },
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
        const sale = await Sale.findById(req.params.id)
            .populate('seller', 'name email city')
            .populate('approvedBy', 'name');

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
// @desc    Create new sale (Pending status, NO target updates until approval)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('Sales POST - User:', req.user?.name, 'Role:', req.user?.role);
        console.log('Sales POST - Body:', JSON.stringify(req.body));

        const { client, service, amount, city, notes } = req.body;

        // Validate required fields
        if (!client || !service || !amount) {
            return res.status(400).json({ message: 'Client, service, and amount are required' });
        }

        // Get service details for commission rate
        const Service = require('../models/Service');
        const serviceDoc = await Service.findById(service);
        if (!serviceDoc || !serviceDoc.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive service selected' });
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

        // Use service commission rate if available, otherwise use seller's rate
        const commissionRate = serviceDoc.commissionRate || sellerCommissionRate;

        const saleData = {
            seller: sellerId,
            client,
            service: serviceDoc._id,
            serviceName: serviceDoc.name,
            amount,
            city: city || req.user.city || 'Unknown',
            notes,
            commissionRate: commissionRate,
            status: 'Pending', // Always start as Pending
            commission: 0 // Commission is 0 until approved
        };
        console.log('Sales POST - Creating sale with data:', JSON.stringify(saleData));

        const sale = await Sale.create(saleData);
        console.log('Sales POST - Sale created:', sale._id);

        // NOTE: NO target updates here - targets are only updated upon approval

        const populatedSale = await Sale.findById(sale._id)
            .populate('seller', 'name email city')
            .populate('service', 'name category commissionRate');

        // Notify admins about new sale
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                recipient: admin._id,
                title: 'New Sale Submitted',
                message: `${populatedSale.seller?.name || 'A seller'} submitted a sale of ₹${amount.toLocaleString()} for ${populatedSale.serviceName}`,
                type: 'sale',
                relatedId: sale._id
            }));
            await Notification.insertMany(notifications);
        }

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

// @route   POST /api/sales/:id/approve
// @desc    Approve a sale (admin only) - calculates commission using service rate and updates targets
// @access  Private/Admin
router.post('/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id).populate('service', 'commissionRate name');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        if (sale.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending sales can be approved' });
        }

        // Calculate commission using service-specific rate if available
        const commissionRate = sale.service?.commissionRate || sale.commissionRate || 10;
        const commission = sale.amount * (commissionRate / 100);

        // Update sale to approved
        sale.status = 'Approved';
        sale.commission = commission;
        sale.commissionRate = commissionRate; // Update with final rate used
        sale.approvedAt = new Date();
        sale.approvedBy = req.user._id;

        await sale.save();

        // Update target achieved amounts
        const saleDate = new Date(sale.date);
        const isPremium = ['Premium CRM Package', 'Enterprise Suite'].includes(sale.serviceName);

        await Target.findOneAndUpdate(
            {
                seller: sale.seller,
                month: saleDate.getMonth() + 1,
                year: saleDate.getFullYear()
            },
            {
                $inc: {
                    achievedAmount: sale.amount,
                    achievedClients: 1,
                    achievedPremiumSales: isPremium ? 1 : 0
                }
            }
        );

        const populatedSale = await Sale.findById(sale._id)
            .populate('seller', 'name email city')
            .populate('service', 'name category commissionRate')
            .populate('approvedBy', 'name');

        console.log('Sale approved:', sale._id, 'by', req.user.name, 'with commission rate:', commissionRate + '%');

        res.json({
            message: 'Sale approved successfully',
            sale: populatedSale
        });

        // Notify seller about approval
        await Notification.create({
            recipient: sale.seller,
            title: 'Sale Approved',
            message: `Your sale of ₹${sale.amount.toLocaleString()} for ${sale.serviceName} has been approved.`,
            type: 'sale',
            relatedId: sale._id
        });
    } catch (error) {
        console.error('Approve Sale Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/sales/:id/reject
// @desc    Reject a sale (admin only)
// @access  Private/Admin
router.post('/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        if (sale.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending sales can be rejected' });
        }

        const { rejectionReason } = req.body;

        // Update sale to rejected
        sale.status = 'Rejected';
        sale.commission = 0;
        sale.rejectionReason = rejectionReason || 'No reason provided';
        sale.approvedBy = req.user._id; // Track who rejected it
        sale.approvedAt = new Date(); // Track when it was rejected

        await sale.save();

        // NOTE: No target updates for rejected sales

        const populatedSale = await Sale.findById(sale._id)
            .populate('seller', 'name email city')
            .populate('approvedBy', 'name');

        console.log('Sale rejected:', sale._id, 'by', req.user.name);

        res.json({
            message: 'Sale rejected',
            sale: populatedSale
        });

        // Notify seller about rejection
        await Notification.create({
            recipient: sale.seller,
            title: 'Sale Rejected',
            message: `Your sale of ₹${sale.amount.toLocaleString()} for ${sale.serviceName} was rejected. Reason: ${rejectionReason || 'No reason provided'}`,
            type: 'sale',
            relatedId: sale._id
        });
    } catch (error) {
        console.error('Reject Sale Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/sales/:id
// @desc    Update sale (Sellers: pending only, Admin: any)
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

        const { client, service, amount, city, notes } = req.body;

        // Update fields
        if (client !== undefined) sale.client = client;
        if (service !== undefined) sale.service = service;
        if (amount !== undefined) {
            sale.amount = amount;
            // If already approved, recalculate commission
            if (sale.status === 'Approved') {
                sale.commission = amount * (sale.commissionRate / 100);
            }
        }
        if (city !== undefined) sale.city = city;
        if (notes !== undefined) sale.notes = notes;

        // Admin can change status via PUT (but approve/reject endpoints are preferred)
        if (req.user.role === 'admin' && req.body.status !== undefined) {
            const oldStatus = sale.status;
            const newStatus = req.body.status;

            // If changing to Approved from Pending, handle the approval logic
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
                sale.status = 'Approved';
                sale.commission = sale.amount * (sale.commissionRate / 100);
                sale.approvedAt = new Date();
                sale.approvedBy = req.user._id;

                // Update targets
                const saleDate = new Date(sale.date);
                const isPremium = ['Premium CRM Package', 'Enterprise Suite'].includes(sale.service);
                await Target.findOneAndUpdate(
                    {
                        seller: sale.seller,
                        month: saleDate.getMonth() + 1,
                        year: saleDate.getFullYear()
                    },
                    {
                        $inc: {
                            achievedAmount: sale.amount,
                            achievedClients: 1,
                            achievedPremiumSales: isPremium ? 1 : 0
                        }
                    }
                );
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
                sale.status = 'Rejected';
                sale.commission = 0;
                sale.approvedBy = req.user._id;
                sale.approvedAt = new Date();
            } else {
                sale.status = newStatus;
            }
        }

        await sale.save();

        const updatedSale = await Sale.findById(req.params.id)
            .populate('seller', 'name email city')
            .populate('approvedBy', 'name');

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
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // If sale was approved, reverse the target updates
        if (sale.status === 'Approved') {
            const saleDate = new Date(sale.date);
            const isPremium = ['Premium CRM Package', 'Enterprise Suite'].includes(sale.service);

            await Target.findOneAndUpdate(
                {
                    seller: sale.seller,
                    month: saleDate.getMonth() + 1,
                    year: saleDate.getFullYear()
                },
                {
                    $inc: {
                        achievedAmount: -sale.amount,
                        achievedClients: -1,
                        achievedPremiumSales: isPremium ? -1 : 0
                    }
                }
            );
        }

        await Sale.findByIdAndDelete(req.params.id);

        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
