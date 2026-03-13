const mongoose = require('mongoose');

// Cache the connection across Vercel serverless function invocations.
// Without this, every request would open a new MongoDB connection.
let cached = global._mongooseConnection;

const connectDB = async () => {
    if (cached && mongoose.connection.readyState === 1) return;

    try {
        cached = await mongoose.connect(process.env.MONGO_URI);
        global._mongooseConnection = cached;
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        // Don't call process.exit(1) — it would kill the Vercel function.
        throw err;
    }
};

module.exports = connectDB;
