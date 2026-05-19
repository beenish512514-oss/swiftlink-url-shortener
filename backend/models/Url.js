const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
    // NEW: Relationship linking this URL to a specific User account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Can be null if shortened without logging in
    },
    date: {
        type: String,
        default: () => new Date().toISOString()
    }
});

module.exports = mongoose.model('Url', UrlSchema);