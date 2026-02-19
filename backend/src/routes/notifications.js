const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user._id, req.user.name);
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        console.log(`Found ${notifications.length} notifications for user ${req.user.name}`);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark individual notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all user's notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
