const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
const Sale = require('./models/Sale');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Simulate the inputs
    const service = "Backup & Recovery";

    const matchQuery = {
        status: 'Approved',
        serviceName: { $regex: service, $options: 'i' }
    };

    console.log("Match Query:", matchQuery);

    // Check count of matches first
    const count = await Sale.countDocuments(matchQuery);
    console.log("Matching Documents Count:", count);

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
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        // We use preserveNullAndEmptyArrays: true to see if lookup failed
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
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

    const results = await Sale.aggregate(pipeline);
    console.log("Aggregation Results:", JSON.stringify(results, null, 2));

    await mongoose.disconnect();
}

run();
