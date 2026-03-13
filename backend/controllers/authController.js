const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, handles } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            handles: handles || {},
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            handles: user.handles,
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            handles: user.handles,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

// Logout
exports.logout = (req, res) => {
    res.cookie('token', '', { maxAge: 0 });
    res.json({ message: 'Logged out successfully.' });
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// Update handles
exports.updateHandles = async (req, res) => {
    try {
        const { handles } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { handles },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error('Update handles error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
};
