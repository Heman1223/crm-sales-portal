const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    achievedAmount: {
        type: Number,
        default: 0
    },
    targetClients: {
        type: Number,
        default: 10
    },
    achievedClients: {
        type: Number,
        default: 0
    },
    targetPremiumSales: {
        type: Number,
        default: 3
    },
    achievedPremiumSales: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique seller-month-year
targetSchema.index({ seller: 1, month: 1, year: 1 }, { unique: true });

// Virtual for percentage achieved
targetSchema.virtual('percentageAchieved').get(function () {
    if (this.targetAmount === 0) return 0;
    return Math.round((this.achievedAmount / this.targetAmount) * 100);
});

// Update timestamp on save
targetSchema.pre('save', function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('Target', targetSchema);
