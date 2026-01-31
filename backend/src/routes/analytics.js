const express = require('express');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard stats (ONLY APPROVED SALES)
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        let matchQuery = {
            status: 'Approved' // Only count approved sales
        };

        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

        // Current month stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // This month stats - only approved sales
        const thisMonthStats = await Sale.aggregate([
            {
                $match: {
                    ...matchQuery,
                    date: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    totalSales: { $sum: 1 }
                }
            }
        ]);

        // Last month stats - only approved sales
        const lastMonthStats = await Sale.aggregate([
            {
                $match: {
                    ...matchQuery,
                    date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    totalSales: { $sum: 1 }
                }
            }
        ]);

        // Active sellers count (admin only)
        let activeSellers = 0;
        if (req.user.role === 'admin') {
            activeSellers = await User.countDocuments({ role: 'seller', isActive: true });
        } else if (req.user.role === 'seller' && req.user.city) {
            // For sellers, count team members in their city
            activeSellers = await User.countDocuments({ role: 'seller', isActive: true, city: req.user.city });
        }

        // Calculate trends
        const thisMonth = thisMonthStats[0] || { totalRevenue: 0, totalCommission: 0, totalSales: 0 };
        const lastMonth = lastMonthStats[0] || { totalRevenue: 0, totalCommission: 0, totalSales: 0 };

        const revenueTrend = lastMonth.totalRevenue > 0
            ? ((thisMonth.totalRevenue - lastMonth.totalRevenue) / lastMonth.totalRevenue * 100).toFixed(1)
            : 0;
        const salesTrend = lastMonth.totalSales > 0
            ? ((thisMonth.totalSales - lastMonth.totalSales) / lastMonth.totalSales * 100).toFixed(1)
            : 0;
        const commissionTrend = lastMonth.totalCommission > 0
            ? ((thisMonth.totalCommission - lastMonth.totalCommission) / lastMonth.totalCommission * 100).toFixed(1)
            : 0;

        res.json({
            thisMonth,
            lastMonth,
            trends: {
                revenue: parseFloat(revenueTrend),
                sales: parseFloat(salesTrend),
                commission: parseFloat(commissionTrend)
            },
            activeSellers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/revenue
// @desc    Get monthly revenue data (ONLY APPROVED SALES)
// @access  Private
router.get('/revenue', protect, async (req, res) => {
    try {
        let matchQuery = {
            status: 'Approved' // Only count approved sales
        };

        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

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
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format for charts
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formatted = monthlyRevenue.map(item => ({
            name: monthNames[item._id.month - 1],
            month: item._id.month,
            year: item._id.year,
            revenue: item.revenue,
            commission: item.commission,
            count: item.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/cities
// @desc    Get city-wise performance (admin only, ONLY APPROVED SALES)
// @access  Private/Admin
router.get('/cities', protect, adminOnly, async (req, res) => {
    try {
        const cityStats = await Sale.aggregate([
            {
                $match: { status: 'Approved' } // Only count approved sales
            },
            {
                $group: {
                    _id: '$city',
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    salesCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Format to match frontend expectations
        const formatted = cityStats.map(item => ({
            city: item._id || 'Unknown',
            revenue: item.totalRevenue || 0,
            commission: item.totalCommission || 0,
            salesCount: item.salesCount || 0
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Cities analytics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/top-performers
// @desc    Get top performing sellers (ONLY APPROVED SALES, city-filtered for sellers)
// @access  Private
router.get('/top-performers', protect, async (req, res) => {
    try {
        const { limit = 10, city, service, period } = req.query;

        // Build match query based on filters
        let matchQuery = {
            status: 'Approved' // Only count approved sales
        };

        // SELLER VISIBILITY: Sellers can only see performers from their own city
        if (req.user.role === 'seller' && req.user.city) {
            matchQuery.city = req.user.city;
        } else if (city) {
            // Admin can filter by specific city
            matchQuery.city = { $regex: city, $options: 'i' };
        }

        if (service) {
            matchQuery.service = service;
        }

        if (period) {
            const now = new Date();
            let startDate;

            if (period === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (period === 'quarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
            } else if (period === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
            }

            if (startDate) {
                matchQuery.date = { $gte: startDate };
            }
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $group: {
                    _id: '$seller',
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    salesCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    city: '$user.city',
                    totalRevenue: 1,
                    totalCommission: 1,
                    salesCount: 1
                }
            }
        ];

        const topPerformers = await Sale.aggregate(pipeline);

        res.json(topPerformers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/sales-distribution
// @desc    Get sales distribution by service type (ONLY APPROVED SALES)
// @access  Private
router.get('/sales-distribution', protect, async (req, res) => {
    try {
        let matchQuery = {
            status: 'Approved' // Only count approved sales
        };

        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

        const distribution = await Sale.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$service',
                    value: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { value: -1 } }
        ]);

        const formatted = distribution.map(item => ({
            name: item._id,
            value: item.value,
            count: item.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/weekly
// @desc    Get weekly comparison data (ONLY APPROVED SALES)
// @access  Private
router.get('/weekly', protect, async (req, res) => {
    try {
        let matchQuery = {
            status: 'Approved' // Only count approved sales
        };

        if (req.user.role === 'seller') {
            matchQuery.seller = req.user._id;
        }

        // Get last 4 weeks
        const now = new Date();
        const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

        const weeklyData = await Sale.aggregate([
            {
                $match: {
                    ...matchQuery,
                    date: { $gte: fourWeeksAgo }
                }
            },
            {
                $group: {
                    _id: { $week: '$date' },
                    revenue: { $sum: '$amount' },
                    commission: { $sum: '$commission' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formatted = weeklyData.map((item, index) => ({
            name: `Week ${index + 1}`,
            revenue: item.revenue,
            commission: item.commission,
            count: item.count
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/analytics/city-team
// @desc    Get city team performance (for sellers to see their city's data)
// @access  Private
router.get('/city-team', protect, async (req, res) => {
    try {
        // Only sellers use this endpoint - they see their city's data
        if (req.user.role !== 'seller' || !req.user.city) {
            return res.status(400).json({ message: 'This endpoint is for sellers only' });
        }

        const city = req.user.city;

        // Get city-level stats
        const cityStats = await Sale.aggregate([
            {
                $match: {
                    city: city,
                    status: 'Approved'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalCommission: { $sum: '$commission' },
                    salesCount: { $sum: 1 }
                }
            }
        ]);

        // Get team members in this city
        const teamMembers = await User.find({
            role: 'seller',
            city: city,
            isActive: true
        }).select('name email city');

        res.json({
            city,
            stats: cityStats[0] || { totalRevenue: 0, totalCommission: 0, salesCount: 0 },
            teamCount: teamMembers.length,
            teamMembers: teamMembers.map(m => ({ id: m._id, name: m.name, email: m.email }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
