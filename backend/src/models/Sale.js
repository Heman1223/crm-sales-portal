const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true
    },
    service: {
        type: String,
        required: [true, 'Service is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    commission: {
        type: Number,
        default: 0
    },
    commissionRate: {
        type: Number,
        default: 10 // percentage
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Approval metadata
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String,
        trim: true
    }
});

// Commission is calculated only when sale is approved (in the API route)
// No automatic commission calculation on save

// Index for efficient queries
saleSchema.index({ seller: 1, date: -1 });
saleSchema.index({ city: 1 });
saleSchema.index({ status: 1 });

module.exports = mongoose.model('Sale', saleSchema);
