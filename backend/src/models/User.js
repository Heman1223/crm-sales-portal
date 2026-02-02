const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'seller'],
        default: 'seller'
    },
    city: {
        type: String,
        trim: true,
        set: function(value) {
            // Normalize city names: trim, capitalize first letter of each word
            if (!value) return value;
            return value.trim()
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
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

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get user initials
userSchema.methods.getInitials = function () {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
};

module.exports = mongoose.model('User', userSchema);
