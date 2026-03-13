const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'College email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    handles: {
        leetcode: { type: String, default: '' },
        codeforces: { type: String, default: '' },
        codechef: { type: String, default: '' },
        geeksforgeeks: { type: String, default: '' },
    },
    stats: {
        leetcode: {
            totalSolved: { type: Number, default: 0 },
            monthlySolved: { type: Number, default: 0 },
            rating: { type: Number, default: 0 },
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            globalRanking: { type: Number, default: 0 },
            contestsAttended: { type: Number, default: 0 },
        },
        codeforces: {
            totalSolved: { type: Number, default: 0 },
            monthlySolved: { type: Number, default: 0 },
            rating: { type: Number, default: 0 },
            maxRating: { type: Number, default: 0 },
            rank: { type: String, default: 'unrated' },
        },
        codechef: {
            totalSolved: { type: Number, default: 0 },
            monthlySolved: { type: Number, default: 0 },
            rating: { type: Number, default: 0 },
            stars: { type: String, default: '0' },
        },
    },
    lastStatsUpdate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
