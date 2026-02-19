const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Sale = require('./models/Sale');
const Notification = require('./models/Notification');

async function debugSeed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: /heman1/i });
        if (!user) {
            console.log('User heman1 not found');
            process.exit(1);
        }

        console.log('Generating 3 fresh unread notifications for heman1:', user._id);

        const sales = await Sale.find({ seller: user._id }).limit(3);

        const newNotifs = [
            {
                recipient: user._id,
                title: 'Test Notification 1',
                message: 'This is a test unread notification generated at ' + new Date().toLocaleTimeString(),
                type: 'system',
                read: false
            },
            {
                recipient: user._id,
                title: 'Test Notification 2',
                message: 'Another unread test notification',
                type: 'sale',
                read: false,
                relatedId: sales[0]?._id
            }
        ];

        await Notification.insertMany(newNotifs);
        console.log('✅ Seeded 2 unread notifications for heman1');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debugSeed();
