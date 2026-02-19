const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Sale = require('./models/Sale');
const Notification = require('./models/Notification');

async function reseed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Target users
        const admin = await User.findOne({ role: 'admin' });
        const heman = await User.findOne({ name: /heman1/i });

        if (!admin || !heman) {
            console.log('Missing target users (Admin or heman1)');
            process.exit(1);
        }

        // 1. Clear ALL notifications for these users to start fresh
        await Notification.deleteMany({ recipient: { $in: [admin._id, heman._id] } });
        console.log('✅ Cleared old notifications');

        // 2. Create fresh unread notifications
        const sales = await Sale.find({}).limit(3);

        const freshNotifs = [
            // Unread for Admin
            {
                recipient: admin._id,
                title: 'New Sale: Testing',
                message: '₹5,000 - Professional Service',
                type: 'sale',
                read: false,
                createdAt: new Date()
            },
            {
                recipient: admin._id,
                title: 'Target Update',
                message: 'Monthly target is 80% complete.',
                type: 'target',
                read: false,
                createdAt: new Date(Date.now() - 3600000) // 1 hour ago
            },
            // Unread for Heman
            {
                recipient: heman._id,
                title: 'Sale Approved',
                message: 'Your sale of ₹1,000 for HHHH has been approved.',
                type: 'sale',
                read: false,
                createdAt: new Date()
            }
        ];

        await Notification.insertMany(freshNotifs);
        console.log('✅ Seeded 3 unread notifications');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error reseeding:', error);
        process.exit(1);
    }
}

reseed();
