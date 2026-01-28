const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    basePrice: {
        type: Number,
        default: 0,
        min: 0
    },
    commissionRate: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Service', serviceSchema);
