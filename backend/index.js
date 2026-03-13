require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const rankingsRoutes = require('./routes/rankings');

const app = express();

// Connect to MongoDB (cached for Vercel serverless cold starts)
connectDB();

// ── CORS ─────────────────────────────────────────────────────
// Allow any Vercel preview URL + the production frontend URL.
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        // Allow any vercel.app domain (covers preview deployments)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Allow explicitly listed origins from env
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow localhost in development
        if (origin.startsWith('http://localhost')) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rankings', rankingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start server (local dev only) ────────────────────────────
// On Vercel, the app is exported as a serverless function.
// app.listen is not needed (and would fail) in that environment.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// ── Export for Vercel serverless ─────────────────────────────
module.exports = app;
