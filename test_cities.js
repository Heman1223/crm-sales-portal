const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/src/models/User');

const checkCities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const cities = await User.distinct('city', { city: { $exists: true, $ne: null, $ne: '' } });
        console.log('Cities in User model:', cities);

        const usersWithCity = await User.find({ city: { $exists: true, $ne: null, $ne: '' } }, 'name city');
        console.log('Users with city:', usersWithCity);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCities();
