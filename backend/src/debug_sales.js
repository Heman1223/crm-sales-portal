const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Sale = require('./models/Sale');

async function debugSales() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const sales = await Sale.find({
            serviceName: { $regex: 'Backup', $options: 'i' }
        });

        console.log(`Found ${sales.length} sales matching "Backup"`);

        sales.forEach(sale => {
            console.log('---------------------------------------------------');
            console.log(`ID: ${sale._id}`);
            console.log(`Service Name: "${sale.serviceName}"`); // Quotes to see whitespace
            console.log(`Status: ${sale.status}`);
            console.log(`Amount: ${sale.amount}`);
            console.log(`Seller ID: ${sale.seller}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugSales();
