const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Sale = require('./models/Sale');
const Target = require('./models/Target');
const Service = require('./models/Service');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Sale.deleteMany({});
        await Target.deleteMany({});
        await Service.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create default services
        const defaultServices = [
            { name: 'Starter Package', description: 'Basic CRM features for small teams', basePrice: 15000, commissionRate: 10 },
            { name: 'Standard Plan', description: 'Full CRM features with analytics', basePrice: 35000, commissionRate: 10 },
            { name: 'Premium CRM Package', description: 'Advanced features with priority support', basePrice: 75000, commissionRate: 12 },
            { name: 'Enterprise Suite', description: 'Complete enterprise solution', basePrice: 150000, commissionRate: 15 }
        ];

        await Service.insertMany(defaultServices);
        console.log('📦 Created default services');

        // Create Admin
        const admin = await User.create({
            name: 'Demo Admin',
            email: 'admin@salesedge.com',
            password: 'admin123',
            role: 'admin',
            city: 'Mumbai',
            phone: '+91 98765 43210',
            commissionRate: 10,
            isActive: true
        });
        console.log('👤 Created admin:', admin.email);

        // Create Demo Seller
        const demoSeller = await User.create({
            name: 'Demo Seller',
            email: 'seller@salesedge.com',
            password: 'seller123',
            role: 'seller',
            city: 'Mumbai',
            phone: '+91 98765 99999',
            commissionRate: 10,
            isActive: true
        });
        console.log('👤 Created demo seller:', demoSeller.email);

        // Create current month target for demo seller
        const now = new Date();
        await Target.create({
            seller: demoSeller._id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            targetAmount: 500000,
            achievedAmount: 0,
            targetClients: 10,
            achievedClients: 0,
            targetPremiumSales: 3,
            achievedPremiumSales: 0
        });
        console.log('🎯 Created target for demo seller');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📝 Demo Credentials:');
        console.log('   Admin: admin@salesedge.com / admin123');
        console.log('   Seller: seller@salesedge.com / seller123');
        console.log('\n💡 Note: Database is clean. Add sellers and sales through the app.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
