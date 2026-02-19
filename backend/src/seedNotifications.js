const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Sale = require('./models/Sale');
const Notification = require('./models/Notification');

async function seedNotifications() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // Clear existing notifications (optional, but good for testing)
        // await Notification.deleteMany({});

        const admins = await User.find({ role: 'admin' });
        if (admins.length === 0) {
            console.log('No admins found to notify.');
            process.exit(0);
        }

        // Get last 10 sales
        const recentSales = await Sale.find({})
            .sort({ date: -1 })
            .limit(10)
            .populate('seller', 'name');

        if (recentSales.length === 0) {
            console.log('No sales found to migrate.');
            process.exit(0);
        }

        const notifications = [];

        for (const sale of recentSales) {
            // For each sale, notify all admins
            for (const admin of admins) {
                notifications.push({
                    recipient: admin._id,
                    title: 'Existing Sale Record',
                    message: `${sale.seller?.name || 'A seller'} had a sale of ₹${sale.amount.toLocaleString()} for ${sale.serviceName}`,
                    type: 'sale',
                    relatedId: sale._id,
                    read: true, // Mark as read since they are old
                    createdAt: sale.date
                });
            }

            // Also notify the seller if it's approved/rejected
            if (sale.status !== 'Pending') {
                notifications.push({
                    recipient: sale.seller._id,
                    title: `Sale ${sale.status}`,
                    message: `Your sale of ₹${sale.amount.toLocaleString()} for ${sale.serviceName} was ${sale.status.toLowerCase()}.`,
                    type: 'sale',
                    relatedId: sale._id,
                    read: true,
                    createdAt: sale.approvedAt || sale.date
                });
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`✅ Seeded ${notifications.length} notifications.`);
        } else {
            console.log('No notifications to seed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
        process.exit(1);
    }
}

seedNotifications();
